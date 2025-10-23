#!/usr/bin/env node

import { ethers } from 'ethers';

const rpcEndpoints = [
  'https://testnet.hashio.io/api',
  'https://pool-proxy-testnet.hashio.io/api',
  'https://testnet.mirrornode.hedera.com/api/v1/contracts/call',
  'https://hedera-testnet.rpc.thirdweb.com',
];

async function testHederaRPCs() {
  console.log('🔍 Testing Hedera RPC endpoints...\n');

  for (const rpcUrl of rpcEndpoints) {
    console.log(`Testing: ${rpcUrl}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test basic connectivity
      const blockNumber = await provider.getBlockNumber();
      console.log(`  ✅ Current block: ${blockNumber}`);
      
      // Test specific block
      const testBlock = 26156847;
      const blockData = await provider.getBlock(testBlock);
      const timestamp = new Date(blockData.timestamp * 1000);
      console.log(`  ✅ Block ${testBlock}: ${timestamp.toISOString()}`);
      
      // Test contract call
      const contractAddress = '0x7a9D78D1E5fe688F80D4C2c06Ca4C0407A967644';
      const code = await provider.getCode(contractAddress);
      console.log(`  ✅ Contract exists: ${code.length > 2 ? 'Yes' : 'No'}`);
      
      console.log(`  🎯 This RPC looks good!\n`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }
}

testHederaRPCs();