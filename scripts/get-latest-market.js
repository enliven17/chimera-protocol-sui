#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CHIMERA_ABI = [
  "function marketCounter() view returns (uint256)",
  "function getMarket(uint256 marketId) view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove))"
];

async function getLatestMarket() {
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api');
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  const chimeraContract = new ethers.Contract(chimeraAddress, CHIMERA_ABI, provider);
  
  try {
    const marketCounter = await chimeraContract.marketCounter();
    const latestMarketId = marketCounter.toString();
    
    console.log(`📊 Latest Market ID: ${latestMarketId}`);
    
    if (latestMarketId > 0) {
      const market = await chimeraContract.getMarket(latestMarketId);
      
      console.log(`\n🎯 Market Details:`);
      console.log(`   ID: ${market.id.toString()}`);
      console.log(`   Title: ${market.title}`);
      console.log(`   Category: ${market.category}`);
      console.log(`   Market Type: ${market.marketType} (${market.marketType === 0 ? 'Price Direction' : 'Custom Event'})`);
      console.log(`   Creator: ${market.creator}`);
      console.log(`   Status: ${market.status}`);
      console.log(`   Resolved: ${market.resolved}`);
      console.log(`   End Time: ${new Date(Number(market.endTime) * 1000).toLocaleString()}`);
      console.log(`   Image: ${market.imageUrl}`);
      
      if (market.marketType === 0) {
        console.log(`   Pyth Price ID: ${market.pythPriceId}`);
        console.log(`   Target Price: $${ethers.formatUnits(market.targetPrice, 8)}`);
        console.log(`   Price Above: ${market.priceAbove}`);
      }
      
      console.log(`\n🌐 Frontend URL: http://localhost:3000/markets/${latestMarketId}`);
      
      return latestMarketId;
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getLatestMarket();