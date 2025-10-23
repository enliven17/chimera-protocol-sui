
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Mock GraphQL schema
const schema = buildSchema(`
  type MarketCreated {
    id: String!
    marketId: String!
    title: String!
    creator: String!
    marketType: Int!
    block_timestamp: String!
    transaction_hash: String!
  }

  type BetPlaced {
    id: String!
    marketId: String!
    user: String!
    agent: String!
    option: Int!
    amount: String!
    shares: String!
    block_timestamp: String!
    transaction_hash: String!
  }

  type Query {
    MarketCreated(limit: Int, offset: Int): [MarketCreated!]!
    BetPlaced(where: BetPlacedFilter): [BetPlaced!]!
  }

  input BetPlacedFilter {
    marketId: StringFilter
    user: StringFilter
  }

  input StringFilter {
    _eq: String
  }
`);

// Mock resolvers
const root = {
  MarketCreated: ({ limit = 10, offset = 0 }) => {
    // Return mock market data
    return [
      {
        id: '1',
        marketId: '1',
        title: 'Test Market 1',
        creator: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e',
        marketType: 1,
        block_timestamp: Math.floor(Date.now() / 1000).toString(),
        transaction_hash: '0x123...'
      },
      {
        id: '2',
        marketId: '2',
        title: 'Will Bitcoin reach $150,000 by December 31, 2025?',
        creator: '0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123',
        marketType: 0,
        block_timestamp: Math.floor(Date.now() / 1000).toString(),
        transaction_hash: '0x3a3909f40706479be2af2db3e73be27b60ea1a56f85093f886756ea373df9545'
      }
    ];
  },
  BetPlaced: ({ where }) => {
    // Return mock bet data
    return [];
  }
};

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/v1/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Mock Envio GraphQL server running on http://localhost:${PORT}/v1/graphql`);
  console.log(`🔍 GraphiQL interface: http://localhost:${PORT}/v1/graphql`);
});
