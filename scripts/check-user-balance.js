#!/usr/bin/env node

import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// ERC20 ABI for balance checking
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)",
    "function totalSupply() view returns (uint256)"
];

async function checkUserBalance() {
    try {
        console.log('🔍 Checking user PYUSD balance...');
        
        // Setup provider
        const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);
        
        // PYUSD contract
        const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;
        const pyusdContract = new ethers.Contract(pyusdAddress, ERC20_ABI, provider);
        
        // Get token info
        const name = await pyusdContract.name();
        const symbol = await pyusdContract.symbol();
        const decimals = await pyusdContract.decimals();
        const totalSupply = await pyusdContract.totalSupply();
        
        console.log('\n📄 Token Information:');
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
        console.log(`   Contract: ${pyusdAddress}`);
        
        // Check some sample addresses (you can add your wallet address here)
        const testAddresses = [
            '0x71197e7a1CA5A2cb2AD82432B924F69B1E3dB123', // Market creator
            '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87', // Agent address from env
            // Add more addresses as needed
        ];
        
        // Also check recent transactions to find active addresses
        console.log('\n🔍 Checking recent transactions for active addresses...');
        try {
            const latestBlock = await provider.getBlock('latest');
            const blockNumber = latestBlock.number;
            
            // Check last 10 blocks for transactions
            for (let i = 0; i < 10; i++) {
                const block = await provider.getBlock(blockNumber - i);
                if (block && block.transactions.length > 0) {
                    console.log(`   Block ${block.number}: ${block.transactions.length} transactions`);
                    
                    // Check first few transactions for addresses
                    for (let j = 0; j < Math.min(3, block.transactions.length); j++) {
                        const tx = await provider.getTransaction(block.transactions[j]);
                        if (tx && tx.from && !testAddresses.includes(tx.from)) {
                            testAddresses.push(tx.from);
                            console.log(`   Found address: ${tx.from}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.log('   Could not scan recent transactions');
        }
        
        console.log('\n💰 Balance Check:');
        for (const address of testAddresses) {
            try {
                const balance = await pyusdContract.balanceOf(address);
                const formattedBalance = ethers.formatUnits(balance, decimals);
                console.log(`   ${address}: ${formattedBalance} ${symbol}`);
            } catch (error) {
                console.log(`   ${address}: Error - ${error.message}`);
            }
        }
        
        // Check if this is a real PYUSD or a test token
        console.log('\n🔍 Token Analysis:');
        if (name.toLowerCase().includes('paypal') || name.toLowerCase().includes('pyusd')) {
            console.log('   ✅ This appears to be a legitimate PYUSD token');
        } else {
            console.log('   ⚠️ This might be a test/mock PYUSD token');
        }
        
        // Check network
        const network = await provider.getNetwork();
        console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        if (network.chainId === 296n) {
            console.log('   ✅ Connected to Hedera Testnet');
        } else {
            console.log('   ⚠️ Not on Hedera Testnet');
        }
        
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure you\'re connected to Hedera Testnet (Chain ID: 296)');
        console.log('   2. Check if you have the correct PYUSD contract address');
        console.log('   3. Verify your wallet is connected to the right network');
        console.log('   4. If you have wPYUSD, you might need to unwrap it first');
        
    } catch (error) {
        console.error('❌ Error checking balance:', error.message);
    }
}

// Run the check
checkUserBalance();