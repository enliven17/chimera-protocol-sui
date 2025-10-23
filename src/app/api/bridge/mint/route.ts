import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const HEDERA_RPC_URL = process.env.HEDERA_RPC_URL;
const WPYUSD_CONTRACT_ADDRESS = "0x9D5F12DBe903A0741F675e4Aa4454b2F7A010aB4";
const BRIDGE_OPERATOR_PRIVATE_KEY = process.env.PRIVATE_KEY;

// wPYUSD ABI
const WPYUSD_ABI = [
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export async function POST(request: NextRequest) {
  try {
    const { userAddress, amount, sourceTxHash } = await request.json();
    
    console.log('🌉 Bridge API: Minting wPYUSD for user:', {
      userAddress,
      amount,
      sourceTxHash
    });
    
    if (!HEDERA_RPC_URL || !BRIDGE_OPERATOR_PRIVATE_KEY) {
      throw new Error('Bridge operator not configured');
    }
    
    // Setup Hedera provider and signer
    const provider = new ethers.JsonRpcProvider(HEDERA_RPC_URL);
    const signer = new ethers.Wallet(BRIDGE_OPERATOR_PRIVATE_KEY, provider);
    
    // Connect to wPYUSD contract
    const wpyusdContract = new ethers.Contract(WPYUSD_CONTRACT_ADDRESS, WPYUSD_ABI, signer);
    
    // Mint wPYUSD to user
    const mintTx = await wpyusdContract.mint(userAddress, amount, {
      gasLimit: 1000000,
      gasPrice: 510000000000
    });
    
    console.log('📤 Mint transaction sent:', mintTx.hash);
    
    const receipt = await mintTx.wait();
    console.log('✅ Mint confirmed in block:', receipt.blockNumber);
    
    return NextResponse.json({
      success: true,
      txHash: mintTx.hash,
      blockNumber: receipt.blockNumber,
      amount: ethers.formatUnits(amount, 6)
    });
    
  } catch (error) {
    console.error('❌ Bridge mint API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Bridge mint failed'
    }, { status: 500 });
  }
}