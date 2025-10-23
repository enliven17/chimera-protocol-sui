#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Test ETH price first
async function testETHPrice() {
    try {
        console.log('🔍 Testing ETH price from Pyth...');
        
        const ethPriceId = '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';
        const pythEndpoint = 'https://hermes.pyth.network/api/latest_price_feeds';
        
        const response = await fetch(`${pythEndpoint}?ids[]=${ethPriceId}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const priceFeed = data[0];
            const price = parseInt(priceFeed.price.price);
            const expo = priceFeed.price.expo;
            const formattedPrice = price * Math.pow(10, expo);
            
            console.log(`💰 Current ETH Price: $${formattedPrice.toLocaleString()}`);
            
            const target = 7000;
            const distance = ((target - formattedPrice) / formattedPrice) * 100;
            
            console.log(`🎯 Target: $${target.toLocaleString()}`);
            if (formattedPrice >= target) {
                console.log(`✅ ETH already above $7k!`);
            } else {
                console.log(`📈 ${distance.toFixed(1)}% gain needed to reach $7k`);
            }
            
            return formattedPrice;
        }
    } catch (error) {
        console.error('❌ Error fetching ETH price:', error);
        return 2650; // Fallback
    }
}

// Create ETH market
async function createETHMarket() {
    try {
        console.log('\n🚀 Creating ETH $7k Market...');
        
        // Test ETH price first
        const currentETHPrice = await testETHPrice();
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);
        const privateKey = process.env.PRIVATE_KEY;
        const signer = new ethers.Wallet(privateKey, provider);
        
        console.log(`📝 Using signer: ${signer.address}`);
        
        // Contract ABI
        const chimeraAbi = [
            {
                "inputs": [
                    {"name": "title", "type": "string"},
                    {"name": "description", "type": "string"},
                    {"name": "optionA", "type": "string"},
                    {"name": "optionB", "type": "string"},
                    {"name": "category", "type": "uint8"},
                    {"name": "endTime", "type": "uint256"},
                    {"name": "minBet", "type": "uint256"},
                    {"name": "maxBet", "type": "uint256"},
                    {"name": "imageUrl", "type": "string"},
                    {"name": "marketType", "type": "uint8"},
                    {"name": "pythPriceId", "type": "bytes32"},
                    {"name": "targetPrice", "type": "int64"},
                    {"name": "priceAbove", "type": "bool"}
                ],
                "name": "createMarket",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
        
        const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
        const chimeraContract = new ethers.Contract(chimeraAddress, chimeraAbi, signer);
        
        // Market parameters
        const title = "Will Ethereum reach $7,000 by December 31, 2025?";
        const description = `This market will resolve to 'Yes' if Ethereum (ETH/USD) reaches or exceeds $7,000 at any point before December 31, 2025, 23:59:59 UTC. Price data will be sourced from Pyth Network oracle. Current ETH price: $${currentETHPrice.toLocaleString()}. If ETH reaches $7K even briefly, the market resolves to 'Yes'.`;
        const optionA = "Yes - ETH will hit $7K";
        const optionB = "No - ETH stays below $7K";
        const category = 5; // Crypto category
        
        // End time: December 31, 2025 (same as BTC market)
        const endTime = Math.floor(new Date('2025-12-31T23:59:59Z').getTime() / 1000);
        
        console.log(`⏰ Current time: ${new Date().toLocaleString()}`);
        console.log(`⏰ End time: ${new Date(endTime * 1000).toLocaleString()}`);
        
        const minBet = ethers.parseUnits("1", 6); // 1 PYUSD
        const maxBet = ethers.parseUnits("1000", 6); // 1000 PYUSD
        const imageUrl = "/ethereum.jpg";
        const marketType = 0; // Price direction market
        
        // Pyth price feed for ETH/USD
        const pythPriceId = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
        const targetPrice = ethers.parseUnits("7000", 8); // $7000 with 8 decimals (Pyth format)
        const priceAbove = true; // We want ETH to go above $7000
        
        console.log('\n📋 Market Details:');
        console.log(`   Title: ${title}`);
        console.log(`   Description: ${description.substring(0, 100)}...`);
        console.log(`   Option A: ${optionA}`);
        console.log(`   Option B: ${optionB}`);
        console.log(`   End Time: ${new Date(endTime * 1000).toLocaleString()}`);
        console.log(`   Min Bet: ${ethers.formatUnits(minBet, 6)} PYUSD`);
        console.log(`   Max Bet: ${ethers.formatUnits(maxBet, 6)} PYUSD`);
        console.log(`   Image: ${imageUrl}`);
        console.log(`   Pyth Price ID: ${pythPriceId}`);
        console.log(`   Target Price: $${ethers.formatUnits(targetPrice, 8)}`);
        
        // Create the market
        console.log('\n🔄 Creating market transaction...');
        const tx = await chimeraContract.createMarket(
            title,
            description,
            optionA,
            optionB,
            category,
            endTime,
            minBet,
            maxBet,
            imageUrl,
            marketType,
            pythPriceId,
            targetPrice,
            priceAbove
        );
        
        console.log(`📤 Transaction sent: ${tx.hash}`);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log(`✅ Market created successfully!`);
        console.log(`📦 Block: ${receipt.blockNumber}`);
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        
        // Try to get the market ID from events
        try {
            const marketCreatedEvent = receipt.logs.find(log => {
                try {
                    const decoded = chimeraContract.interface.parseLog(log);
                    return decoded.name === 'MarketCreated';
                } catch {
                    return false;
                }
            });
            
            if (marketCreatedEvent) {
                const decoded = chimeraContract.interface.parseLog(marketCreatedEvent);
                const marketId = decoded.args.marketId.toString();
                console.log(`🆔 Market ID: ${marketId}`);
                console.log(`🌐 Frontend URL: http://localhost:3000/markets/${marketId}`);
            }
        } catch (error) {
            console.log('⚠️ Could not extract market ID from events');
        }
        
        console.log(`🔗 Transaction: https://hashscan.io/testnet/transaction/${tx.hash}`);
        
    } catch (error) {
        console.error('❌ Error creating ETH market:', error.message);
    }
}

// Run the creation
createETHMarket();