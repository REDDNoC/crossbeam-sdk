import { typeDefs, resolvers } from '../src/graphql';

/**
 * Example GraphQL server setup using the Crossbeam SDK
 */

// Note: This is a basic example. In a real application, you would use
// a GraphQL server library like Apollo Server

const exampleQuery = `
  query GetTransaction {
    transaction(id: "tx123") {
      id
      sourceChain
      targetChain
      amount
      status
      timestamp
    }
  }
`;

const exampleMutation = `
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
`;

const exampleSubscription = `
  subscription PriceUpdates {
    priceUpdated(symbol: "ETH/USD") {
      symbol
      price
      timestamp
      source
    }
  }
`;

console.log('GraphQL Schema Type Definitions:');
console.log(typeDefs);

console.log('\nExample Query:');
console.log(exampleQuery);

console.log('\nExample Mutation:');
console.log(exampleMutation);

console.log('\nExample Subscription:');
console.log(exampleSubscription);

// To use with Apollo Server:
// import { ApolloServer } from '@apollo/server';
// import { startStandaloneServer } from '@apollo/server/standalone';
//
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });
//
// const { url } = await startStandaloneServer(server, {
//   listen: { port: 4000 },
// });
//
// console.log(`🚀 Server ready at: ${url}`);
