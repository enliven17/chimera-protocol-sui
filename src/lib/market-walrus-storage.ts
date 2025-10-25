import { walrusClient } from '@/lib/walrus-client';

export interface MarketData {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  options: {
    A: string;
    B: string;
  };
  totalVolume: number;
  totalBets: number;
  status: 'active' | 'resolved' | 'cancelled';
  resolution?: 'A' | 'B';
  createdAt: string;
  createdBy: string;
  metadata?: any;
}

export interface MarketStorageResult {
  blobId: string;
  marketId: string;
  size: number;
  cost: number;
}

export class MarketWalrusStorage {
  /**
   * Store market data to Walrus
   */
  async storeMarket(marketData: MarketData): Promise<MarketStorageResult> {
    const walrusData = {
      type: 'market_data',
      version: '1.0',
      timestamp: new Date().toISOString(),
      market: marketData,
      metadata: {
        platform: 'Chimera Protocol Sui',
        storageType: 'market',
        ...marketData.metadata
      }
    };

    try {
      const blob = await walrusClient.storeBlob(walrusData);
      
      console.log(`✅ Market stored to Walrus: ${marketData.id} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        marketId: marketData.id,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to store market ${marketData.id} to Walrus:`, error);
      throw new Error(`Market storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve market data from Walrus
   */
  async retrieveMarket(blobId: string): Promise<MarketData> {
    try {
      const data = await walrusClient.retrieveBlob(blobId);
      
      if (data.type !== 'market_data') {
        throw new Error('Invalid data type - expected market_data');
      }

      console.log(`✅ Market retrieved from Walrus: ${data.market.id}`);
      return data.market;
    } catch (error) {
      console.error(`❌ Failed to retrieve market from Walrus:`, error);
      throw new Error(`Market retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update market data in Walrus
   */
  async updateMarket(blobId: string, updatedMarketData: Partial<MarketData>): Promise<MarketStorageResult> {
    try {
      // First retrieve existing data
      const existingData = await walrusClient.retrieveBlob(blobId);
      
      if (existingData.type !== 'market_data') {
        throw new Error('Invalid data type - expected market_data');
      }

      // Merge with updated data
      const updatedMarket = {
        ...existingData.market,
        ...updatedMarketData,
        updatedAt: new Date().toISOString()
      };

      // Store updated data
      const updatedWalrusData = {
        ...existingData,
        market: updatedMarket,
        timestamp: new Date().toISOString()
      };

      const blob = await walrusClient.storeBlob(updatedWalrusData);
      
      console.log(`✅ Market updated in Walrus: ${updatedMarket.id} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        marketId: updatedMarket.id,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to update market in Walrus:`, error);
      throw new Error(`Market update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if market exists in Walrus
   */
  async marketExists(blobId: string): Promise<boolean> {
    try {
      return await walrusClient.blobExists(blobId);
    } catch (error) {
      console.error(`❌ Failed to check market existence:`, error);
      return false;
    }
  }

  /**
   * Store multiple markets in batch
   */
  async storeMarketsBatch(markets: MarketData[]): Promise<MarketStorageResult[]> {
    const results: MarketStorageResult[] = [];
    
    for (const market of markets) {
      try {
        const result = await this.storeMarket(market);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to store market ${market.id} in batch:`, error);
        // Continue with other markets
      }
    }
    
    console.log(`✅ Batch storage completed: ${results.length}/${markets.length} markets stored`);
    return results;
  }

  /**
   * Get market storage statistics
   */
  async getStorageStats(): Promise<{
    totalMarkets: number;
    totalSize: number;
    totalCost: number;
    averageSize: number;
  }> {
    // This would require implementing a way to track stored markets
    // For now, return placeholder data
    return {
      totalMarkets: 0,
      totalSize: 0,
      totalCost: 0,
      averageSize: 0
    };
  }
}

// Singleton instance
export const marketWalrusStorage = new MarketWalrusStorage();
