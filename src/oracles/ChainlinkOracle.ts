import { BaseOracle } from './BaseOracle';
import { PriceFeed } from '../types';

/**
 * Chainlink Oracle implementation for price feeds
 */
export class ChainlinkOracle extends BaseOracle {
  private priceCache: Map<string, PriceFeed>;
  private subscribers: Map<string, Set<(feed: PriceFeed) => void>>;

  constructor(updateInterval?: number) {
    super(updateInterval);
    this.priceCache = new Map();
    this.subscribers = new Map();
  }

  async getPrice(symbol: string): Promise<PriceFeed> {
    // In a real implementation, this would fetch from Chainlink price feeds
    const cached = this.priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.updateInterval) {
      return cached;
    }

    const feed: PriceFeed = {
      symbol,
      price: this.generateMockPrice(symbol),
      timestamp: Date.now(),
      source: 'chainlink',
    };

    this.priceCache.set(symbol, feed);
    this.notifySubscribers(symbol, feed);

    return feed;
  }

  async getPrices(symbols: string[]): Promise<PriceFeed[]> {
    return Promise.all(symbols.map((symbol) => this.getPrice(symbol)));
  }

  subscribe(symbol: string, callback: (feed: PriceFeed) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }

    this.subscribers.get(symbol)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(symbol);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  private notifySubscribers(symbol: string, feed: PriceFeed): void {
    const subs = this.subscribers.get(symbol);
    if (subs) {
      subs.forEach((callback) => callback(feed));
    }
  }

  private generateMockPrice(symbol: string): number {
    // Mock price generation for demo purposes
    const basePrices: Record<string, number> = {
      'ETH/USD': 2000,
      'SOL/USD': 100,
      'XRP/USD': 0.5,
      'DAMA/USD': 1.0,
    };

    const basePrice = basePrices[symbol] || 1.0;
    const variance = (Math.random() - 0.5) * 0.02; // ±1% variance
    return basePrice * (1 + variance);
  }
}
