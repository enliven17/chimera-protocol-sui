import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '@/lib/contracts/prediction-market';
import { Market } from '@/types/market';
import { useState } from 'react';
import { toast } from 'sonner';

export const usePredictionContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Place Bet Function
  const placeBet = async (marketId: string, option: 0 | 1, amount: string) => {
    try {
      setIsLoading(true);
      console.log('🎯 Placing bet:', { marketId, option, amount });
      
      const result = await writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'placeBet',
        args: [BigInt(marketId), option],
        value: parseEther(amount),
      });
      
      toast.success('Bet transaction submitted!');
      return result;
    } catch (error: any) {
      console.error('❌ Error placing bet:', error);
      toast.error(error?.message || 'Failed to place bet');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve Market (Admin only)
  const resolveMarket = async (marketId: string, outcome: 0 | 1) => {
    try {
      setIsLoading(true);
      console.log('⚖️ Resolving market:', { marketId, outcome });
      
      const result = await writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'resolveMarket',
        args: [BigInt(marketId), outcome],
      });
      
      toast.success('Market resolution submitted!');
      return result;
    } catch (error: any) {
      console.error('❌ Error resolving market:', error);
      toast.error(error?.message || 'Failed to resolve market');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create Market (Admin only)
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
  }) => {
    try {
      setIsLoading(true);
      console.log('🏗️ Creating market:', marketData);
      
      const result = await writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'createMarket',
        args: [
          marketData.title,
          marketData.description,
          marketData.optionA,
          marketData.optionB,
          marketData.category,
          BigInt(marketData.endTime),
          parseEther(marketData.minBet),
          parseEther(marketData.maxBet),
          marketData.imageUrl,
        ],
      });
      
      toast.success('Market creation submitted!');
      return result;
    } catch (error: any) {
      console.error('❌ Error creating market:', error);
      toast.error(error?.message || 'Failed to create market');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Claim Winnings Function
  const claimWinnings = async (marketId: string) => {
    try {
      setIsLoading(true);
      console.log('💰 Claiming winnings for market:', marketId);
      
      const result = await writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)],
      });
      
      toast.success('Winnings claimed successfully!');
      return result;
    } catch (error: any) {
      console.error('❌ Error claiming winnings:', error);
      toast.error(error?.message || 'Failed to claim winnings');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    placeBet,
    resolveMarket,
    createMarket,
    claimWinnings,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    hash,
    error,
  };
};

// Hook to read contract data
export const usePredictionContractRead = () => {
  // Get all markets
  const { data: allMarkets, isLoading: allMarketsLoading, refetch: refetchAllMarkets } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getAllMarkets',
  });

  // Get active markets
  const { data: activeMarkets, isLoading: activeMarketsLoading, refetch: refetchActiveMarkets } = useReadContract({
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'getActiveMarkets',
  });

  // Transform contract data to Market type
  const transformContractMarket = (contractMarket: any): Market => {
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
      minBet: formatEther(contractMarket.minBet),
      maxBet: formatEther(contractMarket.maxBet),
      status: Number(contractMarket.status),
      outcome: contractMarket.resolved ? Number(contractMarket.outcome) : null,
      resolved: contractMarket.resolved,
      totalOptionAShares: formatEther(contractMarket.totalOptionAShares),
      totalOptionBShares: formatEther(contractMarket.totalOptionBShares),
      totalPool: formatEther(contractMarket.totalPool),
      imageURI: contractMarket.imageUrl,
    };
  };

  // Get single market
  const getMarket = (marketId: string) => {
    const { data: marketData, isLoading, refetch } = useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'getMarket',
      args: [BigInt(marketId)],
    });

    return {
      market: marketData ? transformContractMarket(marketData) : null,
      isLoading,
      refetch,
    };
  };

  // Get user position
  const getUserPosition = (userAddress: string, marketId: string) => {
    const { data: positionData, isLoading, refetch } = useReadContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'getUserPosition',
      args: [userAddress as `0x${string}`, BigInt(marketId)],
    });

    return {
      position: positionData ? {
        optionAShares: formatEther(positionData.optionAShares),
        optionBShares: formatEther(positionData.optionBShares),
        totalInvested: formatEther(positionData.totalInvested),
        marketId: Number(marketId),
        currentValue: '0', // Calculate based on current market state
        profitLoss: '0', // Calculate based on current market state
      } : null,
      isLoading,
      refetch,
    };
  };

  return {
    allMarkets: allMarkets ? (allMarkets as any[]).map(transformContractMarket) : [],
    activeMarkets: activeMarkets ? (activeMarkets as any[]).map(transformContractMarket) : [],
    allMarketsLoading,
    activeMarketsLoading,
    refetchAllMarkets,
    refetchActiveMarkets,
    getMarket,
    getUserPosition,
  };
};