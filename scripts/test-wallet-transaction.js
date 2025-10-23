#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Test transaction to verify wallet functionality
async function testWalletTransaction() {
    try {
        console.log('🔐 Testing wallet transaction...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);
        const privateKey = process.env.PRIVATE_KEY;
        
        if (!privateKey) {
            console.error('❌ PRIVATE_KEY not found in .env file');
            return;
        }
        
        const signer = new ethers.Wallet(privateKey, provider);
        console.log(`📝 Using signer: ${signer.address}`);
        
        // Get current balance
        const balance = await provider.getBalance(signer.address);
        console.log(`💰 HBAR Balance: ${ethers.formatEther(balance)} HBAR`);
        
        // Test 1: Simple HBAR transfer (to self)
        console.log('\n🔄 Test 1: Simple HBAR transfer...');
        try {
            const tx = await signer.sendTransaction({
                to: signer.address,
                value: ethers.parseEther("0.001"), // 0.001 HBAR
                gasLimit: 21000
            });
            
            console.log(`📤 Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        } catch (error) {
            console.log(`❌ HBAR transfer failed: ${error.message}`);
        }
        
        // Test 2: Contract interaction (PYUSD balance check)
        console.log('\n🔄 Test 2: Contract interaction...');
        try {
            const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;
            const pyusdAbi = ["function balanceOf(address owner) view returns (uint256)"];
            const pyusdContract = new ethers.Contract(pyusdAddress, pyusdAbi, signer);
            
            const pyusdBalance = await pyusdContract.balanceOf(signer.address);
            console.log(`💰 PYUSD Balance: ${ethers.formatUnits(pyusdBalance, 6)} wPYUSD`);
            console.log(`✅ Contract read successful`);
        } catch (error) {
            console.log(`❌ Contract read failed: ${error.message}`);
        }
        
        // Test 3: Contract write (PYUSD approval)
        console.log('\n🔄 Test 3: Contract write (approval)...');
        try {
            const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;
            const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
            const pyusdAbi = [
                "function approve(address spender, uint256 amount) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)"
            ];
            const pyusdContract = new ethers.Contract(pyusdAddress, pyusdAbi, signer);
            
            // Check current allowance
            const currentAllowance = await pyusdContract.allowance(signer.address, chimeraAddress);
            console.log(`📋 Current allowance: ${ethers.formatUnits(currentAllowance, 6)} wPYUSD`);
            
            // Approve 1 wPYUSD
            const approveAmount = ethers.parseUnits("1", 6);
            const approveTx = await pyusdContract.approve(chimeraAddress, approveAmount);
            console.log(`📤 Approval transaction sent: ${approveTx.hash}`);
            
            const approveReceipt = await approveTx.wait();
            console.log(`✅ Approval confirmed in block ${approveReceipt.blockNumber}`);
            
            // Check new allowance
            const newAllowance = await pyusdContract.allowance(signer.address, chimeraAddress);
            console.log(`📋 New allowance: ${ethers.formatUnits(newAllowance, 6)} wPYUSD`);
            
        } catch (error) {
            console.log(`❌ Contract write failed: ${error.message}`);
        }
        
        console.log('\n✅ Wallet transaction test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testWalletTransaction();