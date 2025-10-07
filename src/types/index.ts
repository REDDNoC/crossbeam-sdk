/**
 * Chain types supported by the Crossbeam SDK
 */
export enum ChainType {
  DAMA = 'dama',
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  XRPL = 'xrpl',
}

/**
 * Transaction status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

/**
 * Bridge configuration
 */
export interface BridgeConfig {
  sourceChain: ChainType;
  targetChain: ChainType;
  contractAddress?: string;
  rpcUrl: string;
}

/**
 * Cross-chain transaction
 */
export interface CrossChainTransaction {
  id: string;
  sourceChain: ChainType;
  targetChain: ChainType;
  amount: string;
  sender: string;
  recipient: string;
  status: TransactionStatus;
  timestamp: number;
  txHash?: string;
}

/**
 * Oracle price feed
 */
export interface PriceFeed {
  symbol: string;
  price: number;
  timestamp: number;
  source: string;
}

/**
 * Liquidity pool info
 */
export interface LiquidityPool {
  id: string;
  chain: ChainType;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  totalLiquidity: string;
}
