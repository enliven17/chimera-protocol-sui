import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export async function POST(request: NextRequest) {
  try {
    const { address, spender } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Setup provider
    const provider = new ethers.JsonRpcProvider(process.env.HEDERA_RPC_URL);
    const pyusdAddress = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS;
    const chimeraAddress = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;

    if (!pyusdAddress) {
      return NextResponse.json({ error: 'PYUSD contract address not configured' }, { status: 500 });
    }

    // Create contract instance
    const contract = new ethers.Contract(pyusdAddress, ERC20_ABI, provider);

    // Get balance
    const balance = await contract.balanceOf(address);
    
    // Get allowance if spender provided
    let allowance = '0';
    if (spender || chimeraAddress) {
      const spenderAddress = spender || chimeraAddress;
      allowance = (await contract.allowance(address, spenderAddress)).toString();
    }

    return NextResponse.json({
      balance: balance.toString(),
      allowance,
      address,
      contract: pyusdAddress,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching PYUSD balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance', details: error.message },
      { status: 500 }
    );
  }
}