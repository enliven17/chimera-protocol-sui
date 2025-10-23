#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CHIMERA_ABI = [
  "function createMarket(string title, string description, string optionA, string optionB, uint8 category, uint256 endTime, uint256 minBet, uint256 maxBet, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove) returns (uint256)"
];

async function createBTCMarket() {
  console.log('🪙 Creating BTC $150K Market...\n');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(`📍 Using wallet: ${wallet.address}`);
  console.log(`🌐 Network: Hedera Testnet (Chain ID: 296)`);

  // Contract setup
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  const chimeraContract = new ethers.Contract(chimeraAddress, CHIMERA_ABI, wallet);

  console.log(`📋 ChimeraProtocol: ${chimeraAddress}\n`);

  // Market parameters
  const marketData = {
    title: "Will Bitcoin reach $150,000 by December 31, 2025?",
    description: "This market will resolve to 'Yes' if Bitcoin (BTC/USD) reaches or exceeds $150,000 at any point before December 31, 2025, 23:59:59 UTC. Price data will be sourced from Pyth Network oracle. If BTC reaches $150K even briefly, the market resolves to 'Yes'.",
    optionA: "Yes - BTC will hit $150K",
    optionB: "No - BTC stays below $150K",
    category: 5, // Crypto category
    endTime: Math.floor(new Date('2025-12-31T23:59:59Z').getTime() / 1000), // Dec 31, 2025
    minBet: ethers.parseUnits('1', 6), // 1 PYUSD
    maxBet: ethers.parseUnits('10000', 6), // 10,000 PYUSD
    imageUrl: "/bitcoin.png", // Local Bitcoin logo
    marketType: 0, // Price Direction market
    pythPriceId: "0xc5e0e0c92116c0c070a242b254270441a6201af680a33e0381561c59db3266c9", // BTC/USD
    targetPrice: ethers.parseUnits('150000', 8), // $150,000 (Pyth uses 8 decimals)
    priceAbove: true // We want price to go ABOVE $150K
  };

  console.log('📊 Market Details:');
  console.log(`   Title: ${marketData.title}`);
  console.log(`   Category: Crypto (${marketData.category})`);
  console.log(`   End Date: ${new Date(marketData.endTime * 1000).toLocaleString()}`);
  console.log(`   Target Price: $150,000`);
  console.log(`   Pyth Price ID: ${marketData.pythPriceId}`);
  console.log(`   Min Bet: ${ethers.formatUnits(marketData.minBet, 6)} PYUSD`);
  console.log(`   Max Bet: ${ethers.formatUnits(marketData.maxBet, 6)} PYUSD`);
  console.log(`   Image: ${marketData.imageUrl}\n`);

  try {
    console.log('🚀 Creating market transaction...');

    const tx = await chimeraContract.createMarket(
      marketData.title,
      marketData.description,
      marketData.optionA,
      marketData.optionB,
      marketData.category,
      marketData.endTime,
      marketData.minBet,
      marketData.maxBet,
      marketData.imageUrl,
      marketData.marketType,
      marketData.pythPriceId,
      marketData.targetPrice,
      marketData.priceAbove
    );

    console.log(`📝 Transaction submitted: ${tx.hash}`);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Extract market ID from logs
    const marketCreatedEvent = receipt.logs.find(log => {
      try {
        const parsed = chimeraContract.interface.parseLog(log);
        return parsed.name === 'MarketCreated';
      } catch {
        return false;
      }
    });

    if (marketCreatedEvent) {
      const parsed = chimeraContract.interface.parseLog(marketCreatedEvent);
      const marketId = parsed.args.marketId.toString();

      console.log(`\n🎯 Market Created Successfully!`);
      console.log(`   Market ID: ${marketId}`);
      console.log(`   Transaction: ${tx.hash}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);

      console.log(`\n🌐 View Market:`);
      console.log(`   Frontend: http://localhost:3000/markets/${marketId}`);
      console.log(`   HashScan: https://hashscan.io/testnet/transaction/${tx.hash}`);

      console.log(`\n📈 Market Features:`);
      console.log(`   ✅ Real-time BTC price tracking via Pyth Oracle`);
      console.log(`   ✅ Automatic resolution when BTC hits $150K`);
      console.log(`   ✅ AI analysis and recommendations`);
      console.log(`   ✅ Agent delegation support`);

      return {
        success: true,
        marketId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } else {
      console.log('⚠️ Market created but could not extract market ID from logs');
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    }

  } catch (error) {
    console.error('❌ Error creating market:', error);

    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('\n💡 Solution: Fund your wallet with HBAR for gas fees');
      console.log(`   Wallet: ${wallet.address}`);
      console.log(`   Faucet: https://portal.hedera.com/faucet`);
    } else if (error.message.includes('execution reverted')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Contract not deployed or wrong address');
      console.log('   - Invalid parameters');
      console.log('   - Insufficient permissions');
    }

    return {
      success: false,
      error: error.message
    };
  }
}

// Run the script
createBTCMarket()
  .then((result) => {
    if (result.success) {
      console.log('\n🎉 BTC $150K market is ready for trading!');
      process.exit(0);
    } else {
      console.log('\n❌ Market creation failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });