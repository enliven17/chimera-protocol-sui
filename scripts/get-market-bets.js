#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Contract ABI - based on actual contract structure
const CHIMERA_ABI = [
    "function getMarket(uint256 marketId) view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool))",
    "function getMarketCount() view returns (uint256)",
    "function markets(uint256) view returns (uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool)"
];

async function getMarketBettingData() {
    try {
        console.log('🔍 Fetching real market betting data...');
        
        // Setup provider and contract
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);
        const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS,
            CHIMERA_ABI,
            provider
        );
        
        // Get market 1 details
        const marketId = 1;
        console.log(`📊 Getting data for Market ${marketId}...`);
        
        // Get market info
        const market = await contract.getMarket(marketId);
        console.log('\n🎯 Market Info:');
        console.log(`   Title: ${market.title}`);
        console.log(`   Description: ${market.description}`);
        console.log(`   Option A: ${market.optionA}`);
        console.log(`   Option B: ${market.optionB}`);
        console.log(`   Status: ${market.status}`);
        console.log(`   Resolved: ${market.resolved}`);
        console.log(`   End Time: ${new Date(Number(market.endTime) * 1000).toLocaleString()}`);
        
        console.log('\n📈 Market Statistics:');
        console.log(`   Total Pool: ${ethers.formatEther(market.totalPool)} PYUSD`);
        console.log(`   Option A Shares: ${ethers.formatEther(market.totalOptionAShares)}`);
        console.log(`   Option B Shares: ${ethers.formatEther(market.totalOptionBShares)}`);
        
        // Calculate ratios
        const totalShares = market.totalOptionAShares + market.totalOptionBShares;
        if (totalShares > 0n) {
            const optionARatio = Number(market.totalOptionAShares) / Number(totalShares);
            const optionBRatio = Number(market.totalOptionBShares) / Number(totalShares);
            
            console.log('\n⚖️ Market Ratios:');
            console.log(`   Option A: ${(optionARatio * 100).toFixed(1)}%`);
            console.log(`   Option B: ${(optionBRatio * 100).toFixed(1)}%`);
            
            // Contrarian analysis
            console.log('\n🧠 AI Analysis:');
            if (optionARatio > 0.7) {
                console.log(`   🎯 CONTRARIAN OPPORTUNITY: Option B`);
                console.log(`   📊 Confidence: ${Math.min(90, (optionARatio - 0.5) * 200).toFixed(0)}%`);
                console.log(`   💭 Reasoning: Option A heavily favored (${(optionARatio * 100).toFixed(1)}%), contrarian bet on Option B`);
            } else if (optionBRatio > 0.7) {
                console.log(`   🎯 CONTRARIAN OPPORTUNITY: Option A`);
                console.log(`   📊 Confidence: ${Math.min(90, (optionBRatio - 0.5) * 200).toFixed(0)}%`);
                console.log(`   💭 Reasoning: Option B heavily favored (${(optionBRatio * 100).toFixed(1)}%), contrarian bet on Option A`);
            } else {
                console.log(`   ⚖️ BALANCED MARKET`);
                console.log(`   📊 Confidence: 50%`);
                console.log(`   💭 Reasoning: Market appears balanced, no clear contrarian opportunity`);
            }
        } else {
            console.log('\n⚠️ No bets placed yet - market is empty');
        }
        
        // Return structured data for AI agent
        const marketData = {
            id: marketId,
            title: market.title,
            description: market.description,
            optionA: market.optionA,
            optionB: market.optionB,
            question: market.title,
            totalPool: Number(ethers.formatEther(market.totalPool)),
            optionAShares: Number(ethers.formatEther(market.totalOptionAShares)),
            optionBShares: Number(ethers.formatEther(market.totalOptionBShares)),
            optionARatio: totalShares > 0n ? Number(market.totalOptionAShares) / Number(totalShares) : 0.5,
            optionBRatio: totalShares > 0n ? Number(market.totalOptionBShares) / Number(totalShares) : 0.5,
            status: market.resolved ? 'resolved' : 'active',
            resolved: market.resolved,
            outcome: market.outcome,
            endTime: Number(market.endTime),
            creator: market.creator,
            lastUpdate: new Date().toISOString()
        };
        
        console.log('\n📋 Structured Data for AI:');
        console.log(JSON.stringify(marketData, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value, 2));
        
        return marketData;
        
    } catch (error) {
        console.error('❌ Error fetching market data:', error.message);
        return null;
    }
}

// Run if called directly
getMarketBettingData();

export { getMarketBettingData };