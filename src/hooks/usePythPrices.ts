import { useState, useEffect } from 'react';

// SUI Price ID from Pyth
export const PYTH_PRICE_IDS = {
  SUI_USD: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
  BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
} as const;

interface PriceData {
  price: number;
  confidence: number;
  timestamp: number;
  expo: number;
}

interface UsePythPriceResult {
  data: PriceData | null;
  isLoading: boolean;
  error: string | null;
}

// Pyth Hermes API base URL
const PYTH_API_BASE = 'https://hermes.pyth.network/v2';

// Fetch price data from Pyth Hermes REST API
async function fetchPythPrice(priceId: string): Promise<PriceData> {
  try {
    // Use Pyth Hermes REST API
    const response = await fetch(`${PYTH_API_BASE}/updates/price/latest?ids[]=${priceId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Pyth returns price data in a specific format
    // The response contains price information with expo adjustment
    if (!data.parsed || data.parsed.length === 0) {
      throw new Error('No price data in response');
    }
    
    const priceInfo = data.parsed[0];
    const priceData = priceInfo.price;
    
    // Parse price data from API response
    // price is a string like "254260113", expo is -8
    const priceStr = priceData.price || "0";
    const confStr = priceData.conf || "0";
    const expo = priceData.expo || -8;
    const publish_time = priceData.publish_time || Math.floor(Date.now() / 1000);
    
    // Convert price from integer to float based on expo
    // Example: price = "254260113", expo = -8 means 2.54260113
    const adjustedPrice = parseFloat(priceStr) * Math.pow(10, expo);
    const adjustedConf = parseFloat(confStr) * Math.pow(10, expo);
    
    return {
      price: adjustedPrice,
      confidence: adjustedConf,
      timestamp: publish_time,
      expo
    };
  } catch (error) {
    console.warn('Pyth API failed:', error);
    throw error;
  }
}

export function usePythPrice(priceId: string, enabled: boolean = true): UsePythPriceResult {
  const [data, setData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !priceId) return;

    const fetchPrice = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const priceData = await fetchPythPrice(priceId);
        setData(priceData);
      } catch (err) {
        console.error('Error fetching Pyth price:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch price');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    
    // Refresh every 5 seconds for real-time prices
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [priceId, enabled]);

  return { data, isLoading, error };
}

// Hook for checking price conditions
export function usePriceConditionCheck(
  priceId: string,
  targetPrice: number,
  priceAbove: boolean = true
): {
  isConditionMet: boolean;
  currentPrice: number | null;
  isLoading: boolean;
} {
  const { data, isLoading } = usePythPrice(priceId);
  
  const currentPrice = data ? data.price : null;
  const isConditionMet = currentPrice ? 
    (priceAbove ? currentPrice >= targetPrice : currentPrice <= targetPrice) : 
    false;

  return {
    isConditionMet,
    currentPrice,
    isLoading
  };
}

// Hook for getting multiple crypto prices
export function useCryptoPrices() {
  const suiPrice = usePythPrice(PYTH_PRICE_IDS.SUI_USD);
  const btcPrice = usePythPrice(PYTH_PRICE_IDS.BTC_USD);
  const ethPrice = usePythPrice(PYTH_PRICE_IDS.ETH_USD);

  return {
    data: {
      SUI: suiPrice.data,
      BTC: btcPrice.data,
      ETH: ethPrice.data,
    },
    isLoading: suiPrice.isLoading || btcPrice.isLoading || ethPrice.isLoading,
    error: suiPrice.error || btcPrice.error || ethPrice.error,
  };
}
