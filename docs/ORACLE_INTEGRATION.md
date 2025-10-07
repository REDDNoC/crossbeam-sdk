# Oracle Integration Guide

## Overview

The Crossbeam SDK integrates with Chainlink oracles to provide reliable, decentralized price feeds for cross-chain operations.

## Supported Price Feeds

- ETH/USD
- SOL/USD
- XRP/USD
- DAMA/USD
- Custom token pairs

## Usage

### Basic Price Feed

```typescript
import { ChainlinkOracle } from 'crossbeam-sdk';

const oracle = new ChainlinkOracle(30000); // 30 second update interval

// Get single price
const ethPrice = await oracle.getPrice('ETH/USD');
console.log(`ETH: $${ethPrice.price}`);

// Get multiple prices
const prices = await oracle.getPrices(['ETH/USD', 'SOL/USD', 'XRP/USD']);
prices.forEach(feed => {
  console.log(`${feed.symbol}: $${feed.price} (${new Date(feed.timestamp)})`);
});
```

### Real-time Price Updates

```typescript
// Subscribe to price updates
const unsubscribe = oracle.subscribe('ETH/USD', (feed) => {
  console.log(`Price updated: ${feed.price}`);
  console.log(`Timestamp: ${new Date(feed.timestamp)}`);
  console.log(`Source: ${feed.source}`);
});

// Unsubscribe when done
unsubscribe();
```

### Integration with SDK

The SDK automatically uses oracles for price validation:

```typescript
const sdk = new CrossbeamSDK({
  bridges: { /* ... */ },
  oracleUpdateInterval: 60000, // 1 minute
});

// Prices are automatically fetched for validation
const price = await sdk.getPrice('ETH/USD');
```

## Oracle Architecture

### Price Feed Structure

```typescript
interface PriceFeed {
  symbol: string;      // Token pair (e.g., "ETH/USD")
  price: number;       // Current price
  timestamp: number;   // Unix timestamp
  source: string;      // Oracle source (e.g., "chainlink")
}
```

### Caching Strategy

Oracle prices are cached to reduce RPC calls:

1. Cache duration is configurable via `updateInterval`
2. Cached prices are used if within update interval
3. Automatic refresh when cache expires
4. Subscribers are notified of updates

### Implementation Details

```typescript
class ChainlinkOracle extends BaseOracle {
  private priceCache: Map<string, PriceFeed>;
  private subscribers: Map<string, Set<Callback>>;
  
  async getPrice(symbol: string): Promise<PriceFeed> {
    // Check cache
    const cached = this.priceCache.get(symbol);
    if (cached && !this.isStale(cached)) {
      return cached;
    }
    
    // Fetch fresh price
    const feed = await this.fetchPrice(symbol);
    this.priceCache.set(symbol, feed);
    this.notifySubscribers(symbol, feed);
    
    return feed;
  }
}
```

## Production Deployment

### Chainlink Integration

For production, integrate with actual Chainlink price feeds:

```solidity
// Solidity contract
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumer {
    AggregatorV3Interface internal priceFeed;

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }
}
```

### Chainlink Price Feed Addresses

#### Ethereum Mainnet

- ETH/USD: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- LINK/USD: `0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c`

#### Polygon Mainnet

- MATIC/USD: `0xAB594600376Ec9fD91F8e885dADF0CE036862dE0`
- ETH/USD: `0xF9680D99D6C9589e2a93a78A04A279e509205945`

### Custom Oracle Integration

To add a custom oracle source:

```typescript
class CustomOracle extends BaseOracle {
  async getPrice(symbol: string): Promise<PriceFeed> {
    // Fetch from custom API
    const response = await fetch(`https://api.example.com/price/${symbol}`);
    const data = await response.json();
    
    return {
      symbol,
      price: data.price,
      timestamp: Date.now(),
      source: 'custom',
    };
  }
  
  async getPrices(symbols: string[]): Promise<PriceFeed[]> {
    return Promise.all(symbols.map(s => this.getPrice(s)));
  }
  
  subscribe(symbol: string, callback: Callback): UnsubscribeFn {
    // Implement subscription logic
  }
}
```

## Error Handling

### Stale Price Detection

```typescript
const MAX_PRICE_AGE = 300000; // 5 minutes

function isPriceStale(feed: PriceFeed): boolean {
  return Date.now() - feed.timestamp > MAX_PRICE_AGE;
}

// Usage
const price = await oracle.getPrice('ETH/USD');
if (isPriceStale(price)) {
  throw new Error('Price feed is stale');
}
```

### Fallback Oracles

```typescript
class MultiOracle extends BaseOracle {
  private oracles: BaseOracle[];
  
  async getPrice(symbol: string): Promise<PriceFeed> {
    for (const oracle of this.oracles) {
      try {
        return await oracle.getPrice(symbol);
      } catch (error) {
        console.warn(`Oracle failed: ${error.message}`);
        continue;
      }
    }
    throw new Error('All oracles failed');
  }
}
```

## Best Practices

1. **Use Multiple Oracle Sources**: Don't rely on a single oracle
2. **Implement Price Deviation Checks**: Alert on large price swings
3. **Monitor Oracle Health**: Track update frequency and availability
4. **Set Price Staleness Limits**: Reject outdated prices
5. **Cache Strategically**: Balance freshness vs RPC costs

## Monitoring

Track these oracle metrics:

- Update frequency
- Price deviation from exchanges
- Failed update attempts
- Subscriber count
- Cache hit rate

## Advanced Usage

### Price Deviation Alerts

```typescript
let lastPrice = 0;

oracle.subscribe('ETH/USD', (feed) => {
  if (lastPrice > 0) {
    const deviation = Math.abs(feed.price - lastPrice) / lastPrice;
    if (deviation > 0.05) { // 5% change
      console.warn(`Large price change detected: ${deviation * 100}%`);
    }
  }
  lastPrice = feed.price;
});
```

### Custom Update Intervals

```typescript
// Different intervals for different pairs
const btcOracle = new ChainlinkOracle(10000);  // 10s for BTC
const altOracle = new ChainlinkOracle(60000);  // 60s for altcoins
```

## Testing

### Mock Oracle for Testing

```typescript
class MockOracle extends BaseOracle {
  private mockPrices: Map<string, number>;
  
  constructor() {
    super();
    this.mockPrices = new Map([
      ['ETH/USD', 2000],
      ['SOL/USD', 100],
    ]);
  }
  
  async getPrice(symbol: string): Promise<PriceFeed> {
    return {
      symbol,
      price: this.mockPrices.get(symbol) || 1,
      timestamp: Date.now(),
      source: 'mock',
    };
  }
}
```
