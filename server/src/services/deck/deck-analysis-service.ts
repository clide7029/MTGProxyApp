import { singleton } from 'tsyringe';
import { ScryfallService } from '../scryfall/scryfall-service';
import { ScryfallCard } from '../scryfall/types';

interface CardAnalysis {
  card: ScryfallCard;
  keywords: string[];
  mechanics: string[];
  themes: string[];
  colorIdentity: string[];
  power?: number;
  toughness?: number;
  cmc: number;
  types: string[];
  subtypes: string[];
}

export interface DeckAnalysis {
  averageCmc: number;
  colorDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  keywordFrequency: Record<string, number>;
  mechanicFrequency: Record<string, number>;
  themeFrequency: Record<string, number>;
  powerCurve: Record<number, number>;
  synergies: Array<{
    cards: string[];
    description: string;
    strength: number;
  }>;
}

@singleton()
export class DeckAnalysisService {
  constructor(private scryfallService: ScryfallService) {}

  /**
   * Analyze a deck from a list of card identifiers
   */
  async analyzeDeck(cardIds: string[]): Promise<DeckAnalysis> {
    const cards = await this.scryfallService.getCollection({ identifiers: cardIds.map(id => ({ id })) });
    const analyses = await Promise.all(cards.map(card => this.analyzeCard(card)));
    return this.aggregateAnalyses(analyses);
  }

  /**
   * Analyze a single card's characteristics
   */
  private async analyzeCard(card: ScryfallCard): Promise<CardAnalysis> {
    const typeLine = card.type_line.toLowerCase();
    const types = this.extractTypes(typeLine);
    const subtypes = this.extractSubtypes(typeLine);
    
    return {
      card,
      keywords: card.keywords,
      mechanics: this.extractMechanics(card),
      themes: this.extractThemes(card),
      colorIdentity: card.color_identity,
      power: card.power ? parseInt(card.power) : undefined,
      toughness: card.toughness ? parseInt(card.toughness) : undefined,
      cmc: card.cmc,
      types,
      subtypes
    };
  }

  /**
   * Extract card mechanics from oracle text and type line
   */
  private extractMechanics(card: ScryfallCard): string[] {
    const mechanics: Set<string> = new Set(card.keywords);
    const text = card.oracle_text?.toLowerCase() || '';

    // Common mechanic patterns
    const mechanicPatterns = [
      /when ~ enters the battlefield/,
      /when ~ dies/,
      /when ~ attacks/,
      /when ~ blocks/,
      /at the beginning of (your|each|the) (upkeep|end step)/,
      /sacrifice ~/,
      /counter target/,
      /destroy target/,
      /exile target/,
      /draw (a|[0-9]+) cards?/
    ];

    mechanicPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        mechanics.add(pattern.toString().replace(/[/~]/g, '').trim());
      }
    });

    return Array.from(mechanics);
  }

  /**
   * Extract themes based on card characteristics
   */
  private extractThemes(card: ScryfallCard): string[] {
    const themes: Set<string> = new Set();
    const text = card.oracle_text?.toLowerCase() || '';
    const typeLine = card.type_line.toLowerCase();

    // Theme detection patterns
    const themePatterns = [
      { pattern: /(create|creature token)/g, theme: 'tokens' },
      { pattern: /(counter.*spell|can't be countered)/g, theme: 'control' },
      { pattern: /(graveyard|dies|sacrifice)/g, theme: 'graveyard' },
      { pattern: /(draw.*card|library|scry|surveil)/g, theme: 'card_advantage' },
      { pattern: /(destroy|exile|remove)/g, theme: 'removal' },
      { pattern: /(attack|combat|fight)/g, theme: 'combat' },
      { pattern: /(life|gain|lose)/g, theme: 'life' },
      { pattern: /(counter.*creature|\\+1|\\-1)/g, theme: 'counters' }
    ];

    themePatterns.forEach(({ pattern, theme }) => {
      if (pattern.test(text)) {
        themes.add(theme);
      }
    });

    // Add tribal themes based on creature types
    const tribalTypes = this.extractSubtypes(typeLine);
    if (tribalTypes.length > 0) {
      themes.add('tribal');
      tribalTypes.forEach(type => themes.add(`tribal_${type}`));
    }

    return Array.from(themes);
  }

  /**
   * Extract main types from type line
   */
  private extractTypes(typeLine: string): string[] {
    const mainTypes = [
      'creature',
      'artifact',
      'enchantment',
      'planeswalker',
      'instant',
      'sorcery',
      'land'
    ];
    return mainTypes.filter(type => typeLine.includes(type));
  }

  /**
   * Extract subtypes from type line
   */
  private extractSubtypes(typeLine: string): string[] {
    const parts = typeLine.split('—');
    if (parts.length < 2) return [];
    
    return parts[1]
      .trim()
      .toLowerCase()
      .split(' ')
      .filter(type => type.length > 0);
  }

  /**
   * Aggregate individual card analyses into deck analysis
   */
  private aggregateAnalyses(analyses: CardAnalysis[]): DeckAnalysis {
    const totalCards = analyses.length;
    
    // Initialize distributions
    const colorDist: Record<string, number> = {};
    const typeDist: Record<string, number> = {};
    const keywordFreq: Record<string, number> = {};
    const mechanicFreq: Record<string, number> = {};
    const themeFreq: Record<string, number> = {};
    const powerCurve: Record<number, number> = {};
    
    // Calculate distributions
    let totalCmc = 0;
    analyses.forEach(analysis => {
      // CMC
      totalCmc += analysis.cmc;
      
      // Colors
      analysis.colorIdentity.forEach(color => {
        colorDist[color] = (colorDist[color] || 0) + 1;
      });
      
      // Types
      analysis.types.forEach(type => {
        typeDist[type] = (typeDist[type] || 0) + 1;
      });
      
      // Keywords
      analysis.keywords.forEach(keyword => {
        keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
      });
      
      // Mechanics
      analysis.mechanics.forEach(mechanic => {
        mechanicFreq[mechanic] = (mechanicFreq[mechanic] || 0) + 1;
      });
      
      // Themes
      analysis.themes.forEach(theme => {
        themeFreq[theme] = (themeFreq[theme] || 0) + 1;
      });
      
      // Power curve (for creatures)
      if (analysis.power !== undefined) {
        powerCurve[analysis.cmc] = (powerCurve[analysis.cmc] || 0) + 1;
      }
    });

    // Detect synergies between cards
    const synergies = this.detectSynergies(analyses);

    return {
      averageCmc: totalCmc / totalCards,
      colorDistribution: colorDist,
      typeDistribution: typeDist,
      keywordFrequency: keywordFreq,
      mechanicFrequency: mechanicFreq,
      themeFrequency: themeFreq,
      powerCurve,
      synergies
    };
  }

  /**
   * Detect synergies between cards in the deck
   */
  private detectSynergies(analyses: CardAnalysis[]): Array<{ cards: string[]; description: string; strength: number }> {
    const synergies: Array<{ cards: string[]; description: string; strength: number }> = [];
    
    // Theme-based synergies
    const themeGroups = new Map<string, CardAnalysis[]>();
    analyses.forEach(analysis => {
      analysis.themes.forEach(theme => {
        if (!themeGroups.has(theme)) {
          themeGroups.set(theme, []);
        }
        themeGroups.get(theme)!.push(analysis);
      });
    });

    // Add synergies for themes with multiple cards
    themeGroups.forEach((cards, theme) => {
      if (cards.length >= 3) {
        synergies.push({
          cards: cards.map(c => c.card.name),
          description: `${theme.replace('_', ' ')} synergy`,
          strength: cards.length / analyses.length
        });
      }
    });

    // Mechanic-based synergies
    const mechanicGroups = new Map<string, CardAnalysis[]>();
    analyses.forEach(analysis => {
      analysis.mechanics.forEach(mechanic => {
        if (!mechanicGroups.has(mechanic)) {
          mechanicGroups.set(mechanic, []);
        }
        mechanicGroups.get(mechanic)!.push(analysis);
      });
    });

    // Add synergies for mechanics with multiple cards
    mechanicGroups.forEach((cards, mechanic) => {
      if (cards.length >= 3) {
        synergies.push({
          cards: cards.map(c => c.card.name),
          description: `${mechanic} interaction`,
          strength: cards.length / analyses.length
        });
      }
    });

    return synergies.sort((a, b) => b.strength - a.strength);
  }
}