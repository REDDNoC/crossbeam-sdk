# API Reference

Complete API documentation for the Crossbeam SDK.

## Table of Contents

- [CrossbeamSDK](#crossbeamsdk)
- [Bridges](#bridges)
- [Oracles](#oracles)
- [Types](#types)
- [Utilities](#utilities)
- [GraphQL API](#graphql-api)

---

## CrossbeamSDK

Main SDK class that orchestrates all cross-chain operations.

### Constructor

```typescript
new CrossbeamSDK(config: CrossbeamSDKConfig)
```

**Parameters:**

- `config` - SDK configuration object
  - `bridges` - Bridge configurations for each chain
    - `ethereum?` - Ethereum bridge config
    - `solana?` - Solana bridge config
    - `xrpl?` - XRPL bridge config
  - `oracleUpdateInterval?` - Oracle update interval in ms (default: 60000)

**Example:**

```typescript
const sdk = new CrossbeamSDK({
  bridges: {
    ethereum: {
      sourceChain: ChainType.ETHEREUM,
      targetChain: ChainType.DAMA,
      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/API_KEY',
      contractAddress: '0x...',
    },
  },
  oracleUpdateInterval: 30000,
});
```

### Methods

#### initialize()

Initialize all configured bridges.

```typescript
async initialize(): Promise<void>
```

**Example:**

```typescript
await sdk.initialize();
```

#### getBridge()

Get a bridge instance for a specific chain.

```typescript
getBridge(chainType: ChainType): BaseBridge | undefined
```

**Parameters:**

- `chainType` - Chain type enum value

**Returns:** Bridge instance or undefined if not configured

**Example:**

```typescript
const ethBridge = sdk.getBridge(ChainType.ETHEREUM);
```

#### transfer()

Transfer tokens between chains.

```typescript
async transfer(
  sourceChain: ChainType,
  targetChain: ChainType,
  amount: string,
  sender: string,
  recipient: string
): Promise<CrossChainTransaction>
```

**Parameters:**

- `sourceChain` - Source blockchain
- `targetChain` - Target blockchain
- `amount` - Amount in base units (e.g., wei for Ethereum)
- `sender` - Sender address
- `recipient` - Recipient address on target chain

**Returns:** Transaction object

**Example:**

```typescript
const tx = await sdk.transfer(
  ChainType.ETHEREUM,
  ChainType.DAMA,
  '1000000000000000000', // 1 ETH
  '0xSenderAddress',
  'damaRecipientAddress'
);
```

#### getPrice()

Get current price for a symbol.

```typescript
async getPrice(symbol: string): Promise<PriceFeed>
```

**Parameters:**

- `symbol` - Token pair symbol (e.g., 'ETH/USD')

**Returns:** Price feed object

**Example:**

```typescript
const price = await sdk.getPrice('ETH/USD');
console.log(`Current price: $${price.price}`);
```

#### getPrices()

Get multiple price feeds at once.

```typescript
async getPrices(symbols: string[]): Promise<PriceFeed[]>
```

**Parameters:**

- `symbols` - Array of token pair symbols

**Returns:** Array of price feed objects

**Example:**

```typescript
const prices = await sdk.getPrices(['ETH/USD', 'SOL/USD', 'XRP/USD']);
```

#### subscribeToPriceUpdates()

Subscribe to real-time price updates.

```typescript
subscribeToPriceUpdates(
  symbol: string,
  callback: (feed: PriceFeed) => void
): () => void
```

**Parameters:**

- `symbol` - Token pair symbol
- `callback` - Function called on price updates

**Returns:** Unsubscribe function

**Example:**

```typescript
const unsubscribe = sdk.subscribeToPriceUpdates('ETH/USD', (feed) => {
  console.log(`New price: $${feed.price}`);
});

// Later...
unsubscribe();
```

#### getConfiguredBridges()

Get list of all configured chains.

```typescript
getConfiguredBridges(): ChainType[]
```

**Returns:** Array of configured chain types

**Example:**

```typescript
const chains = sdk.getConfiguredBridges();
console.log('Configured chains:', chains);
```

---

## Bridges

### BaseBridge

Abstract base class for all bridge implementations.

#### Methods

##### initialize()

```typescript
abstract initialize(): Promise<void>
```

Initialize the bridge connection.

##### transfer()

```typescript
abstract transfer(
  amount: string,
  recipient: string,
  sender: string
): Promise<CrossChainTransaction>
```

Transfer tokens across chains.

##### getTransactionStatus()

```typescript
abstract getTransactionStatus(txId: string): Promise<TransactionStatus>
```

Get status of a cross-chain transaction.

##### getLiquidity()

```typescript
abstract getLiquidity(): Promise<{ available: string; total: string }>
```

Get available liquidity in the bridge.

### EthereumBridge

Ethereum blockchain bridge implementation.

```typescript
const bridge = new EthereumBridge({
  sourceChain: ChainType.ETHEREUM,
  targetChain: ChainType.DAMA,
  rpcUrl: 'https://...',
  contractAddress: '0x...',
});
```

### SolanaBridge

Solana blockchain bridge implementation.

```typescript
const bridge = new SolanaBridge({
  sourceChain: ChainType.SOLANA,
  targetChain: ChainType.DAMA,
  rpcUrl: 'https://api.mainnet-beta.solana.com',
});
```

### XRPLBridge

XRPL blockchain bridge implementation.

```typescript
const bridge = new XRPLBridge({
  sourceChain: ChainType.XRPL,
  targetChain: ChainType.DAMA,
  rpcUrl: 'wss://xrplcluster.com',
});
```

---

## Oracles

### BaseOracle

Abstract base class for oracle implementations.

### ChainlinkOracle

Chainlink oracle integration for price feeds.

```typescript
const oracle = new ChainlinkOracle(updateInterval?: number)
```

**Parameters:**

- `updateInterval` - Update interval in milliseconds (default: 60000)

**Methods:**

- `getPrice(symbol: string): Promise<PriceFeed>`
- `getPrices(symbols: string[]): Promise<PriceFeed[]>`
- `subscribe(symbol: string, callback: Function): UnsubscribeFn`

---

## Types

### ChainType

Supported blockchain types.

```typescript
enum ChainType {
  DAMA = 'dama',
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  XRPL = 'xrpl',
}
```

### TransactionStatus

Transaction status enum.

```typescript
enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}
```

### BridgeConfig

Bridge configuration interface.

```typescript
interface BridgeConfig {
  sourceChain: ChainType;
  targetChain: ChainType;
  contractAddress?: string;
  rpcUrl: string;
}
```

### CrossChainTransaction

Cross-chain transaction object.

```typescript
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

### PriceFeed

Oracle price feed object.

```typescript
interface PriceFeed {
  symbol: string;
  price: number;
  timestamp: number;
  source: string;
}
```

### LiquidityPool

Liquidity pool information.

```typescript
interface LiquidityPool {
  id: string;
  chain: ChainType;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  totalLiquidity: string;
}
```

---

## Utilities

### formatAmount()

Format token amount with decimals.

```typescript
formatAmount(amount: string, decimals?: number): string
```

**Example:**

```typescript
import { utils } from 'crossbeam-sdk';

const formatted = utils.formatAmount('1000000000000000000', 18);
console.log(formatted); // "1.000000000000000000"
```

### parseAmount()

Parse token amount to base units.

```typescript
parseAmount(amount: string, decimals?: number): string
```

**Example:**

```typescript
const parsed = utils.parseAmount('1.5', 18);
console.log(parsed); // "1500000000000000000"
```

### validateAddress()

Validate address for different chain types.

```typescript
validateAddress(address: string, chainType: string): boolean
```

**Example:**

```typescript
const isValid = utils.validateAddress('0x...', 'ethereum');
```

### generateTxId()

Generate unique transaction ID.

```typescript
generateTxId(): string
```

### calculateExchangeRate()

Calculate exchange rate between two amounts.

```typescript
calculateExchangeRate(
  amountA: string,
  amountB: string,
  decimalsA?: number,
  decimalsB?: number
): number
```

---

## GraphQL API

### Schema

The SDK provides a complete GraphQL schema for querying and managing cross-chain operations.

### Queries

#### transaction

Get a specific transaction by ID.

```graphql
query {
  transaction(id: "tx123") {
    id
    sourceChain
    targetChain
    amount
    status
    timestamp
  }
}
```

#### transactions

Get list of transactions with optional filters.

```graphql
query {
  transactions(chainType: ETHEREUM, status: PENDING) {
    id
    sourceChain
    targetChain
    amount
    status
  }
}
```

#### priceFeed

Get current price for a symbol.

```graphql
query {
  priceFeed(symbol: "ETH/USD") {
    symbol
    price
    timestamp
    source
  }
}
```

#### liquidityPool

Get liquidity pool information.

```graphql
query {
  liquidityPool(id: "pool-1") {
    id
    chain
    tokenA
    tokenB
    reserveA
    reserveB
    totalLiquidity
  }
}
```

### Mutations

#### initiateBridge

Initiate a cross-chain bridge transaction.

```graphql
mutation {
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

### Subscriptions

#### priceUpdated

Subscribe to price updates.

```graphql
subscription {
  priceUpdated(symbol: "ETH/USD") {
    symbol
    price
    timestamp
  }
}
```

#### transactionUpdated

Subscribe to transaction status updates.

```graphql
subscription {
  transactionUpdated(id: "tx123") {
    id
    status
    txHash
  }
}
```

---

## Error Handling

All async methods may throw errors. Always use try-catch:

```typescript
try {
  const tx = await sdk.transfer(/* ... */);
} catch (error) {
  console.error('Transfer failed:', error.message);
}
```

Common errors:

- `SDK not initialized` - Call `initialize()` first
- `Bridge for X not configured` - Configure the bridge in constructor
- `Insufficient liquidity` - Bridge has insufficient funds
- `Invalid address` - Address format is incorrect for the chain

---

## TypeScript Types

The SDK is fully typed. Import types as needed:

```typescript
import {
  CrossbeamSDK,
  ChainType,
  TransactionStatus,
  CrossChainTransaction,
  PriceFeed,
} from 'crossbeam-sdk';
```
