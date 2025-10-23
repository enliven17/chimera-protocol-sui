#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"; // You need to add this
const SEPOLIA_PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
const BRIDGE_LOCK_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87";
const USER_ADDRESS = "0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123"; // Replace with your address

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

async function checkBalances() {
  try {
    console.log('🔍 Checking PYUSD balances on Sepolia...');
    
    // For now, let's use a public RPC (you should add your own)
    const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
    
    const pyusdContract = new ethers.Contract(SEPOLIA_PYUSD_ADDRESS, ERC20_ABI, provider);
    
    // Get token info
    const symbol = await pyusdContract.symbol();
    const decimals = await pyusdContract.decimals();
    
    console.log(`📄 Token: ${symbol} (${decimals} decimals)`);
    
    // Check user balance
    const userBalance = await pyusdContract.balanceOf(USER_ADDRESS);
    console.log(`👤 User balance: ${ethers.formatUnits(userBalance, decimals)} ${symbol}`);
    
    // Check bridge balance
    const bridgeBalance = await pyusdContract.balanceOf(BRIDGE_LOCK_ADDRESS);
    console.log(`🌉 Bridge balance: ${ethers.formatUnits(bridgeBalance, decimals)} ${symbol}`);
    
    console.log('\n📊 Summary:');
    console.log(`User has: ${ethers.formatUnits(userBalance, decimals)} ${symbol}`);
    console.log(`Bridge has: ${ethers.formatUnits(bridgeBalance, decimals)} ${symbol}`);
    
    if (bridgeBalance > 0) {
      console.log('✅ Bridge has received PYUSD - transfers are working!');
    } else {
      console.log('⚠️ Bridge has no PYUSD - transfers may not be working');
    }
    
  } catch (error) {
    console.error('❌ Error checking balances:', error.message);
    console.log('💡 Make sure you have a valid Sepolia RPC endpoint');
  }
}

checkBalances();