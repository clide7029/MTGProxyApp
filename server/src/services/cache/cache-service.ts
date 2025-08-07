import { singleton } from 'tsyringe';
import NodeCache from 'node-cache';

@singleton()
export class CacheService {
  private cache: NodeCache;

  constructor() {
    // Check items every 10 minutes, delete expired ones
    this.cache = new NodeCache({ 
      checkperiod: 600,
      useClones: false
    });
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found
   */
  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    this.cache.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    this.cache.del(key);
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    this.cache.flushAll();
  }

  /**
   * Get multiple values from cache
   * @param keys Array of cache keys
   * @returns Object with key-value pairs of found items
   */
  async getMany<T>(keys: string[]): Promise<Record<string, T>> {
    return this.cache.mget<T>(keys);
  }

  /**
   * Set multiple values in cache with TTL
   * @param items Object with key-value pairs to cache
   * @param ttl Time to live in seconds
   */
  async setMany<T>(items: Record<string, T>, ttl: number): Promise<void> {
    const success = this.cache.mset(
      Object.entries(items).map(([key, value]) => ({
        key,
        val: value,
        ttl
      }))
    );
    if (!success) {
      throw new Error('Failed to set multiple cache items');
    }
  }
}