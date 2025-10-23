#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function debugFrontend() {
  console.log('🔍 Debugging Frontend Issues...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS: ${process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS}`);
  console.log(`   HEDERA_RPC_URL: ${process.env.HEDERA_RPC_URL}`);
  console.log(`   NEXT_PUBLIC_HEDERA_CHAIN_ID: ${process.env.NEXT_PUBLIC_HEDERA_CHAIN_ID}`);

  // Test RPC connection
  const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL || 'https://testnet.hashio.io/api');
  
  try {
    const network = await provider.getNetwork();
    console.log(`\n✅ RPC Connection: Chain ID ${network.chainId}`);
  } catch (error) {
    console.log(`\n❌ RPC Connection Failed: ${error.message}`);
    return;
  }

  // Test contract
  const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
  if (!chimeraAddress) {
    console.log('\n❌ Contract address not found in environment');
    return;
  }

  try {
    const code = await provider.getCode(chimeraAddress);
    if (code === '0x') {
      console.log(`\n❌ No contract found at ${chimeraAddress}`);
      return;
    }
    console.log(`\n✅ Contract exists at ${chimeraAddress}`);
  } catch (error) {
    console.log(`\n❌ Error checking contract: ${error.message}`);
    return;
  }

  // Test getAllMarkets call
  const CHIMERA_ABI = [
    "function getAllMarkets() view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove)[])"
  ];

  const contract = new ethers.Contract(chimeraAddress, CHIMERA_ABI, provider);

  try {
    const markets = await contract.getAllMarkets();
    console.log(`\n✅ getAllMarkets() returned ${markets.length} markets`);
    
    if (markets.length > 0) {
      console.log('\n📊 First Market:');
      const market = markets[0];
      console.log(`   ID: ${market.id}`);
      console.log(`   Title: ${market.title}`);
      console.log(`   Status: ${market.status}`);
      console.log(`   Resolved: ${market.resolved}`);
    }
  } catch (error) {
    console.log(`\n❌ getAllMarkets() failed: ${error.message}`);
    
    // Try with simpler ABI
    try {
      const simpleABI = ["function marketCounter() view returns (uint256)"];
      const simpleContract = new ethers.Contract(chimeraAddress, simpleABI, provider);
      const counter = await simpleContract.marketCounter();
      console.log(`\n✅ marketCounter() returned: ${counter}`);
    } catch (simpleError) {
      console.log(`\n❌ Even marketCounter() failed: ${simpleError.message}`);
    }
  }

  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Check if contract is deployed correctly');
  console.log('2. Verify ABI matches deployed contract');
  console.log('3. Check if frontend is using correct environment variables');
  console.log('4. Test with wagmi hooks in browser console');
}

debugFrontend();