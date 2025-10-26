import { walrusClient } from '@/lib/walrus-client';

export interface BetData {
  id: string;
  marketId: string;
  marketTitle: string;
  userId: string;
  userAddress: string;
  betAmount: number;
  betSide: 'A' | 'B';
  odds: number;
  potentialPayout: number;
  status: 'active' | 'won' | 'lost' | 'cancelled' | 'refunded';
  createdAt: string;
  resolvedAt?: string;
  payout?: number;
  transactionHash?: string;
  metadata?: any;
}

export interface BetStorageResult {
  blobId: string;
  betId: string;
  size: number;
  cost: number;
}

export class BetWalrusStorage {
  /**
   * Store bet data to Walrus
   */
  async storeBet(betData: BetData): Promise<BetStorageResult> {
    const walrusData = {
      type: 'bet_data',
      version: '1.0',
      timestamp: new Date().toISOString(),
      bet: betData,
      metadata: {
        platform: 'Chimera Protocol Sui',
        storageType: 'bet',
        ...betData.metadata
      }
    };

    try {
      const blob = await walrusClient.storeBlob(walrusData);
      
      console.log(`✅ Bet stored to Walrus: ${betData.id} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        betId: betData.id,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to store bet ${betData.id} to Walrus:`, error);
      throw new Error(`Bet storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve bet data from Walrus
   */
  async retrieveBet(blobId: string): Promise<BetData> {
    try {
      const data = await walrusClient.retrieveBlob(blobId);
      
      if (data.type !== 'bet_data') {
        throw new Error('Invalid data type - expected bet_data');
      }

      console.log(`✅ Bet retrieved from Walrus: ${data.bet.id}`);
      return data.bet;
    } catch (error) {
      console.error(`❌ Failed to retrieve bet from Walrus:`, error);
      throw new Error(`Bet retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update bet data in Walrus
   */
  async updateBet(blobId: string, updatedBetData: Partial<BetData>): Promise<BetStorageResult> {
    try {
      // First retrieve existing data
      const existingData = await walrusClient.retrieveBlob(blobId);
      
      if (existingData.type !== 'bet_data') {
        throw new Error('Invalid data type - expected bet_data');
      }

      // Merge with updated data
      const updatedBet = {
        ...existingData.bet,
        ...updatedBetData,
        updatedAt: new Date().toISOString()
      };

      // Store updated data
      const updatedWalrusData = {
        ...existingData,
        bet: updatedBet,
        timestamp: new Date().toISOString()
      };

      const blob = await walrusClient.storeBlob(updatedWalrusData);
      
      console.log(`✅ Bet updated in Walrus: ${updatedBet.id} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        betId: updatedBet.id,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to update bet in Walrus:`, error);
      throw new Error(`Bet update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store user's bet history to Walrus
   */
  async storeUserBetHistory(userAddress: string, bets: BetData[]): Promise<BetStorageResult> {
    const walrusData = {
      type: 'user_bet_history',
      version: '1.0',
      timestamp: new Date().toISOString(),
      userAddress,
      bets,
      metadata: {
        platform: 'Chimera Protocol Sui',
        storageType: 'user_bet_history',
        totalBets: bets.length,
        totalAmount: bets.reduce((sum, bet) => sum + bet.betAmount, 0)
      }
    };

    try {
      const blob = await walrusClient.storeBlob(walrusData);
      
      console.log(`✅ User bet history stored to Walrus: ${userAddress} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        betId: `history_${userAddress}`,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to store user bet history to Walrus:`, error);
      throw new Error(`User bet history storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve user's bet history from Walrus
   */
  async retrieveUserBetHistory(blobId: string): Promise<BetData[]> {
    try {
      const data = await walrusClient.retrieveBlob(blobId);
      
      if (data.type !== 'user_bet_history') {
        throw new Error('Invalid data type - expected user_bet_history');
      }

      console.log(`✅ User bet history retrieved from Walrus: ${data.userAddress}`);
      return data.bets;
    } catch (error) {
      console.error(`❌ Failed to retrieve user bet history from Walrus:`, error);
      throw new Error(`User bet history retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store market's bet summary to Walrus
   */
  async storeMarketBetSummary(marketId: string, bets: BetData[]): Promise<BetStorageResult> {
    const summary = {
      marketId,
      totalBets: bets.length,
      totalVolume: bets.reduce((sum, bet) => sum + bet.betAmount, 0),
      sideA: {
        count: bets.filter(bet => bet.betSide === 'A').length,
        volume: bets.filter(bet => bet.betSide === 'A').reduce((sum, bet) => sum + bet.betAmount, 0)
      },
      sideB: {
        count: bets.filter(bet => bet.betSide === 'B').length,
        volume: bets.filter(bet => bet.betSide === 'B').reduce((sum, bet) => sum + bet.betAmount, 0)
      },
      averageBetSize: bets.length > 0 ? bets.reduce((sum, bet) => sum + bet.betAmount, 0) / bets.length : 0
    };

    const walrusData = {
      type: 'market_bet_summary',
      version: '1.0',
      timestamp: new Date().toISOString(),
      marketId,
      summary,
      bets: bets.map(bet => ({
        id: bet.id,
        userId: bet.userId,
        betAmount: bet.betAmount,
        betSide: bet.betSide,
        status: bet.status,
        createdAt: bet.createdAt
      })),
      metadata: {
        platform: 'Chimera Protocol Sui',
        storageType: 'market_bet_summary'
      }
    };

    try {
      const blob = await walrusClient.storeBlob(walrusData);
      
      console.log(`✅ Market bet summary stored to Walrus: ${marketId} -> ${blob.blobId}`);
      
      return {
        blobId: blob.blobId,
        betId: `summary_${marketId}`,
        size: blob.size,
        cost: blob.cost
      };
    } catch (error) {
      console.error(`❌ Failed to store market bet summary to Walrus:`, error);
      throw new Error(`Market bet summary storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if bet exists in Walrus
   */
  async betExists(blobId: string): Promise<boolean> {
    try {
      return await walrusClient.blobExists(blobId);
    } catch (error) {
      console.error(`❌ Failed to check bet existence:`, error);
      return false;
    }
  }

  /**
   * Store multiple bets in batch
   */
  async storeBetsBatch(bets: BetData[]): Promise<BetStorageResult[]> {
    const results: BetStorageResult[] = [];
    
    for (const bet of bets) {
      try {
        const result = await this.storeBet(bet);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to store bet ${bet.id} in batch:`, error);
        // Continue with other bets
      }
    }
    
    console.log(`✅ Batch storage completed: ${results.length}/${bets.length} bets stored`);
    return results;
  }
}

// Singleton instance
export const betWalrusStorage = new BetWalrusStorage();







