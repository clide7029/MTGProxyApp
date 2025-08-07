/**
 * Simple token bucket rate limiter implementation
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;

  /**
   * @param maxTokens Maximum number of tokens in the bucket (max requests per interval)
   * @param interval Time in milliseconds to refill tokens
   */
  constructor(maxTokens: number, interval: number) {
    this.maxTokens = maxTokens;
    this.refillRate = interval;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.refillRate) * this.maxTokens;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Acquire a token from the bucket
   * @returns Promise that resolves when a token is available
   */
  async acquire(): Promise<void> {
    while (true) {
      this.refill();
      
      if (this.tokens > 0) {
        this.tokens--;
        return;
      }

      // Wait for refill interval before checking again
      await new Promise(resolve => setTimeout(resolve, this.refillRate));
    }
  }
}