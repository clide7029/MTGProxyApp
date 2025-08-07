import OpenAI from 'openai';
import { ProxyCard, ScryfallCard, ThemeConfiguration } from '@mtg-proxy-app/shared';
import { AppError } from '../utils/errors';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ThemeGenerationResult {
  thematicName: string;
  flavorText: string;
  artPrompt: string;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private batchSize: number = 10;

  private constructor() {}

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async generateThemeForCard(
    card: ScryfallCard,
    theme: ThemeConfiguration
  ): Promise<ThemeGenerationResult> {
    try {
      const prompt = this.buildPrompt(card, theme);
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new AppError('OPENAI_ERROR', 'Failed to generate themed content');
      }

      return this.parseResponse(result);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new AppError('OPENAI_ERROR', 'Failed to communicate with OpenAI API');
    }
  }

  async generateThemeForBatch(
    cards: ScryfallCard[],
    theme: ThemeConfiguration
  ): Promise<ThemeGenerationResult[]> {
    const results: ThemeGenerationResult[] = [];
    for (let i = 0; i < cards.length; i += this.batchSize) {
      const batch = cards.slice(i, i + this.batchSize);
      const batchResults = await Promise.all(
        batch.map(card => this.generateThemeForCard(card, theme))
      );
      results.push(...batchResults);
    }
    return results;
  }

  private getSystemPrompt(): string {
    return `You are a creative card designer tasked with transforming Magic: The Gathering cards into themed versions while maintaining their mechanical identity. Follow these rules:

1. Preserve the card's game mechanics and fundamental purpose
2. Ensure thematic consistency
3. Maintain proper naming conventions for card types:
   - Creatures should be characters
   - Artifacts should be objects
   - Spells should be actions or events
   - Lands and enchantments can be locations or concepts
4. For legendary creatures, use the format "Name, Title"
5. Create resonant flavor text that connects mechanics to theme
6. Generate clear art prompts in Midjourney format (--ar 3:5)

Provide responses in this format:
THEMATIC_NAME: [name]
FLAVOR_TEXT: [text]
ART_PROMPT: [prompt]`;
  }

  private buildPrompt(card: ScryfallCard, theme: ThemeConfiguration): string {
    return `Theme: ${theme.name}
${theme.setting ? `Setting: ${theme.setting}` : ''}

Card to convert:
Name: ${card.name}
Type: ${card.type_line}
Rules Text: ${card.oracle_text}
${card.power ? `Power/Toughness: ${card.power}/${card.toughness}` : ''}
${card.loyalty ? `Loyalty: ${card.loyalty}` : ''}

Special considerations:
- This is a ${card.type_line.toLowerCase()}
${this.getSpecificReference(card.name, theme)}

Please generate a thematic version of this card that fits within the ${theme.name} universe while maintaining its mechanical identity.`;
  }

  private getSpecificReference(cardName: string, theme: ThemeConfiguration): string {
    const specific = theme.specifics?.find(
      s => s.cardName.toLowerCase() === cardName.toLowerCase()
    );
    return specific
      ? `- Specific request: Reference "${specific.thematicReference}"`
      : '';
  }

  private parseResponse(response: string): ThemeGenerationResult {
    const thematicName = response.match(/THEMATIC_NAME: (.+)$/m)?.[1] || '';
    const flavorText = response.match(/FLAVOR_TEXT: (.+)$/m)?.[1] || '';
    const artPrompt = response.match(/ART_PROMPT: (.+)$/m)?.[1] || '';

    if (!thematicName || !flavorText || !artPrompt) {
      throw new AppError(
        'PARSE_ERROR',
        'Failed to parse OpenAI response into required format'
      );
    }

    return {
      thematicName: thematicName.trim(),
      flavorText: flavorText.trim(),
      artPrompt: artPrompt.trim()
    };
  }
}