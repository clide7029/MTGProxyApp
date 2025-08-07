import { ScryfallCard, ScryfallList, CardSearchParams, CollectionQuery, AutocompleteOptions, ScryfallLegalities } from './types';
import { ScryfallClient } from './scryfall-client';
import { CacheService } from '../cache/cache-service';
import { singleton } from 'tsyringe';

@singleton()
export class ScryfallService {
  private client: ScryfallClient;
  private cache: CacheService;

  constructor(client: ScryfallClient, cache: CacheService) {
    this.client = client;
    this.cache = cache;
  }

  /**
   * Search for cards using Scryfall's search syntax
   */
  async searchCards(params: CardSearchParams): Promise<ScryfallList<ScryfallCard>> {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = await this.cache.get<ScryfallList<ScryfallCard>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await this.client.searchCards(params);
    await this.cache.set(cacheKey, result, 3600); // Cache for 1 hour
    return result;
  }

  /**
   * Get a specific card by its Scryfall ID
   */
  async getCard(id: string): Promise<ScryfallCard> {
    const cacheKey = `card:${id}`;
    const cached = await this.cache.get<ScryfallCard>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const card = await this.client.getCard(id);
    await this.cache.set(cacheKey, card, 86400); // Cache for 24 hours
    return card;
  }

  /**
   * Get multiple cards by their identifiers
   */
  async getCollection(query: CollectionQuery): Promise<ScryfallCard[]> {
    const cacheKey = `collection:${JSON.stringify(query)}`;
    const cached = await this.cache.get<ScryfallCard[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const cards = await this.client.getCollection(query);
    await this.cache.set(cacheKey, cards, 3600); // Cache for 1 hour
    return cards;
  }

  /**
   * Get card name autocomplete suggestions
   */
  async autocomplete(options: AutocompleteOptions): Promise<string[]> {
    const cacheKey = `autocomplete:${JSON.stringify(options)}`;
    const cached = await this.cache.get<string[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const suggestions = await this.client.autocomplete(options);
    await this.cache.set(cacheKey, suggestions, 3600); // Cache for 1 hour
    return suggestions;
  }

  /**
   * Get all printings of a card by its Oracle ID
   */
  async getPrints(oracleId: string): Promise<ScryfallCard[]> {
    const cacheKey = `prints:${oracleId}`;
    const cached = await this.cache.get<ScryfallCard[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const prints = await this.client.getPrints(oracleId);
    await this.cache.set(cacheKey, prints, 86400); // Cache for 24 hours
    return prints;
  }

  /**
   * Check if a card is legal in a given format
   */
  isLegalIn(card: ScryfallCard, format: string): boolean {
    const formatKey = format.toLowerCase() as keyof ScryfallLegalities;
    return card.legalities[formatKey] === 'legal';
  }

  /**
   * Get the lowest USD price for a card (including non-foil and foil variants)
   */
  getLowestPrice(card: ScryfallCard): number | null {
    const prices = [
      card.prices.usd ? parseFloat(card.prices.usd) : null,
      card.prices.usd_foil ? parseFloat(card.prices.usd_foil) : null
    ].filter((price): price is number => price !== null);

    return prices.length > 0 ? Math.min(...prices) : null;
  }

  /**
   * Get all unique artworks for a card by its name
   */
  async getArtworks(cardName: string): Promise<ScryfallCard[]> {
    const params: CardSearchParams = {
      q: `!"${cardName}" unique:art`,
      unique: 'art'
    };

    const results = await this.searchCards(params);
    return results.data;
  }

  /**
   * Get random cards matching search criteria
   */
  async getRandomCards(query: string, count: number = 1): Promise<ScryfallCard[]> {
    const cacheKey = `random:${query}:${count}`;
    const cached = await this.cache.get<ScryfallCard[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const cards = await this.client.getRandomCards(query, count);
    await this.cache.set(cacheKey, cards, 300); // Cache for 5 minutes
    return cards;
  }
}