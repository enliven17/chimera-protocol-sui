import { useQuery } from '@tanstack/react-query';
import { pythPriceService, PYTH_PRICE_IDS, PRICE_FEED_INFO } from '@/lib/pyth-client';

export function usePythPrice(priceId: string, enabled = true) {
  return useQuery({
    queryKey: ['pyth-price', priceId],
    queryFn: () => pythPriceService.getLatestPrice(priceId),
    enabled: enabled && !!priceId,
    refetchInterval: 5000, // Update every 5 seconds
    staleTime: 3000, // Consider data stale after 3 seconds
  });
}

export function usePythMultiplePrices(priceIds: string[], enabled = true) {
  return useQuery({
    queryKey: ['pyth-multiple-prices', priceIds.join(',')],
    queryFn: () => pythPriceService.getMultiplePrices(priceIds),
    enabled: enabled && priceIds.length > 0,
    refetchInterval: 5000,
    staleTime: 3000,
  });
}

// Hook for getting price update data for on-chain submission
export function usePythPriceUpdateData(priceIds: string[], enabled = true) {
  return useQuery({
    queryKey: ['pyth-price-update-data', priceIds.join(',')],
    queryFn: () => pythPriceService.getPriceUpdateData(priceIds),
    enabled: enabled && priceIds.length > 0,
    refetchInterval: 10000, // Update every 10 seconds
    staleTime: 5000,
  });
}

// Hook for popular crypto prices
export function useCryptoPrices() {
  const cryptoPriceIds = [
    PYTH_PRICE_IDS.BTC_USD,
    PYTH_PRICE_IDS.ETH_USD,
    PYTH_PRICE_IDS.SOL_USD,
    PYTH_PRICE_IDS.USDC_USD,
    PYTH_PRICE_IDS.USDT_USD,
  ];

  const { data, isLoading, error } = usePythMultiplePrices(cryptoPriceIds);

  const formattedData = data?.map((price, index) => ({
    ...price,
    symbol: PRICE_FEED_INFO[cryptoPriceIds[index] as keyof typeof PRICE_FEED_INFO]?.symbol || 'Unknown',
    name: PRICE_FEED_INFO[cryptoPriceIds[index] as keyof typeof PRICE_FEED_INFO]?.name || 'Unknown',
  }));

  return {
    data: formattedData,
    isLoading,
    error,
  };
}

// Hook for stock prices
export function useStockPrices() {
  const stockPriceIds = [
    PYTH_PRICE_IDS.AAPL_USD,
    PYTH_PRICE_IDS.TSLA_USD,
  ];

  const { data, isLoading, error } = usePythMultiplePrices(stockPriceIds);

  const formattedData = data?.map((price, index) => ({
    ...price,
    symbol: PRICE_FEED_INFO[stockPriceIds[index] as keyof typeof PRICE_FEED_INFO]?.symbol || 'Unknown',
    name: PRICE_FEED_INFO[stockPriceIds[index] as keyof typeof PRICE_FEED_INFO]?.name || 'Unknown',
  }));

  return {
    data: formattedData,
    isLoading,
    error,
  };
}

// Hook for forex prices
export function useForexPrices() {
  const forexPriceIds = [
    PYTH_PRICE_IDS.EUR_USD,
    PYTH_PRICE_IDS.GBP_USD,
    PYTH_PRICE_IDS.JPY_USD,
  ];

  const { data, isLoading, error } = usePythMultiplePrices(forexPriceIds);

  const formattedData = data?.map((price, index) => ({
    ...price,
    symbol: PRICE_FEED_INFO[forexPriceIds[index] as keyof typeof PRICE_FEED_INFO]?.symbol || 'Unknown',
    name: PRICE_FEED_INFO[forexPriceIds[index] as keyof typeof PRICE_FEED_INFO]?.name || 'Unknown',
  }));

  return {
    data: formattedData,
    isLoading,
    error,
  };
}

// Helper hook to get price feed info
export function usePriceFeedInfo(priceId: string) {
  return PRICE_FEED_INFO[priceId as keyof typeof PRICE_FEED_INFO] || { 
    symbol: 'Unknown', 
    name: 'Unknown Asset' 
  };
}

// Hook to check if a price meets a target condition
export function usePriceConditionCheck(
  priceId: string, 
  targetPrice: number, 
  isAbove: boolean,
  enabled = true
) {
  const { data: priceData, isLoading, error } = usePythPrice(priceId, enabled);

  const conditionMet = priceData ? 
    (isAbove ? 
      parseFloat(priceData.formattedPrice) >= targetPrice : 
      parseFloat(priceData.formattedPrice) <= targetPrice
    ) : false;

  return {
    currentPrice: priceData?.formattedPrice,
    targetPrice,
    isAbove,
    conditionMet,
    isLoading,
    error,
    priceData,
  };
}