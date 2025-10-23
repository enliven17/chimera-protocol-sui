#!/usr/bin/env node

import dotenv from 'dotenv';
import { GraphQLClient } from 'graphql-request';
import axios from 'axios';

// Load environment variables
dotenv.config();

console.log('🧠 Testing AI Integration Stack...\n');

// Test configurations
const ENVIO_ENDPOINT = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';
const ASI_AGENT_ENDPOINT = process.env.NEXT_PUBLIC_ASI_AGENT_ENDPOINT || 'http://localhost:8001';
const LIT_PROTOCOL_ENDPOINT = process.env.NEXT_PUBLIC_LIT_PROTOCOL_ENDPOINT || 'http://localhost:3001';
const PYTH_ENDPOINT = 'https://hermes.pyth.network';

// Test 1: Envio HyperIndex Connection
async function testEnvioConnection() {
  console.log('📊 Testing Envio HyperIndex...');
  
  try {
    const client = new GraphQLClient(ENVIO_ENDPOINT);
    const query = `
      query TestConnection {
        MarketCreated(limit: 1) {
          id
          marketId
          title
          creator
          block_timestamp
        }
      }
    `;
    
    const response = await client.request(query);
    console.log('✅ Envio HyperIndex: Connected');
    console.log(`   - Found ${response.MarketCreated?.length || 0} markets`);
    
    if (response.MarketCreated?.length > 0) {
      const market = response.MarketCreated[0];
      console.log(`   - Latest market: "${market.title}" (ID: ${market.marketId})`);
      return { success: true, data: response.MarketCreated };
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.log('❌ Envio HyperIndex: Failed');
    console.log(`   - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test 2: ASI Agent Connection
async function testASIAgentConnection() {
  console.log('\n🤖 Testing ASI Agent...');
  
  try {
    const response = await axios.get(`${ASI_AGENT_ENDPOINT}/status`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEXT_PUBLIC_ASI_AGENT_API_KEY && {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ASI_AGENT_API_KEY}`
        })
      }
    });
    
    console.log('✅ ASI Agent: Connected');
    console.log(`   - Status: ${response.data.status || 'Unknown'}`);
    console.log(`   - Version: ${response.data.version || 'Unknown'}`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ ASI Agent: Failed');
    console.log(`   - Error: ${error.message}`);
    console.log(`   - Endpoint: ${ASI_AGENT_ENDPOINT}`);
    return { success: false, error: error.message };
  }
}

// Test 3: Lit Protocol Vincent Skill Connection
async function testLitProtocolConnection() {
  console.log('\n🔐 Testing Lit Protocol Vincent Skill...');
  
  try {
    const response = await axios.get(`${LIT_PROTOCOL_ENDPOINT}/status`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEXT_PUBLIC_LIT_PROTOCOL_API_KEY && {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_LIT_PROTOCOL_API_KEY}`
        })
      }
    });
    
    console.log('✅ Lit Protocol Vincent: Connected');
    console.log(`   - Status: ${response.data.status || 'Unknown'}`);
    console.log(`   - Active Sessions: ${response.data.activeSessions || 0}`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ Lit Protocol Vincent: Failed');
    console.log(`   - Error: ${error.message}`);
    console.log(`   - Endpoint: ${LIT_PROTOCOL_ENDPOINT}`);
    return { success: false, error: error.message };
  }
}

// Test 4: Pyth Network Connection
async function testPythConnection() {
  console.log('\n💰 Testing Pyth Network...');
  
  try {
    // Test BTC/USD with correct price ID
    const response = await axios.get(
      `${PYTH_ENDPOINT}/v2/updates/price/latest?ids[]=0xc5e0e0c92116c0c070a242b254270441a6201af680a33e0381561c59db3266c9`,
      { timeout: 10000 }
    );
    
    console.log('✅ Pyth Network: Connected');
    console.log(`   - BTC/USD Price: Available`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ Pyth Network: Failed');
    console.log(`   - Error: ${error.message}`);
    console.log(`   - Trying alternative endpoint...`);
    
    try {
      // Try alternative endpoint
      const altResponse = await axios.get('https://benchmarks.pyth.network/v1/shims/tradingview/config', { timeout: 5000 });
      console.log('✅ Pyth Network: Connected (alternative endpoint)');
      return { success: true, data: altResponse.data };
    } catch (altError) {
      console.log('❌ Pyth Network: All endpoints failed');
      return { success: false, error: altError.message };
    }
  }
}

// Test 5: AI Integration Flow
async function testAIIntegrationFlow(envioData) {
  console.log('\n🔄 Testing AI Integration Flow...');
  
  if (!envioData.success || !envioData.data.length) {
    console.log('⚠️  Skipping AI flow test - no market data available');
    return { success: false, error: 'No market data' };
  }
  
  const market = envioData.data[0];
  
  try {
    // Test ASI Agent market analysis
    console.log('   📈 Testing ASI Agent market analysis...');
    
    const analysisResponse = await axios.post(`${ASI_AGENT_ENDPOINT}/analyze-market`, {
      marketId: market.marketId,
      title: market.title,
      optionA: 'Yes',
      optionB: 'No',
      category: 0,
      endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEXT_PUBLIC_ASI_AGENT_API_KEY && {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ASI_AGENT_API_KEY}`
        })
      }
    });
    
    console.log('   ✅ ASI Agent analysis: Success');
    console.log(`      - Recommendation: ${analysisResponse.data.recommendation || 'Unknown'}`);
    console.log(`      - Confidence: ${(analysisResponse.data.confidence * 100).toFixed(1)}%`);
    
    // Test Lit Protocol execution validation
    console.log('   🔐 Testing Lit Protocol execution validation...');
    
    const validationResponse = await axios.post(`${LIT_PROTOCOL_ENDPOINT}/validate_transaction`, {
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e',
      contractAddress: process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS,
      functionName: 'placeBet',
      args: [market.marketId, 0, '1000000'], // 1 PYUSD
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEXT_PUBLIC_LIT_PROTOCOL_API_KEY && {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_LIT_PROTOCOL_API_KEY}`
        })
      }
    });
    
    console.log('   ✅ Lit Protocol validation: Success');
    console.log(`      - Valid: ${validationResponse.data.isValid}`);
    console.log(`      - Security Score: ${validationResponse.data.securityScore}/10`);
    
    return { success: true };
    
  } catch (error) {
    console.log('   ❌ AI Integration Flow: Failed');
    console.log(`      - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting AI Integration Tests...\n');
  
  const results = {
    envio: await testEnvioConnection(),
    asiAgent: await testASIAgentConnection(),
    litProtocol: await testLitProtocolConnection(),
    pyth: await testPythConnection(),
  };
  
  // Test integration flow if basic services are working
  results.integration = await testAIIntegrationFlow(results.envio);
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  const services = [
    { name: 'Envio HyperIndex', result: results.envio },
    { name: 'ASI Agent', result: results.asiAgent },
    { name: 'Lit Protocol', result: results.litProtocol },
    { name: 'Pyth Network', result: results.pyth },
    { name: 'AI Integration Flow', result: results.integration },
  ];
  
  let successCount = 0;
  services.forEach(service => {
    const status = service.result.success ? '✅' : '❌';
    console.log(`${status} ${service.name}`);
    if (service.result.success) successCount++;
  });
  
  console.log(`\n🎯 Overall Status: ${successCount}/${services.length} services working`);
  
  if (successCount === services.length) {
    console.log('🎉 All AI integrations are working perfectly!');
    console.log('\n🔗 Integration Flow:');
    console.log('   Envio → Market Data → ASI Agent → Analysis → Lit Protocol → Secure Execution');
  } else {
    console.log('⚠️  Some services need attention. Check the errors above.');
    
    console.log('\n🛠️  Quick Setup Commands:');
    if (!results.envio.success) {
      console.log('   Envio: npm run setup:envio');
    }
    if (!results.asiAgent.success) {
      console.log('   ASI Agent: npm run start:asi-agent');
    }
    if (!results.litProtocol.success) {
      console.log('   Lit Protocol: npm run start:vincent-skill');
    }
  }
  
  console.log('\n📚 Frontend Usage:');
  console.log('   - System Dashboard: /dashboard');
  console.log('   - Market Intelligence: /markets/[id] (AI analysis tab)');
  console.log('   - Agent Delegation: /agents');
  console.log('   - Bridge Interface: /bridge');
}

// Run the tests
runTests().catch(console.error);