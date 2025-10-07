# crossbeam-sdk

Cross-Chain Settlement SDK for Developers: Developer SDK enabling cross-chain interoperability and liquidity settlement between DAMA and external blockchains (e.g. XRPL, Solana, Ethereum). Includes smart contract templates, liquidity bridges, and oracle integration.

## Features

- 🌉 **Cross-Chain Bridges**: Seamless token transfers between DAMA, Ethereum, Solana, and XRPL
- 💱 **Liquidity Pools**: AMM-style liquidity pools for cross-chain swaps
- 📊 **Oracle Integration**: Real-time price feeds via Chainlink oracles
- 🔗 **GraphQL API**: Query and manage cross-chain transactions
- 📜 **Smart Contract Templates**: Production-ready contracts for Ethereum (Solidity) and Solana (Rust)
- 🛠️ **Developer-Friendly**: TypeScript SDK with comprehensive type definitions

## Installation

```bash
npm install crossbeam-sdk
```

## Quick Start

```typescript
import { CrossbeamSDK, ChainType } from 'crossbeam-sdk';

// Initialize the SDK
const sdk = new CrossbeamSDK({
  bridges: {
    ethereum: {
      sourceChain: ChainType.ETHEREUM,
      targetChain: ChainType.DAMA,
      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
      contractAddress: '0x...',
    },
    solana: {
      sourceChain: ChainType.SOLANA,
      targetChain: ChainType.DAMA,
      rpcUrl: 'https://api.mainnet-beta.solana.com',
    },
  },
});

await sdk.initialize();

// Transfer tokens
const tx = await sdk.transfer(
  ChainType.ETHEREUM,
  ChainType.DAMA,
  '1000000000000000000', // 1 ETH
  '0xSenderAddress',
  'damaRecipientAddress'
);

// Get price feeds
const price = await sdk.getPrice('ETH/USD');
console.log(`ETH Price: $${price.price}`);
```

## Architecture

### Core Components

#### 1. Bridges
Cross-chain bridge implementations for each supported blockchain:

- **EthereumBridge**: Ethereum ↔ DAMA transfers
- **SolanaBridge**: Solana ↔ DAMA transfers
- **XRPLBridge**: XRPL ↔ DAMA transfers

#### 2. Oracles
Price feed integration for accurate token valuations:

- **ChainlinkOracle**: Decentralized price feeds

#### 3. Smart Contracts

**Ethereum (Solidity)**:
- `CrossChainBridge.sol`: Lock/unlock mechanism for cross-chain transfers
- `LiquidityPool.sol`: AMM-style liquidity pool

**Solana (Rust)**:
- `bridge.rs`: Cross-chain bridge program

#### 4. GraphQL API
Query and manage cross-chain operations:

```graphql
mutation InitiateBridge {
  initiateBridge(input: {
    sourceChain: ETHEREUM
    targetChain: DAMA
    amount: "1000000000000000000"
    sender: "0xSenderAddress"
    recipient: "damaRecipientAddress"
  }) {
    id
    status
    timestamp
  }
}
```

## API Reference

### CrossbeamSDK

Main SDK class for cross-chain operations.

#### Constructor

```typescript
new CrossbeamSDK(config: CrossbeamSDKConfig)
```

#### Methods

- `initialize(): Promise<void>` - Initialize all configured bridges
- `transfer(sourceChain, targetChain, amount, sender, recipient): Promise<CrossChainTransaction>` - Transfer tokens between chains
- `getPrice(symbol): Promise<PriceFeed>` - Get current price for a symbol
- `getPrices(symbols): Promise<PriceFeed[]>` - Get multiple price feeds
- `subscribeToPriceUpdates(symbol, callback): UnsubscribeFn` - Subscribe to price updates

### Types

```typescript
enum ChainType {
  DAMA = 'dama',
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  XRPL = 'xrpl',
}

enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

interface CrossChainTransaction {
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
```

## Examples

See the `examples/` directory for complete working examples:

- `basic-usage.ts`: Basic SDK usage
- `graphql-server.ts`: GraphQL server setup

## Smart Contract Deployment

### Ethereum

```bash
# Deploy CrossChainBridge
npx hardhat run scripts/deploy-bridge.js --network mainnet

# Deploy LiquidityPool
npx hardhat run scripts/deploy-pool.js --network mainnet
```

### Solana

```bash
cd contracts/rust
cargo build-bpf
solana program deploy target/deploy/crossbeam_bridge_solana.so
```

## Development

```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Security Considerations

⚠️ **Important**: This SDK is provided as-is. Before using in production:

1. Audit all smart contracts
2. Test thoroughly on testnets
3. Use secure key management
4. Implement proper access controls
5. Monitor bridge operations

## Supported Chains

- ✅ Ethereum (mainnet, testnets)
- ✅ Solana (mainnet-beta, devnet)
- ✅ XRPL (mainnet, testnet)
- ✅ DAMA (custom chain)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📚 Documentation: [docs/](docs/)
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/REDDNoC/crossbeam-sdk/issues)

## Roadmap

- [ ] Additional chain support (Avalanche, Polygon, BSC)
- [ ] Advanced AMM features (concentrated liquidity)
- [ ] Cross-chain messaging protocol
- [ ] Mobile SDK (React Native)
- [ ] Governance module

---

Built with ❤️ by REDDNoC