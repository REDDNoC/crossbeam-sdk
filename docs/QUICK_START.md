# Quick Start Guide

Get up and running with the Crossbeam SDK in minutes.

## Installation

```bash
npm install crossbeam-sdk
```

## Step 1: Basic Setup

Create a new file `index.js` or `index.ts`:

```typescript
import { CrossbeamSDK, ChainType } from 'crossbeam-sdk';

async function main() {
  // Initialize SDK
  const sdk = new CrossbeamSDK({
    bridges: {
      ethereum: {
        sourceChain: ChainType.ETHEREUM,
        targetChain: ChainType.DAMA,
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
        contractAddress: '0x1234567890123456789012345678901234567890',
      },
    },
  });

  // Initialize all bridges
  await sdk.initialize();
  
  console.log('SDK initialized successfully!');
  console.log('Configured chains:', sdk.getConfiguredBridges());
}

main().catch(console.error);
```

## Step 2: Transfer Tokens

```typescript
// Transfer 1 ETH from Ethereum to DAMA
const tx = await sdk.transfer(
  ChainType.ETHEREUM,
  ChainType.DAMA,
  '1000000000000000000', // 1 ETH in wei
  '0xYourEthereumAddress',
  'yourDAMAaddress'
);

console.log('Transfer initiated:', tx.id);
console.log('Status:', tx.status);
```

## Step 3: Get Price Feeds

```typescript
// Get current ETH price
const ethPrice = await sdk.getPrice('ETH/USD');
console.log(`ETH: $${ethPrice.price}`);

// Get multiple prices
const prices = await sdk.getPrices(['ETH/USD', 'SOL/USD', 'XRP/USD']);
prices.forEach(feed => {
  console.log(`${feed.symbol}: $${feed.price}`);
});
```

## Step 4: Subscribe to Updates

```typescript
// Subscribe to real-time price updates
const unsubscribe = sdk.subscribeToPriceUpdates('ETH/USD', (feed) => {
  console.log(`ETH price updated: $${feed.price}`);
});

// Unsubscribe after 60 seconds
setTimeout(() => {
  unsubscribe();
  console.log('Unsubscribed');
}, 60000);
```

## Configuration Options

### Multiple Chains

```typescript
const sdk = new CrossbeamSDK({
  bridges: {
    ethereum: {
      sourceChain: ChainType.ETHEREUM,
      targetChain: ChainType.DAMA,
      rpcUrl: 'https://...',
      contractAddress: '0x...',
    },
    solana: {
      sourceChain: ChainType.SOLANA,
      targetChain: ChainType.DAMA,
      rpcUrl: 'https://api.mainnet-beta.solana.com',
    },
    xrpl: {
      sourceChain: ChainType.XRPL,
      targetChain: ChainType.DAMA,
      rpcUrl: 'wss://xrplcluster.com',
    },
  },
  oracleUpdateInterval: 30000, // 30 seconds
});
```

### Environment Variables

Create a `.env` file:

```env
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ETH_BRIDGE_ADDRESS=0x1234567890123456789012345678901234567890
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
XRPL_RPC_URL=wss://xrplcluster.com
```

Use in code:

```typescript
import dotenv from 'dotenv';
dotenv.config();

const sdk = new CrossbeamSDK({
  bridges: {
    ethereum: {
      sourceChain: ChainType.ETHEREUM,
      targetChain: ChainType.DAMA,
      rpcUrl: process.env.ETH_RPC_URL!,
      contractAddress: process.env.ETH_BRIDGE_ADDRESS!,
    },
  },
});
```

## Common Use Cases

### 1. Check Bridge Liquidity

```typescript
const ethBridge = sdk.getBridge(ChainType.ETHEREUM);
if (ethBridge) {
  const liquidity = await ethBridge.getLiquidity();
  console.log('Available:', liquidity.available);
  console.log('Total:', liquidity.total);
}
```

### 2. Format Token Amounts

```typescript
import { utils } from 'crossbeam-sdk';

// Convert wei to ETH
const eth = utils.formatAmount('1000000000000000000', 18);
console.log(eth); // "1.000000000000000000"

// Convert ETH to wei
const wei = utils.parseAmount('1.5', 18);
console.log(wei); // "1500000000000000000"
```

### 3. Validate Addresses

```typescript
import { utils } from 'crossbeam-sdk';

const isValidEth = utils.validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'ethereum');
const isValidSol = utils.validateAddress('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK', 'solana');
```

## GraphQL API

### Setup Server

```typescript
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs, resolvers } from 'crossbeam-sdk';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Server ready at: ${url}`);
```

### Query Transactions

```graphql
query {
  transactions(status: PENDING) {
    id
    sourceChain
    targetChain
    amount
    status
  }
}
```

### Initiate Bridge Transfer

```graphql
mutation {
  initiateBridge(input: {
    sourceChain: ETHEREUM
    targetChain: DAMA
    amount: "1000000000000000000"
    sender: "0x..."
    recipient: "dama..."
  }) {
    id
    status
  }
}
```

## Testing

### Testnet Configuration

```typescript
const sdk = new CrossbeamSDK({
  bridges: {
    ethereum: {
      sourceChain: ChainType.ETHEREUM,
      targetChain: ChainType.DAMA,
      rpcUrl: 'https://eth-goerli.g.alchemy.com/v2/YOUR_API_KEY', // Goerli testnet
      contractAddress: '0x...', // Testnet contract
    },
    solana: {
      sourceChain: ChainType.SOLANA,
      targetChain: ChainType.DAMA,
      rpcUrl: 'https://api.devnet.solana.com', // Devnet
    },
  },
});
```

## Next Steps

1. **Deploy Smart Contracts**: See [contracts/README.md](../contracts/README.md)
2. **Read API Docs**: See [docs/API_REFERENCE.md](./API_REFERENCE.md)
3. **Understand Architecture**: See [docs/BRIDGE_ARCHITECTURE.md](./BRIDGE_ARCHITECTURE.md)
4. **Review Examples**: See [examples/](../examples/)

## Troubleshooting

### Common Errors

**"SDK not initialized"**
- Call `await sdk.initialize()` before using the SDK

**"Bridge for X not configured"**
- Add the bridge configuration in the constructor

**"Invalid address"**
- Verify the address format matches the blockchain (0x for Ethereum, base58 for Solana, r for XRPL)

**RPC errors**
- Check your RPC URL is correct and accessible
- Verify your API key is valid

## Support

- 📚 [Full Documentation](./API_REFERENCE.md)
- 💬 [Discord Community](#)
- 🐛 [Report Issues](https://github.com/REDDNoC/crossbeam-sdk/issues)

## What's Next?

- Explore the [API Reference](./API_REFERENCE.md) for all available methods
- Learn about [Bridge Architecture](./BRIDGE_ARCHITECTURE.md)
- Understand [Oracle Integration](./ORACLE_INTEGRATION.md)
- Review complete [examples](../examples/)
