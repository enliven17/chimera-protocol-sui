#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CHIMERA_ABI = [
  "function getAllMarkets() view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove)[])",
  "function getMarket(uint256 marketId) view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove))"
];

async function testFrontendData() {
  console.log('🧪 Testing Frontend Data Sources...\n');

  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api');
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  const chimeraContract = new ethers.Contract(chimeraAddress, CHIMERA_ABI, provider);

  try {
    console.log('📊 Testing ChimeraProtocol Contract Data...');
    
    // Test getAllMarkets
    const allMarkets = await chimeraContract.getAllMarkets();
    console.log(`✅ getAllMarkets(): Found ${allMarkets.length} markets`);
    
    if (allMarkets.length > 0) {
      const latestMarket = allMarkets[allMarkets.length - 1];
      console.log(`   Latest Market: "${latestMarket.title}"`);
      console.log(`   Market ID: ${latestMarket.id.toString()}`);
      console.log(`   Category: ${latestMarket.category}`);
      console.log(`   Market Type: ${latestMarket.marketType} (${latestMarket.marketType === 0 ? 'Price Direction' : 'Custom Event'})`);
      
      if (latestMarket.marketType === 0) {
        console.log(`   Pyth Price ID: ${latestMarket.pythPriceId}`);
        console.log(`   Target Price: $${ethers.formatUnits(latestMarket.targetPrice, 8)}`);
        console.log(`   Price Above: ${latestMarket.priceAbove}`);
      }
      
      console.log(`   Image URL: ${latestMarket.imageUrl}`);
      console.log(`   End Time: ${new Date(Number(latestMarket.endTime) * 1000).toLocaleString()}`);
    }

    console.log('\n🎯 Frontend URLs to Test:');
    console.log(`   Markets Page: http://localhost:3000/markets`);
    if (allMarkets.length > 0) {
      const latestMarketId = allMarkets[allMarkets.length - 1].id.toString();
      console.log(`   Latest Market: http://localhost:3000/markets/${latestMarketId}`);
      console.log(`   BTC Market: http://localhost:3000/markets/2`);
    }
    console.log(`   Dashboard: http://localhost:3000/dashboard`);
    console.log(`   Agents: http://localhost:3000/agents`);
    console.log(`   Bridge: http://localhost:3000/bridge`);

    console.log('\n🚀 To start frontend:');
    console.log('   npm run dev');
    console.log('   Then open http://localhost:3000');

    console.log('\n📋 Expected Features:');
    console.log('   ✅ Market list with real contract data');
    console.log('   ✅ BTC $150K market with Pyth price tracking');
    console.log('   ✅ AI Intelligence tab (when AI services running)');
    console.log('   ✅ Real-time price updates');
    console.log('   ✅ Betting functionality');

    return {
      success: true,
      marketsCount: allMarkets.length,
      latestMarketId: allMarkets.length > 0 ? allMarkets[allMarkets.length - 1].id.toString() : null
    };

  } catch (error) {
    console.error('❌ Error testing frontend data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

testFrontendData();