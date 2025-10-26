import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// Sui client configuration
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// Contract addresses (will be updated after deployment)
export const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x0fc327ea3212fbd8ebddb035972a6cbfeb8919b8b04076fac79dcdd4afd57c22';
export const MARKET_REGISTRY_ID = process.env.NEXT_PUBLIC_SUI_MARKET_REGISTRY_ID || '0xe1542fe2d6ada31db8a063dacb247483d7d722a335f99ba6e35c3babf3bce400';
export const WALRUS_STORAGE_REGISTRY_ID = process.env.NEXT_PUBLIC_WALRUS_STORAGE_REGISTRY_ID || '0x62584cec3b2da7fdcdd7de82743fc5bd947b3d63bc7cd2dd5c3bf4975455074c';

// Market types
export const MARKET_TYPE_CUSTOM = 0;
export const MARKET_TYPE_PRICE = 1;

// Market status
export const MARKET_ACTIVE = 0;
export const MARKET_PAUSED = 1;
export const MARKET_RESOLVED = 2;

export interface Market {
  id: string;
  marketId: number;
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  category: number;
  creator: string;
  createdAt: number;
  endTime: number;
  minBet: number;
  maxBet: number;
  status: number;
  outcome: number;
  resolved: boolean;
  totalOptionAShares: number;
  totalOptionBShares: number;
  totalPool: number;
  imageUrl: string;
  marketType: number;
  targetPrice: number;
  priceAbove: boolean;
}

export interface UserPosition {
  optionAShares: number;
  optionBShares: number;
  totalInvested: number;
  claimed: boolean;
}

export interface WalrusStorageRecord {
  blobId: string;
  owner: string;
  dataType: number;
  sizeBytes: number;
  timestamp: number;
  metadata: string;
  costPaid: number;
}

export interface WalrusStorageStats {
  totalBlobs: number;
  totalStorage: number;
}

// Create transaction for creating a market
export function createMarketTransaction(
  title: string,
  description: string,
  optionA: string,
  optionB: string,
  category: number,
  endTime: number,
  minBet: number,
  maxBet: number,
  imageUrl: string,
  marketType: number,
  targetPrice: number,
  priceAbove: boolean
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_market::create_market`,
    arguments: [
      tx.object(MARKET_REGISTRY_ID),
      tx.pure.string(title),
      tx.pure.string(description),
      tx.pure.string(optionA),
      tx.pure.string(optionB),
      tx.pure.u8(category),
      tx.pure.u64(endTime),
      tx.pure.u64(minBet),
      tx.pure.u64(maxBet),
      tx.pure.string(imageUrl),
      tx.pure.u8(marketType),
      tx.pure.u64(targetPrice),
      tx.pure.bool(priceAbove),
      tx.object('0x6'), // Clock object
    ],
  });

  return tx;
}

// Legacy function for backward compatibility
export async function createMarket(
  title: string,
  description: string,
  optionA: string,
  optionB: string,
  category: number,
  endTime: number,
  minBet: number,
  maxBet: number,
  imageUrl: string,
  marketType: number,
  targetPrice: number,
  priceAbove: boolean,
  signAndExecuteTransactionMutate: any
) {
  const tx = createMarketTransaction(
    title, description, optionA, optionB, category, endTime,
    minBet, maxBet, imageUrl, marketType, targetPrice, priceAbove
  );

  return new Promise((resolve, reject) => {
    signAndExecuteTransactionMutate(
      {
        transaction: tx,
      },
      {
        onSuccess: (result: any) => resolve(result),
        onError: (error: any) => reject(error),
      }
    );
  });
}

// Create transaction for placing a bet
export function createPlaceBetTransaction(
  marketId: string,
  option: number,
  amount: number
): Transaction {
  const tx = new Transaction();
  
  console.log('🔧 Creating bet transaction:', { marketId, option, amount });
  
  // Split coin for the bet using u64 for amount
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_market::place_bet`,
    arguments: [
      tx.object(marketId),
      tx.pure.u8(option),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });
  
  console.log('✅ Transaction created successfully');
  return tx;
}

// Legacy function for backward compatibility
export async function placeBet(
  marketId: string,
  option: number,
  amount: number,
  signAndExecuteTransactionMutate: any
): Promise<any> {
  try {
    const tx = createPlaceBetTransaction(marketId, option, amount);
    
    console.log('✅ Transaction created successfully, preparing to sign...');

    // Use the mutation function directly
    return await new Promise((resolve, reject) => {
      signAndExecuteTransactionMutate(
        {
          transaction: tx,
        },
        {
          onSuccess: (result: any) => {
            console.log('✅ Transaction successful:', result);
            resolve(result);
          },
          onError: (error: any) => {
            console.error('❌ Transaction failed:', error);
            reject(error);
          },
        }
      );
    });
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    throw error;
  }
}

// Create transaction for claiming winnings
export function createClaimWinningsTransaction(marketId: string): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_market::claim_winnings`,
    arguments: [
      tx.object(MARKET_REGISTRY_ID),
      tx.object(marketId),
    ],
  });

  return tx;
}

// Legacy function for backward compatibility
export async function claimWinnings(
  marketId: string,
  signAndExecuteTransactionMutate: any
) {
  const tx = createClaimWinningsTransaction(marketId);

  return new Promise((resolve, reject) => {
    signAndExecuteTransactionMutate(
      {
        transaction: tx,
      },
      {
        onSuccess: (result: any) => resolve(result),
        onError: (error: any) => reject(error),
      }
    );
  });
}

// Create transaction for resolving a market
export function createResolveMarketTransaction(
  marketId: string,
  outcome: number
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_market::resolve_market`,
    arguments: [
      tx.object(MARKET_REGISTRY_ID),
      tx.object(marketId),
      tx.pure.u8(outcome),
    ],
  });

  return tx;
}

// Legacy function for backward compatibility
export async function resolveMarket(
  marketId: string,
  outcome: number,
  signAndExecuteTransactionMutate: any
) {
  const tx = createResolveMarketTransaction(marketId, outcome);

  return new Promise((resolve, reject) => {
    signAndExecuteTransactionMutate(
      {
        transaction: tx,
      },
      {
        onSuccess: (result: any) => resolve(result),
        onError: (error: any) => reject(error),
      }
    );
  });
}

// Get market information
export async function getMarket(marketId: string): Promise<Market | null> {
  try {
    const object = await suiClient.getObject({
      id: marketId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!object.data?.content || object.data.content.dataType !== 'moveObject') {
      return null;
    }

    const fields = (object.data.content as any).fields;
    
    return {
      id: marketId,
      marketId: parseInt(fields.market_id),
      title: fields.title,
      description: fields.description,
      optionA: fields.option_a,
      optionB: fields.option_b,
      category: parseInt(fields.category),
      creator: fields.creator,
      createdAt: parseInt(fields.created_at),
      endTime: parseInt(fields.end_time),
      minBet: parseInt(fields.min_bet),
      maxBet: parseInt(fields.max_bet),
      status: parseInt(fields.status),
      outcome: parseInt(fields.outcome),
      resolved: fields.resolved,
      totalOptionAShares: parseInt(fields.total_option_a_shares),
      totalOptionBShares: parseInt(fields.total_option_b_shares),
      totalPool: parseInt(fields.total_pool?.fields?.value || 0),
      imageUrl: fields.image_url,
      marketType: parseInt(fields.market_type),
      targetPrice: parseInt(fields.target_price),
      priceAbove: fields.price_above,
    };
  } catch (error) {
    console.error('Error fetching market:', error);
    return null;
  }
}

// Get user position in a market
export async function getUserPosition(marketId: string, userAddress: string): Promise<UserPosition | null> {
  try {
    const object = await suiClient.getObject({
      id: marketId,
      options: {
        showContent: true,
      },
    });

    if (!object.data?.content || object.data.content.dataType !== 'moveObject') {
      return null;
    }

    // This is a simplified version - in practice, you'd need to query dynamic fields
    // For now, return default values
    return {
      optionAShares: 0,
      optionBShares: 0,
      totalInvested: 0,
      claimed: false,
    };
  } catch (error) {
    console.error('Error fetching user position:', error);
    return null;
  }
}

// Get all markets (simplified - in practice you'd use events or indexing)
export async function getAllMarkets(): Promise<Market[]> {
  try {
    // Get the registry object to find all markets
    const registryObject = await suiClient.getObject({
      id: MARKET_REGISTRY_ID,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!registryObject.data || registryObject.data.content?.dataType !== 'moveObject') {
      console.error('Registry object not found or invalid');
      return [];
    }

    const registryData = registryObject.data.content.fields as any;
    const markets: Market[] = [];

    // Get all market objects from the registry
    // Note: This is a simplified approach - in practice you'd need to iterate through the table
    // For now, we'll try to get the markets we created
    const marketIds = [
      '0x8a471a78a327f0ec0988896f275c9041beb81625ad5db7528c44905e2dae09fa',
      '0x2cbf1efd4af12c9c4d805360d8a3e82497b1d6a20b0647ae96dbbc3792b4e518' // Suimera Hackathon market
    ];

    for (const marketId of marketIds) {
      try {
        const marketObject = await suiClient.getObject({
          id: marketId,
          options: {
            showContent: true,
            showType: true,
          },
        });

      if (marketObject.data && marketObject.data.content?.dataType === 'moveObject') {
        const marketData = marketObject.data.content.fields as any;
        
        const market: Market = {
          id: marketObject.data.objectId,
          marketId: parseInt(marketData.market_id),
          title: marketData.title,
          description: marketData.description,
          optionA: marketData.option_a,
          optionB: marketData.option_b,
          category: parseInt(marketData.category),
          creator: marketData.creator,
          createdAt: parseInt(marketData.created_at),
          endTime: parseInt(marketData.end_time),
          minBet: parseInt(marketData.min_bet),
          maxBet: parseInt(marketData.max_bet),
          status: parseInt(marketData.status),
          outcome: parseInt(marketData.outcome),
          resolved: marketData.resolved,
          totalOptionAShares: parseInt(marketData.total_option_a_shares),
          totalOptionBShares: parseInt(marketData.total_option_b_shares),
          totalPool: parseInt(marketData.total_pool?.fields?.value || '0'),
          imageUrl: marketData.image_url,
          marketType: parseInt(marketData.market_type),
          targetPrice: parseInt(marketData.target_price),
          priceAbove: marketData.price_above,
        };

        markets.push(market);
        }
      } catch (error) {
        console.error(`Error fetching market object ${marketId}:`, error);
      }
    }

    return markets;
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
}

// === Walrus Storage Functions ===

// Data type constants
export const WALRUS_DATA_TYPES = {
  CHAT_HISTORY: 1,
  BET_HISTORY: 2,
  MARKET_ANALYSIS: 3,
};

// Calculate storage cost for Walrus
export async function calculateWalrusStorageCost(sizeBytes: number): Promise<number> {
  try {
    // For now, return a simple calculation based on size
    // In production, you would call the smart contract
    const baseCost = 100000; // 0.0001 SUI
    const sizeCost = Math.floor(sizeBytes / 1024) * 10000; // 0.00001 SUI per KB
    return baseCost + sizeCost;
  } catch (error) {
    console.error('Error calculating storage cost:', error);
    return 100000; // Default minimum cost
  }
}

// Store blob reference on-chain
export async function storeWalrusBlob(
  blobId: string,
  dataType: number,
  sizeBytes: number,
  metadata: string,
  paymentAmount: number,
  signAndExecuteTransactionMutate: any
) {
  const tx = new Transaction();
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::walrus_storage::store_blob`,
    arguments: [
      tx.object(WALRUS_STORAGE_REGISTRY_ID),
      tx.pure.string(blobId),
      tx.pure.u8(dataType),
      tx.pure.u64(sizeBytes),
      tx.pure.string(metadata),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });

  return new Promise((resolve, reject) => {
    signAndExecuteTransactionMutate(
      {
        transaction: tx,
      },
      {
        onSuccess: (result: any) => resolve(result),
        onError: (error: any) => reject(error),
      }
    );
  });
}

// Store chat messages on Walrus
export async function storeWalrusChatMessages(
  blobId: string,
  messagesCount: number,
  totalSize: number,
  userAddress: string,
  paymentAmount: number,
  signAndExecuteTransactionMutate: any
) {
  const tx = new Transaction();
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::walrus_storage::store_chat_messages`,
    arguments: [
      tx.object(WALRUS_STORAGE_REGISTRY_ID),
      tx.pure.string(blobId),
      tx.pure.u64(messagesCount),
      tx.pure.u64(totalSize),
      tx.pure.address(userAddress),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });

  return new Promise((resolve, reject) => {
    signAndExecuteTransactionMutate(
      {
        transaction: tx,
      },
      {
        onSuccess: (result: any) => resolve(result),
        onError: (error: any) => reject(error),
      }
    );
  });
}

// Store bet history on Walrus
export async function storeWalrusBetHistory(
  blobId: string,
  betsCount: number,
  totalSize: number,
  userAddress: string,
  paymentAmount: number,
  signAndExecuteTransactionMutate: any
) {
  const tx = new Transaction();
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::walrus_storage::store_bet_history`,
    arguments: [
      tx.object(WALRUS_STORAGE_REGISTRY_ID),
      tx.pure.string(blobId),
      tx.pure.u64(betsCount),
      tx.pure.u64(totalSize),
      tx.pure.address(userAddress),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });

  return new Promise((resolve, reject) => {
    signAndExecuteTransactionMutate(
      {
        transaction: tx,
      },
      {
        onSuccess: (result: any) => resolve(result),
        onError: (error: any) => reject(error),
      }
    );
  });
}

// Get blob information from registry
export async function getWalrusBlobInfo(blobId: string, signAndExecuteTransactionMutate: any): Promise<WalrusStorageRecord | null> {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::walrus_storage::get_blob_info`,
      arguments: [
        tx.object(WALRUS_STORAGE_REGISTRY_ID),
        tx.pure.string(blobId),
        tx.object('0x6'), // Clock object
      ],
    });

    const result = await new Promise<any>((resolve, reject) => {
      signAndExecuteTransactionMutate(
        {
          transaction: tx,
        },
        {
          onSuccess: (result: any) => resolve(result),
          onError: (error: any) => reject(error),
        }
      );
    });

    // Parse the result from transaction effects
    if (result.effects?.status?.status === 'success') {
      // In a real implementation, you'd parse the return values
      // For now, return a placeholder
      return {
        blobId,
        owner: '',
        dataType: 0,
        sizeBytes: 0,
        timestamp: 0,
        metadata: '',
        costPaid: 0,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting blob info:', error);
    return null;
  }
}

// Check if blob exists in registry
export async function walrusBlobExists(blobId: string): Promise<boolean> {
  try {
    // For now, assume blob exists if blobId is provided
    // In production, you would query the smart contract
    return !!blobId && blobId.length > 0;
  } catch (error) {
    console.error('Error checking blob existence:', error);
    return false;
  }
}

// Get registry statistics
export async function getWalrusRegistryStats(): Promise<WalrusStorageStats> {
  try {
    // For now, return mock data
    // In production, you would query the smart contract
    return {
      totalBlobs: 0,
      totalStorage: 0,
    };
  } catch (error) {
    console.error('Error getting registry stats:', error);
    return { totalBlobs: 0, totalStorage: 0 };
  }
}