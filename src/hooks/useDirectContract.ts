import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CHIMERA_ABI = [
  "function getAllMarkets() view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove)[])",
  "function getActiveMarkets() view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove)[])",
  "function getMarket(uint256 marketId) view returns (tuple(uint256 id, string title, string description, string optionA, string optionB, uint8 category, address creator, uint256 createdAt, uint256 endTime, uint256 minBet, uint256 maxBet, uint8 status, uint8 outcome, bool resolved, uint256 totalOptionAShares, uint256 totalOptionBShares, uint256 totalPool, string imageUrl, uint8 marketType, bytes32 pythPriceId, int64 targetPrice, bool priceAbove))"
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS;
const RPC_URL = 'https://testnet.hashio.io/api';

export function useDirectContract() {
  const [allMarkets, setAllMarkets] = useState([]);
  const [activeMarkets, setActiveMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      minBet: ethers.formatUnits(contractMarket.minBet, 6),
      maxBet: ethers.formatUnits(contractMarket.maxBet, 6),
      status: Number(contractMarket.status),
      outcome: contractMarket.resolved ? Number(contractMarket.outcome) : null,
      resolved: contractMarket.resolved,
      totalOptionAShares: ethers.formatUnits(contractMarket.totalOptionAShares, 6),
      totalOptionBShares: ethers.formatUnits(contractMarket.totalOptionBShares, 6),
      totalPool: ethers.formatUnits(contractMarket.totalPool, 6),
      imageURI: contractMarket.imageUrl,
      marketType: Number(contractMarket.marketType),
      pythPriceId: contractMarket.pythPriceId,
      targetPrice: contractMarket.targetPrice ? ethers.formatUnits(contractMarket.targetPrice, 8) : null,
      priceAbove: contractMarket.priceAbove
    };
  };

  const fetchMarkets = async () => {
    if (!CONTRACT_ADDRESS) {
      setError('Contract address not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CHIMERA_ABI, provider);

      const [allMarketsData, activeMarketsData] = await Promise.all([
        contract.getAllMarkets(),
        contract.getActiveMarkets()
      ]);

      const transformedAllMarkets = allMarketsData.map(transformMarket);
      const transformedActiveMarkets = activeMarketsData.map(transformMarket);

      setAllMarkets(transformedAllMarkets);
      setActiveMarkets(transformedActiveMarkets);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching markets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const getMarket = async (marketId: string) => {
    if (!CONTRACT_ADDRESS) {
      return null;
    }

    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CHIMERA_ABI, provider);

      const marketData = await contract.getMarket(marketId);
      return transformMarket(marketData);
    } catch (err: any) {
      console.error('Error fetching single market:', err);
      return null;
    }
  };

  return {
    allMarkets,
    activeMarkets,
    loading,
    error,
    refetch: fetchMarkets,
    getMarket
  };
}