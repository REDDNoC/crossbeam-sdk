import { CrossbeamSDK, ChainType } from '../src';

/**
 * Basic example of using the Crossbeam SDK
 */
async function main() {
  // Initialize the SDK with bridge configurations
  const sdk = new CrossbeamSDK({
    bridges: {
      ethereum: {
        sourceChain: ChainType.ETHEREUM,
        targetChain: ChainType.DAMA,
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
        contractAddress: '0x1234567890123456789012345678901234567890',
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

  // Initialize all bridges
  await sdk.initialize();

  console.log('SDK initialized successfully');
  console.log('Configured bridges:', sdk.getConfiguredBridges());

  // Example 1: Transfer tokens from Ethereum to DAMA
  try {
    const tx = await sdk.transfer(
      ChainType.ETHEREUM,
      ChainType.DAMA,
      '1000000000000000000', // 1 ETH in wei
      '0xSenderAddress',
      'damaRecipientAddress'
    );

    console.log('Transfer initiated:', tx);
  } catch (error) {
    console.error('Transfer failed:', error);
  }

  // Example 2: Get price feeds
  const ethPrice = await sdk.getPrice('ETH/USD');
  console.log('ETH/USD Price:', ethPrice);

  const prices = await sdk.getPrices(['ETH/USD', 'SOL/USD', 'XRP/USD']);
  console.log('Multiple prices:', prices);

  // Example 3: Subscribe to price updates
  const unsubscribe = sdk.subscribeToPriceUpdates('ETH/USD', (feed) => {
    console.log('Price updated:', feed);
  });

  // Clean up after 60 seconds
  setTimeout(() => {
    unsubscribe();
    console.log('Unsubscribed from price updates');
  }, 60000);
}

// Run the example
main().catch(console.error);
