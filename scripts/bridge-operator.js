#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Bridge operator script - monitors Sepolia for lock events and mints on Hedera
const HEDERA_RPC_URL = process.env.HEDERA_RPC_URL;
const BRIDGE_CONTRACT_ADDRESS = "0x3D2d821089f83e0B272Aa2B6921C13e80eEd83ED";
const WPYUSD_CONTRACT_ADDRESS = "0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4";
const BRIDGE_OPERATOR_PRIVATE_KEY = process.env.PRIVATE_KEY;

// Bridge contract ABI
const BRIDGE_ABI = [
  {
    "inputs": [
      {"name": "user", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "sourceTxHash", "type": "bytes32"}
    ],
    "name": "mintTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// wPYUSD ABI
const WPYUSD_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function mintWPYUSDForUser(userAddress, amount, sourceTxHash) {
  try {
    console.log('🌉 Bridge Operator: Minting wPYUSD for user...');
    
    // Setup Hedera provider and signer
    const provider = new ethers.JsonRpcProvider(HEDERA_RPC_URL);
    const signer = new ethers.Wallet(BRIDGE_OPERATOR_PRIVATE_KEY, provider);
    
    console.log(`👤 User: ${userAddress}`);
    console.log(`💰 Amount: ${ethers.formatUnits(amount, 6)} PYUSD`);
    console.log(`🔗 Source TX: ${sourceTxHash}`);
    
    // Connect to wPYUSD contract
    const wpyusdContract = new ethers.Contract(WPYUSD_CONTRACT_ADDRESS, WPYUSD_ABI, signer);
    
    // Check current balance
    const currentBalance = await wpyusdContract.balanceOf(userAddress);
    console.log(`📊 Current wPYUSD balance: ${ethers.formatUnits(currentBalance, 6)}`);
    
    // Mint wPYUSD to user
    console.log('🪙 Minting wPYUSD...');
    const mintTx = await wpyusdContract.mint(userAddress, amount, {
      gasLimit: 1000000,
      gasPrice: 510000000000
    });
    
    console.log(`📤 Mint transaction sent: ${mintTx.hash}`);
    
    const receipt = await mintTx.wait();
    console.log(`✅ Mint confirmed in block ${receipt.blockNumber}`);
    
    // Check new balance
    const newBalance = await wpyusdContract.balanceOf(userAddress);
    console.log(`💰 New wPYUSD balance: ${ethers.formatUnits(newBalance, 6)}`);
    
    return {
      success: true,
      txHash: mintTx.hash,
      blockNumber: receipt.blockNumber
    };
    
  } catch (error) {
    console.error('❌ Bridge operator mint failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage - this would be called when bridge detects a lock event
async function processManualBridge() {
  // Example parameters - in production these would come from Sepolia events
  const userAddress = "0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123"; // Replace with actual user
  const amount = ethers.parseUnits("10", 6); // 10 PYUSD
  const sourceTxHash = ethers.keccak256(ethers.toUtf8Bytes("demo_tx_" + Date.now()));
  
  console.log('🚀 Processing manual bridge request...');
  const result = await mintWPYUSDForUser(userAddress, amount, sourceTxHash);
  
  if (result.success) {
    console.log('🎉 Bridge completed successfully!');
    console.log(`📄 Hedera TX: ${result.txHash}`);
  } else {
    console.log('❌ Bridge failed:', result.error);
  }
}

// Export for use in other scripts
export { mintWPYUSDForUser };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processManualBridge()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}