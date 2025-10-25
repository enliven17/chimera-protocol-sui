// Walrus configuration with multiple fallback endpoints
const WALRUS_ENDPOINTS = {
  publishers: [
    process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher-devnet.walrus.space',
    'https://walrus-testnet-publisher.nodes.guru',
    'https://publisher.walrus-testnet.walrus.space'
  ],
  aggregators: [
    process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator-devnet.walrus.space',
    'https://walrus-testnet-aggregator.nodes.guru', 
    'https://aggregator.walrus-testnet.walrus.space'
  ]
};

export interface WalrusBlob {
  blobId: string;
  size: number;
  encodedSize: number;
  cost: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  marketId?: string;
  analysis?: any;
}

export interface BetHistory {
  id: string;
  marketId: string;
  marketTitle: string;
  betAmount: number;
  betSide: 'A' | 'B';
  timestamp: Date;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  payout?: number;
}

export class WalrusClient {
  private publisherUrls: string[];
  private aggregatorUrls: string[];
  private currentPublisherIndex: number;
  private currentAggregatorIndex: number;
  private mockMode: boolean;
  private mockStorage: Map<string, any>;

  constructor(mockMode: boolean = false) {
    this.publisherUrls = WALRUS_ENDPOINTS.publishers;
    this.aggregatorUrls = WALRUS_ENDPOINTS.aggregators;
    this.currentPublisherIndex = 0;
    this.currentAggregatorIndex = 0;
    this.mockMode = mockMode;
    this.mockStorage = new Map();
  }

  /**
   * Get next available publisher URL
   */
  private getNextPublisherUrl(): string {
    const url = this.publisherUrls[this.currentPublisherIndex];
    this.currentPublisherIndex = (this.currentPublisherIndex + 1) % this.publisherUrls.length;
    return url;
  }

  /**
   * Get next available aggregator URL
   */
  private getNextAggregatorUrl(): string {
    const url = this.aggregatorUrls[this.currentAggregatorIndex];
    this.currentAggregatorIndex = (this.currentAggregatorIndex + 1) % this.aggregatorUrls.length;
    return url;
  }

  /**
   * Check if HTTP API is available
   */
  async isHttpApiAvailable(): Promise<boolean> {
    for (const publisherUrl of this.publisherUrls) {
      try {
        const response = await fetch(`${publisherUrl}/v1/info`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        if (response.ok) return true;
      } catch {
        continue;
      }
    }
    return false;
  }

  /**
   * Store data to Walrus with retry logic and mock mode support
   */
  async storeBlob(data: any, retries: number = 3): Promise<WalrusBlob> {
    // Mock mode for testing when Walrus is unavailable
    if (this.mockMode) {
      const blobId = this.generateMockBlobId();
      const jsonData = JSON.stringify(data);
      this.mockStorage.set(blobId, data);
      
      console.log(`[MOCK] Stored blob with ID: ${blobId}`);
      
      return {
        blobId,
        size: jsonData.length,
        encodedSize: jsonData.length,
        cost: 0,
      };
    }

    let lastError: Error | null = null;

    // Try each publisher endpoint
    for (let publisherIndex = 0; publisherIndex < this.publisherUrls.length; publisherIndex++) {
      const publisherUrl = this.getNextPublisherUrl();
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const jsonData = JSON.stringify(data);
          const blob = new Blob([jsonData], { type: 'application/json' });

          const formData = new FormData();
          formData.append('file', blob);

          const response = await fetch(`${publisherUrl}/v1/store`, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(30000), // 30 second timeout
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to store blob (${response.status}): ${errorText}`);
          }

          const result = await response.json();
          
          if (result.newlyCreated) {
            console.log(`✅ Blob stored successfully with ID: ${result.newlyCreated.blobObject.blobId}`);
            return {
              blobId: result.newlyCreated.blobObject.blobId,
              size: result.newlyCreated.blobObject.size,
              encodedSize: result.newlyCreated.blobObject.encodedSize,
              cost: result.newlyCreated.cost,
            };
          } else if (result.alreadyCertified) {
            console.log(`✅ Blob already exists with ID: ${result.alreadyCertified.blobId}`);
            return {
              blobId: result.alreadyCertified.blobId,
              size: result.alreadyCertified.size,
              encodedSize: result.alreadyCertified.encodedSize,
              cost: 0, // Already exists, no cost
            };
          }

          throw new Error('Unexpected response format from Walrus');
        } catch (error) {
          lastError = error as Error;
          console.error(`Publisher ${publisherUrl} attempt ${attempt}/${retries} failed:`, error);
          
          if (attempt < retries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }
    }
    
    // All publishers failed - throw error instead of fallback
    throw lastError || new Error('All Walrus publishers failed - no fallback to mock mode');
  }

  /**
   * Retrieve data from Walrus with retry logic and mock mode support
   */
  async retrieveBlob(blobId: string, retries: number = 3): Promise<any> {
    // Mock mode for testing
    if (this.mockMode || this.mockStorage.has(blobId)) {
      const data = this.mockStorage.get(blobId);
      if (data) {
        console.log(`[MOCK] Retrieved blob with ID: ${blobId}`);
        return data;
      } else {
        throw new Error(`Mock blob not found: ${blobId}`);
      }
    }

    let lastError: Error | null = null;

    // Try each aggregator endpoint
    for (let aggregatorIndex = 0; aggregatorIndex < this.aggregatorUrls.length; aggregatorIndex++) {
      const aggregatorUrl = this.getNextAggregatorUrl();
      
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await fetch(`${aggregatorUrl}/v1/${blobId}`, {
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(30000), // 30 second timeout
          });

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error(`Blob not found: ${blobId}`);
            }
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Failed to retrieve blob (${response.status}): ${errorText}`);
          }

          const data = await response.json();
          console.log(`✅ Blob retrieved successfully: ${blobId}`);
          return data;
        } catch (error) {
          lastError = error as Error;
          console.error(`Aggregator ${aggregatorUrl} attempt ${attempt}/${retries} failed:`, error);
          
          // If blob not found, don't retry with other endpoints
          if (error instanceof Error && error.message.includes('not found')) {
            throw error;
          }
          
          if (attempt < retries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }
    }
    
    throw lastError || new Error('All aggregators failed');
  }

  /**
   * Generate a mock blob ID for testing
   */
  private generateMockBlobId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Store chat messages to Walrus with on-chain registry
   */
  async storeChatMessages(messages: ChatMessage[], userAddress: string, signer?: any): Promise<string> {
    const chatData = {
      userAddress,
      messages,
      timestamp: new Date().toISOString(),
      type: 'chat_history',
    };

    // First store to Walrus network
    const blob = await this.storeBlob(chatData);
    
    // Then register on-chain if signer is provided
    if (signer) {
      try {
        const { storeWalrusChatMessages, calculateWalrusStorageCost } = await import('./sui-client');
        const cost = await calculateWalrusStorageCost(blob.size);
        
        await storeWalrusChatMessages(
          blob.blobId,
          messages.length,
          blob.size,
          userAddress,
          cost,
          signer
        );
        
        console.log(`Chat messages registered on-chain with blob ID: ${blob.blobId}`);
      } catch (error) {
        console.warn('Failed to register on-chain, but Walrus storage succeeded:', error);
      }
    }
    
    return blob.blobId;
  }

  /**
   * Store bet history to Walrus with on-chain registry
   */
  async storeBetHistory(bets: BetHistory[], userAddress: string, signer?: any): Promise<string> {
    const betData = {
      userAddress,
      bets,
      timestamp: new Date().toISOString(),
      type: 'bet_history',
    };

    // First store to Walrus network
    const blob = await this.storeBlob(betData);
    
    // Then register on-chain if signer is provided
    if (signer) {
      try {
        const { storeWalrusBetHistory, calculateWalrusStorageCost } = await import('./sui-client');
        const cost = await calculateWalrusStorageCost(blob.size);
        
        await storeWalrusBetHistory(
          blob.blobId,
          bets.length,
          blob.size,
          userAddress,
          cost,
          signer
        );
        
        console.log(`Bet history registered on-chain with blob ID: ${blob.blobId}`);
      } catch (error) {
        console.warn('Failed to register on-chain, but Walrus storage succeeded:', error);
      }
    }
    
    return blob.blobId;
  }

  /**
   * Retrieve chat messages from Walrus
   */
  async retrieveChatMessages(blobId: string): Promise<ChatMessage[]> {
    const data = await this.retrieveBlob(blobId);
    
    if (data.type !== 'chat_history') {
      throw new Error('Invalid data type for chat messages');
    }

    return data.messages;
  }

  /**
   * Retrieve bet history from Walrus
   */
  async retrieveBetHistory(blobId: string): Promise<BetHistory[]> {
    const data = await this.retrieveBlob(blobId);
    
    if (data.type !== 'bet_history') {
      throw new Error('Invalid data type for bet history');
    }

    return data.bets;
  }

  /**
   * Store market analysis to Walrus
   */
  async storeMarketAnalysis(analysis: any, userAddress: string): Promise<string> {
    const analysisData = {
      userAddress,
      analysis,
      timestamp: new Date().toISOString(),
      type: 'market_analysis',
    };

    const blob = await this.storeBlob(analysisData);
    return blob.blobId;
  }

  /**
   * Check if blob exists
   */
  async blobExists(blobId: string): Promise<boolean> {
    if (this.mockMode) {
      return this.mockStorage.has(blobId);
    }

    // Try each aggregator endpoint
    for (const aggregatorUrl of this.aggregatorUrls) {
      try {
        const response = await fetch(`${aggregatorUrl}/v1/${blobId}`, {
          method: 'HEAD',
          signal: AbortSignal.timeout(10000),
        });
        if (response.ok) return true;
      } catch {
        continue;
      }
    }
    return false;
  }
}

// Singleton instance - NO MOCK MODE, real Walrus storage only
export const walrusClient = new WalrusClient(false);