import { 
  ProxyCard, 
  ScryfallCard, 
  ThemeConfiguration, 
  DeckStatus,
  ProxyStatus 
} from '@mtg-proxy-app/shared';
import { AppError } from '../utils/errors';
import { OpenAIService } from './openai';
import { ScryfallService } from './scryfall';

export class CardProcessorService {
  private static instance: CardProcessorService;
  private openai: OpenAIService;
  private scryfall: ScryfallService;

  private constructor() {
    this.openai = OpenAIService.getInstance();
    this.scryfall = ScryfallService.getInstance();
  }

  static getInstance(): CardProcessorService {
    if (!CardProcessorService.instance) {
      CardProcessorService.instance = new CardProcessorService();
    }
    return CardProcessorService.instance;
  }

  async processDecklist(
    decklist: string,
    theme: ThemeConfiguration
  ): Promise<ProxyCard[]> {
    try {
      // Validate and parse decklist
      const cardNames = await this.scryfall.validateDecklist(decklist);

      // Fetch card data from Scryfall
      const scryfallCards = await this.scryfall.getCardsByNames(cardNames);

      // Process cards in batches
      const proxyCards: ProxyCard[] = [];
      
      for (const card of scryfallCards) {
        try {
          const proxy = await this.processCard(card, theme);
          proxyCards.push(proxy);
        } catch (error) {
          console.error(`Failed to process card ${card.name}:`, error);
          // Add failed card with error status
          proxyCards.push(this.createErrorProxy(card));
        }
      }

      return proxyCards;
    } catch (error) {
      console.error('Card processing error:', error);
      throw new AppError(
        'PROCESSING_ERROR',
        'Failed to process decklist'
      );
    }
  }

  async processCard(
    card: ScryfallCard,
    theme: ThemeConfiguration
  ): Promise<ProxyCard> {
    try {
      // Generate themed content
      const themeResult = await this.openai.generateThemeForCard(card, theme);

      return {
        id: `proxy_${card.id}`,
        deckId: '', // To be set by the deck service
        originalCard: card,
        thematicName: themeResult.thematicName,
        flavorText: themeResult.flavorText,
        artPrompt: themeResult.artPrompt,
        status: ProxyStatus.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error(`Failed to theme card ${card.name}:`, error);
      throw new AppError(
        'THEME_GENERATION_ERROR',
        `Failed to generate theme for ${card.name}`
      );
    }
  }

  async rerollCard(
    proxy: ProxyCard,
    theme: ThemeConfiguration,
    aspects: string[]
  ): Promise<ProxyCard> {
    try {
      // Generate new themed content
      const themeResult = await this.openai.generateThemeForCard(
        proxy.originalCard,
        theme
      );

      // Update only the requested aspects
      return {
        ...proxy,
        thematicName: aspects.includes('name') 
          ? themeResult.thematicName 
          : proxy.thematicName,
        flavorText: aspects.includes('flavor') 
          ? themeResult.flavorText 
          : proxy.flavorText,
        artPrompt: aspects.includes('art') 
          ? themeResult.artPrompt 
          : proxy.artPrompt,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error(`Failed to reroll card ${proxy.originalCard.name}:`, error);
      throw new AppError(
        'REROLL_ERROR',
        `Failed to reroll card ${proxy.originalCard.name}`
      );
    }
  }

  private createErrorProxy(card: ScryfallCard): ProxyCard {
    return {
      id: `proxy_${card.id}`,
      deckId: '',
      originalCard: card,
      thematicName: card.name,
      flavorText: 'Error generating themed content',
      artPrompt: '',
      status: ProxyStatus.ERROR,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}