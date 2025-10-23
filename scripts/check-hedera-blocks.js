#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);

async function checkHederaBlocks() {
  console.log('🔍 Checking Hedera block timestamps...\n');

  try {
    const currentBlock = await provider.getBlockNumber();
    console.log(`Current block: ${currentBlock}`);

    // Check our start block
    const startBlock = 26156800;
    console.log(`\n📊 Checking start block: ${startBlock}`);
    
    const startBlockData = await provider.getBlock(startBlock);
    const startTimestamp = new Date(startBlockData.timestamp * 1000);
    console.log(`   Timestamp: ${startTimestamp.toISOString()}`);
    console.log(`   Unix timestamp: ${startBlockData.timestamp}`);

    // Check current block
    console.log(`\n📊 Checking current block: ${currentBlock}`);
    const currentBlockData = await provider.getBlock(currentBlock);
    const currentTimestamp = new Date(currentBlockData.timestamp * 1000);
    console.log(`   Timestamp: ${currentTimestamp.toISOString()}`);
    console.log(`   Unix timestamp: ${currentBlockData.timestamp}`);

    // Calculate difference
    const timeDiff = currentBlockData.timestamp - startBlockData.timestamp;
    const daysDiff = timeDiff / (24 * 60 * 60);
    const yearsDiff = daysDiff / 365;

    console.log(`\n⏱️  Time difference:`);
    console.log(`   Seconds: ${timeDiff}`);
    console.log(`   Days: ${daysDiff.toFixed(2)}`);
    console.log(`   Years: ${yearsDiff.toFixed(2)}`);

    if (yearsDiff > 50) {
      console.log('\n❌ This explains the "56 years" issue!');
      console.log('   The block timestamps seem incorrect.');
    } else {
      console.log('\n✅ Block timestamps look normal.');
    }

    // Check a few blocks around our start block
    console.log(`\n🔍 Checking blocks around ${startBlock}:`);
    for (let i = -2; i <= 2; i++) {
      const blockNum = startBlock + i;
      try {
        const blockData = await provider.getBlock(blockNum);
        const timestamp = new Date(blockData.timestamp * 1000);
        console.log(`   Block ${blockNum}: ${timestamp.toISOString()}`);
      } catch (error) {
        console.log(`   Block ${blockNum}: Error - ${error.message}`);
      }
    }

    // Check market creation block
    const marketBlock = 26156847;
    console.log(`\n🎯 Checking market creation block: ${marketBlock}`);
    const marketBlockData = await provider.getBlock(marketBlock);
    const marketTimestamp = new Date(marketBlockData.timestamp * 1000);
    console.log(`   Timestamp: ${marketTimestamp.toISOString()}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkHederaBlocks();