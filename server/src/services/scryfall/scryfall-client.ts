import { ScryfallCard, ScryfallList, CardSearchParams, CollectionQuery, AutocompleteOptions } from './types';
import axios from 'axios';
import { singleton } from 'tsyringe';
import { RateLimiter } from './rate-limiter';

@singleton()
export class ScryfallClient {
  private baseUrl = 'https://api.scryfall.com';
  private rateLimiter: RateLimiter;

  constructor() {
    this.rateLimiter = new RateLimiter(10, 1000); // 10 requests per second
  }

  private async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    await this.rateLimiter.acquire();
    try {
      const { data } = await axios.get(`${this.baseUrl}${endpoint}`, { params });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Scryfall API error: ${error.response.data.details}`);
      }
      throw error;
    }
  }

  async searchCards(params: CardSearchParams): Promise<ScryfallList<ScryfallCard>> {
    return this.request<ScryfallList<ScryfallCard>>('/cards/search', params);
  }

  async getCard(id: string): Promise<ScryfallCard> {
    return this.request<ScryfallCard>(`/cards/${id}`);
  }

  async getCollection(query: CollectionQuery): Promise<ScryfallCard[]> {
    const response = await this.request<ScryfallList<ScryfallCard>>('/cards/collection', query);
    return response.data;
  }

  async autocomplete(options: AutocompleteOptions): Promise<string[]> {
    const response = await this.request<{ data: string[] }>('/cards/autocomplete', options);
    return response.data;
  }

  async getPrints(oracleId: string): Promise<ScryfallCard[]> {
    const response = await this.request<ScryfallList<ScryfallCard>>(`/cards/search`, {
      q: `oracle_id:${oracleId}`,
      unique: 'prints'
    });
    return response.data;
  }

  async getRandomCard(query?: string): Promise<ScryfallCard> {
    return this.request<ScryfallCard>('/cards/random', query ? { q: query } : undefined);
  }

  async getRandomCards(query: string, count: number): Promise<ScryfallCard[]> {
    const cards: ScryfallCard[] = [];
    for (let i = 0; i < count; i++) {
      const card = await this.getRandomCard(query);
      cards.push(card);
    }
    return cards;
  }
}