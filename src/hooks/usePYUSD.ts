import React from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

// ERC20 ABI for PYUSD token (JSON format)
const ERC20_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol", 
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const PYUSD_ADDRESS = process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS as `0x${string}`;
const CHIMERA_ADDRESS = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS as `0x${string}`;

// Validate contract addresses
if (!PYUSD_ADDRESS || !CHIMERA_ADDRESS) {
  console.error('Missing contract addresses:', { PYUSD_ADDRESS, CHIMERA_ADDRESS });
}

export function usePYUSD() {
  const { writeContract, writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useBalance = (address: `0x${string}` | undefined) => {
    // Try wagmi first
    const wagmiResult = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && !!PYUSD_ADDRESS,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 30000, // 30 seconds
      },
    });

    // If wagmi fails, use manual fetch
    const [manualBalance, setManualBalance] = React.useState<bigint | undefined>();
    const [isManualLoading, setIsManualLoading] = React.useState(false);

    React.useEffect(() => {
      if (!address || !PYUSD_ADDRESS || wagmiResult.data !== undefined) return;

      const fetchBalance = async () => {
        try {
          setIsManualLoading(true);
          const response = await fetch('/api/pyusd-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
          });
          
          if (response.ok) {
            const data = await response.json();
            setManualBalance(BigInt(data.balance));
          }
        } catch (error) {
          console.error('Manual balance fetch failed:', error);
        } finally {
          setIsManualLoading(false);
        }
      };

      fetchBalance();
    }, [address, PYUSD_ADDRESS, wagmiResult.data]);

    // Return wagmi result if available, otherwise manual result
    return {
      ...wagmiResult,
      data: wagmiResult.data ?? manualBalance,
      isLoading: wagmiResult.isLoading || isManualLoading,
    };
  };

  const useAllowance = (owner: `0x${string}` | undefined, spender: `0x${string}`) => {
    // Try wagmi first
    const wagmiResult = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: owner ? [owner, spender] : undefined,
      query: {
        enabled: !!owner && !!PYUSD_ADDRESS && !!spender,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 30000, // 30 seconds
      },
    });

    // If wagmi fails, use manual fetch
    const [manualAllowance, setManualAllowance] = React.useState<bigint | undefined>();
    const [isManualLoading, setIsManualLoading] = React.useState(false);

    React.useEffect(() => {
      if (!owner || !spender || !PYUSD_ADDRESS || wagmiResult.data !== undefined) return;

      const fetchAllowance = async () => {
        try {
          setIsManualLoading(true);
          const response = await fetch('/api/pyusd-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: owner, spender })
          });
          
          if (response.ok) {
            const data = await response.json();
            setManualAllowance(BigInt(data.allowance));
          }
        } catch (error) {
          console.error('Manual allowance fetch failed:', error);
        } finally {
          setIsManualLoading(false);
        }
      };

      fetchAllowance();
    }, [owner, spender, PYUSD_ADDRESS, wagmiResult.data]);

    // Return wagmi result if available, otherwise manual result
    return {
      ...wagmiResult,
      data: wagmiResult.data ?? manualAllowance,
      isLoading: wagmiResult.isLoading || isManualLoading,
    };
  };

  const useChimeraAllowance = (owner: `0x${string}` | undefined) => {
    return useAllowance(owner, CHIMERA_ADDRESS);
  };

  const useTokenInfo = () => {
    const name = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "name",
      query: {
        enabled: !!PYUSD_ADDRESS,
      },
    });

    const symbol = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "symbol",
      query: {
        enabled: !!PYUSD_ADDRESS,
      },
    });

    const decimals = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "decimals",
      query: {
        enabled: !!PYUSD_ADDRESS,
      },
    });

    const totalSupply = useReadContract({
      address: PYUSD_ADDRESS,
      abi: ERC20_ABI,
      functionName: "totalSupply",
      query: {
        enabled: !!PYUSD_ADDRESS,
      },
    });

    // Debug logging
    if (typeof window !== 'undefined') {
      console.log('PYUSD Token Info Debug:', {
        PYUSD_ADDRESS,
        name: { data: name.data, error: name.error, status: name.status },
        symbol: { data: symbol.data, error: symbol.error, status: symbol.status },
        decimals: { data: decimals.data, error: decimals.error, status: decimals.status },
        totalSupply: { data: totalSupply.data, error: totalSupply.error, status: totalSupply.status }
      });
    }

    return {
      name: name.data,
      symbol: symbol.data,
      decimals: decimals.data,
      totalSupply: totalSupply.data,
      isLoading: name.isLoading || symbol.isLoading || decimals.isLoading || totalSupply.isLoading,
      error: name.error || symbol.error || decimals.error || totalSupply.error,
    };
  };

  // Write functions
  const approve = async (spender: `0x${string}`, amount: string) => {
    try {
      const amountWei = parseUnits(amount, 6); // PYUSD has 6 decimals

      console.log('📝 Approving PYUSD:', { spender, amount, amountWei: amountWei.toString() });

      const txHash = await writeContractAsync({
        address: PYUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, amountWei],
      });

      console.log('✅ Approval transaction hash:', txHash);
      
      // Show success with Hedera explorer link
      const explorerUrl = `https://hashscan.io/testnet/transaction/${txHash}`;
      toast.success(
        `Approval successful! View on Hedera: ${explorerUrl}`,
        {
          duration: 10000,
          action: {
            label: 'View Transaction',
            onClick: () => window.open(explorerUrl, '_blank')
          }
        }
      );
      
      return txHash;
    } catch (error) {
      console.error("❌ Error approving:", error);
      
      // User-friendly error messages
      let errorMessage = 'Unknown error occurred';
      
      if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fee';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network connection error';
      } else if (error.code === 4001) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.code === -32603) {
        errorMessage = 'Transaction failed';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  const approveChimera = async (amount: string) => {
    return approve(CHIMERA_ADDRESS, amount);
  };

  const approveMax = async (spender: `0x${string}`) => {
    try {
      const maxAmount = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

      await writeContract({
        address: PYUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, maxAmount],
      });

      toast.success("Max approval transaction submitted!");
    } catch (error) {
      console.error("Error approving max:", error);
      toast.error("Failed to approve max");
    }
  };

  const approveChimeraMax = async () => {
    return approveMax(CHIMERA_ADDRESS);
  };

  const transfer = async (to: `0x${string}`, amount: string) => {
    try {
      const amountWei = parseUnits(amount, 6);

      await writeContract({
        address: PYUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to, amountWei],
      });

      toast.success("Transfer transaction submitted!");
    } catch (error) {
      console.error("Error transferring:", error);
      toast.error("Failed to transfer");
    }
  };

  // Helper functions
  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0";
    return formatUnits(balance, 6);
  };

  const parseAmount = (amount: string) => {
    return parseUnits(amount, 6);
  };

  const hasAllowance = (allowance: bigint | undefined, requiredAmount: string) => {
    if (!allowance) return false;
    const required = parseUnits(requiredAmount, 6);
    return allowance >= required;
  };

  return {
    // Read hooks
    useBalance,
    useAllowance,
    useChimeraAllowance,
    useTokenInfo,
    
    // Write functions
    approve,
    approveChimera,
    approveMax,
    approveChimeraMax,
    transfer,
    
    // Helper functions
    formatBalance,
    parseAmount,
    hasAllowance,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Constants
    PYUSD_ADDRESS,
    CHIMERA_ADDRESS,
  };
}