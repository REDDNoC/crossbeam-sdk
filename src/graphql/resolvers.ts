import { ChainlinkOracle } from '../oracles';
import { CrossChainTransaction, ChainType, TransactionStatus } from '../types';

// Mock data storage
const transactions: Map<string, CrossChainTransaction> = new Map();
const oracle = new ChainlinkOracle();

export const resolvers = {
  Query: {
    transaction: (_: any, { id }: { id: string }) => {
      return transactions.get(id) || null;
    },

    transactions: (
      _: any,
      { chainType, status }: { chainType?: ChainType; status?: TransactionStatus }
    ) => {
      let txList = Array.from(transactions.values());

      if (chainType) {
        txList = txList.filter(
          (tx) => tx.sourceChain === chainType || tx.targetChain === chainType
        );
      }

      if (status) {
        txList = txList.filter((tx) => tx.status === status);
      }

      return txList;
    },

    priceFeed: async (_: any, { symbol }: { symbol: string }) => {
      return await oracle.getPrice(symbol);
    },

    priceFeeds: async (_: any, { symbols }: { symbols: string[] }) => {
      return await oracle.getPrices(symbols);
    },

    liquidityPool: (_: any, { id }: { id: string }) => {
      // Mock liquidity pool data
      return {
        id,
        chain: ChainType.ETHEREUM,
        tokenA: 'DAMA',
        tokenB: 'ETH',
        reserveA: '1000000',
        reserveB: '500',
        totalLiquidity: '707107',
      };
    },

    liquidityPools: (_: any, { chainType }: { chainType?: ChainType }) => {
      // Mock liquidity pools
      return [
        {
          id: '1',
          chain: ChainType.ETHEREUM,
          tokenA: 'DAMA',
          tokenB: 'ETH',
          reserveA: '1000000',
          reserveB: '500',
          totalLiquidity: '707107',
        },
      ];
    },
  },

  Mutation: {
    initiateBridge: (
      _: any,
      {
        input,
      }: {
        input: {
          sourceChain: ChainType;
          targetChain: ChainType;
          amount: string;
          sender: string;
          recipient: string;
        };
      }
    ) => {
      const tx: CrossChainTransaction = {
        id: Math.random().toString(36).substring(7),
        sourceChain: input.sourceChain,
        targetChain: input.targetChain,
        amount: input.amount,
        sender: input.sender,
        recipient: input.recipient,
        status: TransactionStatus.PENDING,
        timestamp: Date.now(),
      };

      transactions.set(tx.id, tx);
      return tx;
    },
  },

  Subscription: {
    priceUpdated: {
      subscribe: (_: any, { symbol }: { symbol: string }) => {
        // In a real implementation, this would use a pubsub mechanism
        return {
          [Symbol.asyncIterator]: async function* () {
            while (true) {
              await new Promise((resolve) => setTimeout(resolve, 5000));
              const feed = await oracle.getPrice(symbol);
              yield { priceUpdated: feed };
            }
          },
        };
      },
    },

    transactionUpdated: {
      subscribe: (_: any, { id }: { id: string }) => {
        return {
          [Symbol.asyncIterator]: async function* () {
            while (true) {
              await new Promise((resolve) => setTimeout(resolve, 5000));
              const tx = transactions.get(id);
              if (tx) {
                yield { transactionUpdated: tx };
              }
            }
          },
        };
      },
    },
  },
};
