import { singleton } from 'tsyringe';
import { DeckAnalysisService, DeckAnalysis } from '../deck/deck-analysis-service';
import { PromptEngineeringService } from '../ai/prompt-engineering-service';
import { ScryfallService } from '../scryfall/scryfall-service';
import { ScryfallCard } from '../scryfall/types';

interface ThemeGenerationOptions {
  cardIds: string[];
  themeName: string;
  preserveGameplay?: boolean;
  creativityLevel?: number;
  variationsPerCard?: number;
}

interface ThemeGenerationResult {
  deckAnalysis: DeckAnalysis;
  themedCards: Array<{
    originalCard: ScryfallCard;
    variations: Array<{
      name: string;
      manaCost: string;
      typeLine: string;
      oracleText: string;
      power?: string;
      toughness?: string;
      loyalty?: string;
      flavorText?: string;
      reasoningExplanation: string;
    }>;
  }>;
  themeContext: {
    name: string;
    description: string;
    dominantMechanics: string[];
    dominantThemes: string[];
    colorIdentity: string[];
    suggestedSubthemes: string[];
  };
}

@singleton()
export class ThemeGenerationService {
  constructor(
    private deckAnalysis: DeckAnalysisService,
    private promptEngineering: PromptEngineeringService,
    private scryfall: ScryfallService
  ) {}

  /**
   * Generate themed variations for an entire deck
   */
  async generateThemedDeck(options: ThemeGenerationOptions): Promise<ThemeGenerationResult> {
    // First, analyze the deck
    const analysis = await this.deckAnalysis.analyzeDeck(options.cardIds);

    // Generate context for the theme
    const themeContext = this.generateThemeContext(analysis, options.themeName);

    // Get all cards
    const cards = await this.scryfall.getCollection({ 
      identifiers: options.cardIds.map(id => ({ id }))
    });

    // Generate variations for each card
    const themedCards = await Promise.all(
      cards.map(async card => ({
        originalCard: card,
        variations: await this.promptEngineering.generateVariations({
          originalCard: card,
          deckAnalysis: analysis,
          themeName: options.themeName,
          preserveGameplay: options.preserveGameplay,
          creativityLevel: options.creativityLevel
        }, options.variationsPerCard || 3)
      }))
    );

    return {
      deckAnalysis: analysis,
      themedCards,
      themeContext
    };
  }

  /**
   * Generate variations for a single card within deck context
   */
  async generateThemedCard(
    cardId: string,
    deckCardIds: string[],
    options: Omit<ThemeGenerationOptions, 'cardIds'>
  ) {
    // Analyze the deck for context
    const analysis = await this.deckAnalysis.analyzeDeck(deckCardIds);
    
    // Get the card
    const card = await this.scryfall.getCard(cardId);

    // Generate variations
    const variations = await this.promptEngineering.generateVariations({
      originalCard: card,
      deckAnalysis: analysis,
      themeName: options.themeName,
      preserveGameplay: options.preserveGameplay,
      creativityLevel: options.creativityLevel
    }, options.variationsPerCard || 3);

    return {
      originalCard: card,
      variations,
      deckAnalysis: analysis,
      themeContext: this.generateThemeContext(analysis, options.themeName)
    };
  }

  /**
   * Generate theme context based on deck analysis
   */
  private generateThemeContext(analysis: DeckAnalysis, themeName: string) {
    // Get dominant mechanics and themes
    const dominantMechanics = Object.entries(analysis.mechanicFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([mechanic]) => mechanic);

    const dominantThemes = Object.entries(analysis.themeFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    // Get color identity
    const colorIdentity = Object.entries(analysis.colorDistribution)
      .sort(([, a], [, b]) => b - a)
      .map(([color]) => color);

    // Generate suggested subthemes based on deck composition
    const suggestedSubthemes = this.generateSubthemes(
      themeName,
      dominantThemes,
      dominantMechanics,
      colorIdentity
    );

    // Generate theme description
    const description = this.generateThemeDescription(
      themeName,
      dominantThemes,
      dominantMechanics,
      colorIdentity
    );

    return {
      name: themeName,
      description,
      dominantMechanics,
      dominantThemes,
      colorIdentity,
      suggestedSubthemes
    };
  }

  /**
   * Generate suggested subthemes based on deck characteristics
   */
  private generateSubthemes(
    themeName: string,
    themes: string[],
    mechanics: string[],
    colors: string[]
  ): string[] {
    const subthemes = new Set<string>();

    // Add color-based subthemes
    if (colors.length === 1) {
      subthemes.add(`Mono-${colors[0]} ${themeName}`);
    } else if (colors.length === 2) {
      subthemes.add(`${colors.join('/')} ${themeName}`);
    }

    // Add mechanic-based subthemes
    mechanics.forEach(mechanic => {
      subthemes.add(`${themeName} with ${mechanic}`);
    });

    // Add theme-based subthemes
    themes.forEach(theme => {
      subthemes.add(`${themeName} ${theme}`);
    });

    return Array.from(subthemes);
  }

  /**
   * Generate a description of the theme based on deck characteristics
   */
  private generateThemeDescription(
    themeName: string,
    themes: string[],
    mechanics: string[],
    colors: string[]
  ): string {
    const colorDesc = colors.length > 0
      ? `primarily utilizing ${colors.join('/')} mana`
      : 'spanning multiple colors';

    const mechanicsDesc = mechanics.length > 0
      ? `featuring ${mechanics.slice(0, 3).join(', ')} mechanics`
      : 'with various mechanical interactions';

    const themeDesc = themes.length > 0
      ? `emphasizing ${themes.slice(0, 3).join(', ')}`
      : 'incorporating diverse strategic elements';

    return `A ${themeName}-themed deck ${colorDesc}, ${mechanicsDesc}, and ${themeDesc}.`;
  }
}