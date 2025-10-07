import { ChainType, BridgeConfig, CrossChainTransaction } from '../types';
import { BaseBridge, EthereumBridge, SolanaBridge, XRPLBridge } from '../bridges';
import { ChainlinkOracle } from '../oracles';

/**
 * Main SDK configuration
 */
export interface CrossbeamSDKConfig {
  bridges?: {
    ethereum?: BridgeConfig;
    solana?: BridgeConfig;
    xrpl?: BridgeConfig;
  };
  oracleUpdateInterval?: number;
}

/**
 * Crossbeam SDK - Cross-Chain Settlement SDK
 */
export class CrossbeamSDK {
  private bridges: Map<ChainType, BaseBridge>;
  private oracle: ChainlinkOracle;
  private initialized: boolean = false;

  constructor(private config: CrossbeamSDKConfig) {
    this.bridges = new Map();
    this.oracle = new ChainlinkOracle(config.oracleUpdateInterval);
  }

  /**
   * Initialize the SDK
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize bridges
    if (this.config.bridges?.ethereum) {
      const bridge = new EthereumBridge(this.config.bridges.ethereum);
      await bridge.initialize();
      this.bridges.set(ChainType.ETHEREUM, bridge);
    }

    if (this.config.bridges?.solana) {
      const bridge = new SolanaBridge(this.config.bridges.solana);
      await bridge.initialize();
      this.bridges.set(ChainType.SOLANA, bridge);
    }

    if (this.config.bridges?.xrpl) {
      const bridge = new XRPLBridge(this.config.bridges.xrpl);
      await bridge.initialize();
      this.bridges.set(ChainType.XRPL, bridge);
    }

    this.initialized = true;
  }

  /**
   * Get a bridge for a specific chain
   */
  getBridge(chainType: ChainType): BaseBridge | undefined {
    return this.bridges.get(chainType);
  }

  /**
   * Transfer tokens between chains
   */
  async transfer(
    sourceChain: ChainType,
    targetChain: ChainType,
    amount: string,
    sender: string,
    recipient: string
  ): Promise<CrossChainTransaction> {
    if (!this.initialized) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    const bridge = this.bridges.get(sourceChain);
    if (!bridge) {
      throw new Error(`Bridge for ${sourceChain} not configured`);
    }

    return bridge.transfer(amount, recipient, sender);
  }

  /**
   * Get price feed from oracle
   */
  async getPrice(symbol: string) {
    return this.oracle.getPrice(symbol);
  }

  /**
   * Get multiple price feeds
   */
  async getPrices(symbols: string[]) {
    return this.oracle.getPrices(symbols);
  }

  /**
   * Subscribe to price updates
   */
  subscribeToPriceUpdates(symbol: string, callback: (feed: any) => void) {
    return this.oracle.subscribe(symbol, callback);
  }

  /**
   * Get all configured bridges
   */
  getConfiguredBridges(): ChainType[] {
    return Array.from(this.bridges.keys());
  }
}
