#!/usr/bin/env node

import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('https://indexer.dev.hyperindex.xyz/be31b19/v1/graphql');

async function testEnvioConnection() {
  console.log('🔍 Testing Envio GraphQL Connection...\n');

  try {
    // Test basic connection
    const basicQuery = `{ __typename }`;
    const basicResult = await client.request(basicQuery);
    console.log('✅ Basic connection:', basicResult);

    // Test MarketCreatedEvent
    const marketQuery = `
      query {
        MarketCreatedEvent(limit: 5) {
          id
          marketId
          title
          creator
          marketType
          blockTimestamp
          transactionHash
        }
      }
    `;
    
    const marketResult = await client.request(marketQuery);
    console.log('\n📊 MarketCreatedEvent data:');
    console.log('Count:', marketResult.MarketCreatedEvent?.length || 0);
    if (marketResult.MarketCreatedEvent?.length > 0) {
      console.log('Sample:', JSON.stringify(marketResult.MarketCreatedEvent[0], null, 2));
    }

    // Test BetPlacedEvent
    const betQuery = `
      query {
        BetPlacedEvent(limit: 5) {
          id
          marketId
          user
          agent
          option
          amount
          shares
          blockTimestamp
        }
      }
    `;
    
    const betResult = await client.request(betQuery);
    console.log('\n🎯 BetPlacedEvent data:');
    console.log('Count:', betResult.BetPlacedEvent?.length || 0);
    if (betResult.BetPlacedEvent?.length > 0) {
      console.log('Sample:', JSON.stringify(betResult.BetPlacedEvent[0], null, 2));
    }

    // Test schema introspection
    const schemaQuery = `
      query {
        __schema {
          queryType {
            fields {
              name
              type {
                name
              }
            }
          }
        }
      }
    `;
    
    const schemaResult = await client.request(schemaQuery);
    console.log('\n🏗️ Available query fields:');
    schemaResult.__schema.queryType.fields.forEach(field => {
      console.log(`  - ${field.name}`);
    });

  } catch (error) {
    console.error('❌ Error testing Envio connection:', error);
  }
}

testEnvioConnection();