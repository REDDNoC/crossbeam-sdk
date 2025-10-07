export const typeDefs = `
  type Query {
    transaction(id: ID!): Transaction
    transactions(chainType: ChainType, status: TransactionStatus): [Transaction!]!
    priceFeed(symbol: String!): PriceFeed
    priceFeeds(symbols: [String!]!): [PriceFeed!]!
    liquidityPool(id: ID!): LiquidityPool
    liquidityPools(chainType: ChainType): [LiquidityPool!]!
  }

  type Mutation {
    initiateBridge(input: BridgeInput!): Transaction!
  }

  type Subscription {
    priceUpdated(symbol: String!): PriceFeed!
    transactionUpdated(id: ID!): Transaction!
  }

  enum ChainType {
    DAMA
    ETHEREUM
    SOLANA
    XRPL
  }

  enum TransactionStatus {
    PENDING
    CONFIRMED
    FAILED
  }

  type Transaction {
    id: ID!
    sourceChain: ChainType!
    targetChain: ChainType!
    amount: String!
    sender: String!
    recipient: String!
    status: TransactionStatus!
    timestamp: Float!
    txHash: String
  }

  type PriceFeed {
    symbol: String!
    price: Float!
    timestamp: Float!
    source: String!
  }

  type LiquidityPool {
    id: ID!
    chain: ChainType!
    tokenA: String!
    tokenB: String!
    reserveA: String!
    reserveB: String!
    totalLiquidity: String!
  }

  input BridgeInput {
    sourceChain: ChainType!
    targetChain: ChainType!
    amount: String!
    sender: String!
    recipient: String!
  }
`;
