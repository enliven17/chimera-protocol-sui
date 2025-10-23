#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Extended ERC20 ABI with mint function
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function mint(address to, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function owner() view returns (address)",
    "function hasRole(bytes32 role, address account) view returns (bool)"
];

async function mintTestPYUSD() {
    try {
        console.log('🪙 Attempting to mint test PYUSD...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);
        const privateKey = process.env.PRIVATE_KEY;
        
        if (!privateKey) {
            console.error('❌ PRIVATE_KEY not found in .env file');
            return;
        }
        
        const signer = new ethers.Wallet(privateKey, provider);
        console.log(`📝 Using signer: ${signer.address}`);
        
        // PYUSD contract
        const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;
        const pyusdContract = new ethers.Contract(pyusdAddress, ERC20_ABI, signer);
        
        // Get token info
        const name = await pyusdContract.name();
        const symbol = await pyusdContract.symbol();
        const decimals = await pyusdContract.decimals();
        
        console.log(`\n📄 Token: ${name} (${symbol})`);
        console.log(`📍 Contract: ${pyusdAddress}`);
        
        // Check current balance
        const currentBalance = await pyusdContract.balanceOf(signer.address);
        console.log(`💰 Current balance: ${ethers.formatUnits(currentBalance, decimals)} ${symbol}`);
        
        // Try to mint 100 tokens
        const mintAmount = ethers.parseUnits("100", decimals);
        
        try {
            console.log(`\n🔄 Attempting to mint 100 ${symbol}...`);
            const tx = await pyusdContract.mint(signer.address, mintAmount);
            console.log(`📤 Transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
            
            // Check new balance
            const newBalance = await pyusdContract.balanceOf(signer.address);
            console.log(`💰 New balance: ${ethers.formatUnits(newBalance, decimals)} ${symbol}`);
            
        } catch (mintError) {
            console.log(`❌ Mint failed: ${mintError.message}`);
            
            // Try to check if we can transfer from owner
            try {
                const owner = await pyusdContract.owner();
                console.log(`👑 Contract owner: ${owner}`);
                
                if (owner.toLowerCase() === signer.address.toLowerCase()) {
                    console.log('✅ You are the owner, mint should work');
                } else {
                    console.log('⚠️ You are not the owner, trying alternative methods...');
                    
                    // Check if owner has balance to transfer
                    const ownerBalance = await pyusdContract.balanceOf(owner);
                    console.log(`💰 Owner balance: ${ethers.formatUnits(ownerBalance, decimals)} ${symbol}`);
                    
                    if (ownerBalance > 0) {
                        console.log('💡 Suggestion: Ask the owner to transfer tokens to your address');
                        console.log(`   Owner: ${owner}`);
                        console.log(`   Your address: ${signer.address}`);
                    }
                }
            } catch (ownerError) {
                console.log('⚠️ Could not check owner');
            }
        }
        
        // Alternative: Check if there's a faucet function
        try {
            console.log('\n🚰 Checking for faucet function...');
            const faucetTx = await pyusdContract.faucet();
            console.log(`📤 Faucet transaction: ${faucetTx.hash}`);
            await faucetTx.wait();
            console.log('✅ Faucet successful');
        } catch (faucetError) {
            console.log('⚠️ No faucet function available');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the mint attempt
mintTestPYUSD();