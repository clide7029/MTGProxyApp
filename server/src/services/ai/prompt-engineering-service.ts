import { singleton } from 'tsyringe';
import OpenAI from 'openai';
import { DeckAnalysis } from '../deck/deck-analysis-service';
import { ScryfallCard } from '../scryfall/types';

interface ThemePromptOptions {
  originalCard: ScryfallCard;
  deckAnalysis: DeckAnalysis;
  themeName: string;
  preserveGameplay?: boolean;
  creativityLevel?: number; // 0-1, affects temperature
  complexity?: 'simple' | 'moderate' | 'complex';
}

interface CardVariation {
  name: string;
  manaCost: string;
  typeLine: string;
  oracleText: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  flavorText?: string;
  reasoningExplanation: string;
}

@singleton()
export class PromptEngineeringService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate a themed variation of a card
   */
  async generateThemedVariation(options: ThemePromptOptions): Promise<CardVariation> {
    const prompt = this.constructCardPrompt(options);
    const systemPrompt = this.constructSystemPrompt(options);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: this.calculateTemperature(options),
      max_tokens: 1000,
      n: 1,
      stream: false,
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseResponse(content);
  }

  /**
   * Generate multiple variations with different approaches
   */
  async generateVariations(options: ThemePromptOptions, count: number = 3): Promise<CardVariation[]> {
    const variations: CardVariation[] = [];
    const approaches = [
      { preserveGameplay: true, creativityLevel: 0.3 },
      { preserveGameplay: true, creativityLevel: 0.7 },
      { preserveGameplay: false, creativityLevel: 0.9 }
    ];

    for (let i = 0; i < count; i++) {
      const approach = approaches[i % approaches.length];
      const variation = await this.generateThemedVariation({
        ...options,
        ...approach
      });
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Construct the main card generation prompt
   */
  private constructCardPrompt(options: ThemePromptOptions): string {
    const { originalCard, deckAnalysis, themeName, preserveGameplay } = options;

    let prompt = `Create a ${themeName}-themed version of the following Magic: The Gathering card:

Original Card:
Name: ${originalCard.name}
Mana Cost: ${originalCard.mana_cost || ''}
Type Line: ${originalCard.type_line}
Oracle Text: ${originalCard.oracle_text || ''}
${originalCard.power ? `Power/Toughness: ${originalCard.power}/${originalCard.toughness}\n` : ''}
${originalCard.loyalty ? `Loyalty: ${originalCard.loyalty}\n` : ''}

Deck Context:
- Main themes: ${Object.entries(deckAnalysis.themeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme]) => theme)
    .join(', ')}
- Primary mechanics: ${Object.entries(deckAnalysis.mechanicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mechanic]) => mechanic)
    .join(', ')}
- Color distribution: ${Object.entries(deckAnalysis.colorDistribution)
    .map(([color, count]) => `${color}: ${count}`)
    .join(', ')}

Requirements:
${preserveGameplay 
  ? '- Maintain similar power level and gameplay impact\n- Keep the same mana cost and card type'
  : '- Focus on creative theme integration\n- Power level can be adjusted for theme'
}
- Incorporate ${themeName} theme naturally
- Maintain color identity
- Preserve strategic role in deck
- Use proper Magic: The Gathering syntax
- Include creative flavor text that ties to the theme

Please provide a complete card design that feels like a natural Magic: The Gathering card while incorporating the ${themeName} theme.`;

    return prompt;
  }

  /**
   * Construct the system prompt for consistent formatting
   */
  private constructSystemPrompt(options: ThemePromptOptions): string {
    return `You are an expert Magic: The Gathering card designer and creative writer.
Your task is to create themed variations of existing cards that:
1. Feel authentic to Magic: The Gathering
2. Use proper card templating and syntax
3. Maintain game balance ${options.preserveGameplay ? 'strictly' : 'reasonably'}
4. Incorporate the theme naturally and creatively
5. Consider the deck context and synergies

Respond with card variations in this format:
Name: [card name]
Mana Cost: [mana cost]
Type Line: [type line]
Oracle Text: [rules text]
${options.originalCard.power ? 'Power/Toughness: [P/T]\n' : ''}
${options.originalCard.loyalty ? 'Loyalty: [loyalty]\n' : ''}
Flavor Text: [flavor text]

Reasoning: [brief explanation of design choices and theme integration]`;
  }

  /**
   * Calculate appropriate temperature based on creativity level
   */
  private calculateTemperature(options: ThemePromptOptions): number {
    const baseTemp = 0.7;
    const creativityMod = (options.creativityLevel || 0.5) * 0.6;
    return Math.min(1, Math.max(0, baseTemp + creativityMod));
  }

  /**
   * Parse the OpenAI response into a structured card variation
   */
  private parseResponse(response: string): CardVariation {
    const lines = response.split('\n');
    const card: Partial<CardVariation> = {};
    let inReasoning = false;
    let reasoningText = '';

    for (const line of lines) {
      if (line.startsWith('Reasoning:')) {
        inReasoning = true;
        continue;
      }

      if (inReasoning) {
        reasoningText += line + ' ';
        continue;
      }

      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      switch (key.trim()) {
        case 'Name':
          card.name = value;
          break;
        case 'Mana Cost':
          card.manaCost = value;
          break;
        case 'Type Line':
          card.typeLine = value;
          break;
        case 'Oracle Text':
          card.oracleText = value;
          break;
        case 'Power/Toughness':
          const [power, toughness] = value.split('/');
          card.power = power.trim();
          card.toughness = toughness.trim();
          break;
        case 'Loyalty':
          card.loyalty = value;
          break;
        case 'Flavor Text':
          card.flavorText = value;
          break;
      }
    }

    return {
      ...card,
      reasoningExplanation: reasoningText.trim()
    } as CardVariation;
  }
}