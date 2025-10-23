import React from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

// ChimeraProtocol ABI (JSON format for better compatibility)
const CHIMERA_ABI = [
  // Read functions
  {
    "inputs": [{"name": "marketId", "type": "uint256"}],
    "name": "getMarket",
    "outputs": [
      {
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "title", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "optionA", "type": "string"},
          {"name": "optionB", "type": "string"},
          {"name": "category", "type": "uint8"},
          {"name": "creator", "type": "address"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "endTime", "type": "uint256"},
          {"name": "minBet", "type": "uint256"},
          {"name": "maxBet", "type": "uint256"},
          {"name": "status", "type": "uint8"},
          {"name": "outcome", "type": "uint8"},
          {"name": "resolved", "type": "bool"},
          {"name": "totalOptionAShares", "type": "uint256"},
          {"name": "totalOptionBShares", "type": "uint256"},
          {"name": "totalPool", "type": "uint256"},
          {"name": "imageUrl", "type": "string"},
          {"name": "marketType", "type": "uint8"},
          {"name": "pythPriceId", "type": "bytes32"},
          {"name": "targetPrice", "type": "int64"},
          {"name": "priceAbove", "type": "bool"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketCounter",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "marketId", "type": "uint256"},
      {"name": "option", "type": "uint8"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "agent", "type": "address"},
      {"name": "maxBetAmount", "type": "uint256"}
    ],
    "name": "delegateToAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "agent", "type": "address"}],
    "name": "revokeDelegation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "marketId", "type": "uint256"}],
    "name": "claimWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS as `0x${string}`;

export function useChimeraProtocol() {
  const { writeContract, writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Debug wallet connection
  React.useEffect(() => {
    console.log('🔗 ChimeraProtocol Hook State:', {
      hash,
      isPending,
      isConfirming,
      isConfirmed,
      error: error?.message,
      CONTRACT_ADDRESS
    });
  }, [hash, isPending, isConfirming, isConfirmed, error]);

  // Read functions
  const useMarket = (marketId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "getMarket",
      args: [BigInt(marketId)],
      query: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: 30000, // 30 seconds
      },
    });
  };

  const useAllMarkets = () => {
    const result = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "getAllMarkets",
      query: {
        enabled: !!CONTRACT_ADDRESS, // Enable even without wallet
      }
    });

    // Transform contract data to frontend format
    const transformedData = result.data ? (result.data as any[]).map(transformMarket) : [];
    
    return {
      ...result,
      data: transformedData
    };
  };

  const useActiveMarkets = () => {
    const result = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "getActiveMarkets",
      query: {
        enabled: !!CONTRACT_ADDRESS, // Enable even without wallet
      }
    });

    // Transform contract data to frontend format
    const transformedData = result.data ? (result.data as any[]).map(transformMarket) : [];
    
    return {
      ...result,
      data: transformedData
    };
  };

  const useUserPosition = (userAddress: `0x${string}`, marketId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "getUserPosition",
      args: [userAddress, BigInt(marketId)],
    });
  };

  const useAgentDelegation = (userAddress: `0x${string}`, agentAddress: `0x${string}`) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "isAgentDelegated",
      args: [userAddress, agentAddress],
    });
  };

  const useMarketCounter = () => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CHIMERA_ABI,
      functionName: "marketCounter",
    });
  };

  // Write functions
  const createMarket = async (marketData: {
    title: string;
    description: string;
    optionA: string;
    optionB: string;
    category: number;
    endTime: number;
    minBet: string;
    maxBet: string;
    imageUrl: string;
    marketType: number;
    pythPriceId?: string;
    targetPrice?: string;
    priceAbove?: boolean;
  }) => {
    try {
      const minBetWei = parseUnits(marketData.minBet, 6); // PYUSD has 6 decimals
      const maxBetWei = parseUnits(marketData.maxBet, 6);
      const targetPriceScaled = marketData.targetPrice ? 
        parseUnits(marketData.targetPrice, 8) : BigInt(0); // Pyth uses 8 decimals

      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "createMarket",
        args: [
          marketData.title,
          marketData.description,
          marketData.optionA,
          marketData.optionB,
          marketData.category,
          BigInt(marketData.endTime),
          minBetWei,
          maxBetWei,
          marketData.imageUrl,
          marketData.marketType,
          (marketData.pythPriceId || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
          targetPriceScaled,
          marketData.priceAbove || false,
        ],
      });

      toast.success("Market creation transaction submitted!");
    } catch (error) {
      console.error("Error creating market:", error);
      toast.error("Failed to create market");
    }
  };

  const placeBet = async (marketId: number, option: number, amount: string) => {
    try {
      console.log('🎯 placeBet called with:', { marketId, option, amount });
      
      if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured');
      }
      
      const amountWei = parseUnits(amount, 6); // PYUSD has 6 decimals
      console.log('💰 Amount in wei:', amountWei.toString());

      console.log('📝 Calling writeContractAsync with:', {
        address: CONTRACT_ADDRESS,
        functionName: "placeBet",
        args: [BigInt(marketId), option, amountWei],
      });

      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "placeBet",
        args: [BigInt(marketId), option, amountWei],
      });

      console.log('✅ Transaction hash:', txHash);
      
      // Show success with Hedera explorer link
      const explorerUrl = `https://hashscan.io/testnet/transaction/${txHash}`;
      toast.success(
        `Bet placed successfully! 🎯`,
        {
          description: `Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
          duration: 10000,
          action: {
            label: 'View on Hedera',
            onClick: () => window.open(explorerUrl, '_blank')
          }
        }
      );
      
      return txHash;
    } catch (error) {
      console.error("❌ Error placing bet:", error);
      
      // User-friendly error messages
      let errorMessage = 'Unknown error occurred';
      
      if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fee';
      } else if (error.message?.includes('allowance')) {
        errorMessage = 'Please approve token spending first';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network connection error';
      } else if (error.code === 4001) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.code === -32603) {
        errorMessage = 'Transaction failed';
      }
      
      toast.error(errorMessage);
      throw error; // Re-throw so caller can handle
    }
  };

  const delegateToAgent = async (agentAddress: `0x${string}`, maxBetAmount: string) => {
    try {
      const maxBetWei = parseUnits(maxBetAmount, 6);

      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "delegateToAgent",
        args: [agentAddress, maxBetWei],
      });

      toast.success("Agent delegation transaction submitted!");
    } catch (error) {
      console.error("Error delegating to agent:", error);
      toast.error("Failed to delegate to agent");
    }
  };

  const revokeDelegation = async (agentAddress: `0x${string}`) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "revokeDelegation",
        args: [agentAddress],
      });

      toast.success("Delegation revocation transaction submitted!");
    } catch (error) {
      console.error("Error revoking delegation:", error);
      toast.error("Failed to revoke delegation");
    }
  };

  const claimWinnings = async (marketId: number) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CHIMERA_ABI,
        functionName: "claimWinnings",
        args: [BigInt(marketId)],
      });

      toast.success("Claim winnings transaction submitted!");
    } catch (error) {
      console.error("Error claiming winnings:", error);
      toast.error("Failed to claim winnings");
    }
  };

  return {
    // Read hooks
    useMarket,
    useAllMarkets,
    useActiveMarkets,
    useUserPosition,
    useAgentDelegation,
    useMarketCounter,
    
    // Write functions
    createMarket,
    placeBet,
    delegateToAgent,
    revokeDelegation,
    claimWinnings,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

// Helper functions
export const formatPYUSD = (amount: bigint) => {
  return formatUnits(amount, 6);
};

export const parsePYUSD = (amount: string) => {
  return parseUnits(amount, 6);
};

// Transform contract market data to frontend format
const transformMarket = (contractMarket: any) => {
  return {
    id: contractMarket.id.toString(),
    title: contractMarket.title,
    description: contractMarket.description,
    category: Number(contractMarket.category),
    optionA: contractMarket.optionA,
    optionB: contractMarket.optionB,
    creator: contractMarket.creator,
    createdAt: contractMarket.createdAt.toString(),
    endTime: contractMarket.endTime.toString(),
    minBet: formatUnits(contractMarket.minBet, 6),
    maxBet: formatUnits(contractMarket.maxBet, 6),
    status: Number(contractMarket.status),
    outcome: contractMarket.resolved ? Number(contractMarket.outcome) : null,
    resolved: contractMarket.resolved,
    totalOptionAShares: formatUnits(contractMarket.totalOptionAShares, 6),
    totalOptionBShares: formatUnits(contractMarket.totalOptionBShares, 6),
    totalPool: formatUnits(contractMarket.totalPool, 6),
    imageURI: contractMarket.imageUrl,
    marketType: Number(contractMarket.marketType),
    pythPriceId: contractMarket.pythPriceId,
    targetPrice: contractMarket.targetPrice ? formatUnits(contractMarket.targetPrice, 8) : null,
    priceAbove: contractMarket.priceAbove
  };
};