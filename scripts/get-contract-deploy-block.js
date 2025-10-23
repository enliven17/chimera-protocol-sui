#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

async function getContractDeployBlock() {
  console.log('🔍 Finding contract deployment block...\n');

  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);
  const contractAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;

  console.log('Contract Address:', contractAddress);
  console.log('RPC URL:', process.env.HEDERA_RPC_URL);

  try {
    // Get current block
    const currentBlock = await provider.getBlockNumber();
    console.log('Current Block:', currentBlock);

    // Binary search to find deployment block
    let low = 25000000; // Start from a reasonable block
    let high = currentBlock;
    let deployBlock = null;

    console.log('\n🔍 Searching for deployment block...');

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      
      try {
        const code = await provider.getCode(contractAddress, mid);
        
        if (code === '0x') {
          // Contract doesn't exist at this block
          low = mid + 1;
        } else {
          // Contract exists, this could be the deployment block or later
          deployBlock = mid;
          high = mid - 1;
        }
        
        console.log(`Block ${mid}: ${code === '0x' ? 'No contract' : 'Contract exists'}`);
      } catch (error) {
        console.log(`Block ${mid}: Error - ${error.message}`);
        low = mid + 1;
      }
    }

    if (deployBlock) {
      console.log(`\n✅ Contract deployed at or before block: ${deployBlock}`);
      
      // Get block details
      const block = await provider.getBlock(deployBlock);
      console.log(`📅 Block timestamp: ${new Date(block.timestamp * 1000).toISOString()}`);
      
      // Suggest a safe start block (a bit before deployment)
      const safeStartBlock = Math.max(deployBlock - 1000, 25000000);
      console.log(`🎯 Suggested start_block for Envio: ${safeStartBlock}`);
      
      return safeStartBlock;
    } else {
      console.log('❌ Could not find deployment block');
      return null;
    }

  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

getContractDeployBlock();