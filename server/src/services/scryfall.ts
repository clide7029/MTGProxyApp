import axios from 'axios';
import { ScryfallCard } from '@mtg-proxy-app/shared';
import { AppError } from '../utils/errors';

interface ScryfallResponse {
  object: string;
  not_found?: string[];
  data?: ScryfallCard[];
}

export class ScryfallService {
  private static instance: ScryfallService;
  private baseUrl = 'https://api.scryfall.com';
  private batchSize = 75; // Scryfall's recommended batch size
  private delayBetweenBatches = 100; // ms delay between batch requests

  private constructor() {}

  static getInstance(): ScryfallService {
    if (!ScryfallService.instance) {
      ScryfallService.instance = new ScryfallService();
    }
    return ScryfallService.instance;
  }

  async getCardsByNames(cardNames: string[]): Promise<ScryfallCard[]> {
    try {
      const results: ScryfallCard[] = [];
      
      for (let i = 0; i < cardNames.length; i += this.batchSize) {
        const batch = cardNames.slice(i, i + this.batchSize);
        const batchResults = await this.fetchBatch(batch);
        results.push(...batchResults);

        // Add delay between batches
        if (i + this.batchSize < cardNames.length) {
          await new Promise(resolve => setTimeout(resolve, this.delayBetweenBatches));
        }
      }

      return results;
    } catch (error) {
      console.error('Scryfall API Error:', error);
      throw new AppError('SCRYFALL_ERROR', 'Failed to fetch cards from Scryfall');
    }
  }

  private async fetchBatch(cardNames: string[]): Promise<ScryfallCard[]> {
    const response = await axios.post<ScryfallResponse>(
      `${this.baseUrl}/cards/collection`,
      {
        identifiers: cardNames.map(name => ({ name }))
      }
    );

    if (response.data.not_found?.length) {
      throw new AppError(
        'INVALID_CARDS',
        `Some cards were not found: ${response.data.not_found.join(', ')}`
      );
    }

    return response.data.data || [];
  }

  async validateDecklist(decklist: string): Promise<string[]> {
    const cardNames = this.parseDecklist(decklist);
    
    if (cardNames.length === 0) {
      throw new AppError('INVALID_DECKLIST', 'No valid card entries found in decklist');
    }

    // Try to fetch a single card to validate format
    try {
      await this.getCardsByNames([cardNames[0]]);
      return cardNames;
    } catch (error) {
      throw new AppError('INVALID_DECKLIST', 'Invalid decklist format');
    }
  }

  private parseDecklist(decklist: string): string[] {
    // Split by newline and filter out empty lines
    const lines = decklist
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const cardNames: string[] = [];

    for (const line of lines) {
      // Handle common decklist formats:
      // "4 Lightning Bolt"
      // "4x Lightning Bolt"
      // "Lightning Bolt"
      const match = line.match(/^(?:\d+x?\s+)?(.+)$/);
      if (match && match[1]) {
        cardNames.push(match[1]);
      }
    }

    return cardNames;
  }
}