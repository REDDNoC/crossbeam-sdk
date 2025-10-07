import { ChainType, BridgeConfig, CrossChainTransaction, TransactionStatus } from '../types';

/**
 * Base Bridge class for cross-chain operations
 */
export abstract class BaseBridge {
  protected config: BridgeConfig;

  constructor(config: BridgeConfig) {
    this.config = config;
  }

  /**
   * Initialize the bridge
   */
  abstract initialize(): Promise<void>;

  /**
   * Transfer tokens from source to target chain
   */
  abstract transfer(
    amount: string,
    recipient: string,
    sender: string
  ): Promise<CrossChainTransaction>;

  /**
   * Get transaction status
   */
  abstract getTransactionStatus(txId: string): Promise<TransactionStatus>;

  /**
   * Get bridge liquidity
   */
  abstract getLiquidity(): Promise<{ available: string; total: string }>;
}
