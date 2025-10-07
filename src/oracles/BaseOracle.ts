import { PriceFeed } from '../types';

/**
 * Base Oracle class for price feeds
 */
export abstract class BaseOracle {
  protected updateInterval: number;

  constructor(updateInterval: number = 60000) {
    this.updateInterval = updateInterval;
  }

  /**
   * Get current price for a symbol
   */
  abstract getPrice(symbol: string): Promise<PriceFeed>;

  /**
   * Get multiple prices
   */
  abstract getPrices(symbols: string[]): Promise<PriceFeed[]>;

  /**
   * Subscribe to price updates
   */
  abstract subscribe(
    symbol: string,
    callback: (feed: PriceFeed) => void
  ): () => void;
}
