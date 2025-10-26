import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

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

// Create a new market
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
  signer: any
) {
  const tx = new TransactionBlock();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_market::create_market`,
    arguments: [
      tx.object(MARKET_REGISTRY_ID),
      tx.pure(Array.from(new TextEncoder().encode(title))),
      tx.pure(Array.from(new TextEncoder().encode(description))),
      tx.pure(Array.from(new TextEncoder().encode(optionA))),
      tx.pure(Array.from(new TextEncoder().encode(optionB))),
      tx.pure(category),
      tx.pure(endTime),
      tx.pure(minBet),
      tx.pure(maxBet),
      tx.pure(Array.from(new TextEncoder().encode(imageUrl))),
      tx.pure(marketType),
      tx.pure(targetPrice),
      tx.pure(priceAbove),
      tx.object('0x6'), // Clock object
    ],
  });

  return new Promise((resolve, reject) => {
    signer({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    }, {
      onSuccess: (result: any) => resolve(result),
      onError: (error: any) => reject(error),
    });
  });
}

// Place a bet on a market
export async function placeBet(
  marketId: string,
  option: number,
  amount: number,
  signAndExecuteTransaction: any
): Promise<any> {
  const txb = new TransactionBlock();
  
  // Split coin for the bet
  const [coin] = txb.splitCoins(txb.gas, [txb.pure(amount)]);
  
  txb.moveCall({
    target: `${PACKAGE_ID}::prediction_market::place_bet`,
    arguments: [
      txb.object(marketId),
      txb.pure(option),
      coin,
      txb.object('0x6'), // Clock object
    ],
  });

  // Pass the TransactionBlock directly to dapp-kit - it will handle signing
  return new Promise((resolve, reject) => {
    signAndExecuteTransaction(
      {
        transaction: txb,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      },
      {
        onSuccess: (result: any) => resolve(result),
        onError: (error: any) => reject(error),
      }
    );
  });
}

// Claim winnings
export async function claimWinnings(
  marketId: string,
  signer: any
) {
  const tx = new TransactionBlock();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_market::claim_winnings`,
    arguments: [
      tx.object(MARKET_REGISTRY_ID),
      tx.object(marketId),
    ],
  });

  return new Promise((resolve, reject) => {
    signer({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    }, {
      onSuccess: (result: any) => resolve(result),
      onError: (error: any) => reject(error),
    });
  });
}

// Resolve a market (admin only)
export async function resolveMarket(
  marketId: string,
  outcome: number,
  signer: any
) {
  const tx = new TransactionBlock();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_market::resolve_market`,
    arguments: [
      tx.object(MARKET_REGISTRY_ID),
      tx.object(marketId),
      tx.pure(outcome),
    ],
  });

  return new Promise((resolve, reject) => {
    signer({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    }, {
      onSuccess: (result: any) => resolve(result),
      onError: (error: any) => reject(error),
    });
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
    // For now, we'll try to get the market we just created
    try {
      const marketObject = await suiClient.getObject({
        id: '0x8a471a78a327f0ec0988896f275c9041beb81625ad5db7528c44905e2dae09fa',
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
      console.error('Error fetching market object:', error);
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
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::walrus_storage::calculate_storage_cost`,
      arguments: [
        tx.pure(sizeBytes),
      ],
    });

    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });

    if (result.results?.[0]?.returnValues?.[0]) {
      const [costBytes] = result.results[0].returnValues[0];
      return parseInt(costBytes.toString());
    }
    
    return 100000; // Default minimum cost
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
  signer: any
) {
  const tx = new TransactionBlock();
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(paymentAmount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::walrus_storage::store_blob`,
    arguments: [
      tx.object(WALRUS_STORAGE_REGISTRY_ID),
      tx.pure(Array.from(new TextEncoder().encode(blobId))),
      tx.pure(dataType),
      tx.pure(sizeBytes),
      tx.pure(Array.from(new TextEncoder().encode(metadata))),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });

  return new Promise((resolve, reject) => {
    signer({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    }, {
      onSuccess: (result: any) => resolve(result),
      onError: (error: any) => reject(error),
    });
  });
}

// Store chat messages on Walrus
export async function storeWalrusChatMessages(
  blobId: string,
  messagesCount: number,
  totalSize: number,
  userAddress: string,
  paymentAmount: number,
  signer: any
) {
  const tx = new TransactionBlock();
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(paymentAmount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::walrus_storage::store_chat_messages`,
    arguments: [
      tx.object(WALRUS_STORAGE_REGISTRY_ID),
      tx.pure(Array.from(new TextEncoder().encode(blobId))),
      tx.pure(messagesCount),
      tx.pure(totalSize),
      tx.pure(Array.from(new TextEncoder().encode(userAddress))),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });

  return new Promise((resolve, reject) => {
    signer({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    }, {
      onSuccess: (result: any) => resolve(result),
      onError: (error: any) => reject(error),
    });
  });
}

// Store bet history on Walrus
export async function storeWalrusBetHistory(
  blobId: string,
  betsCount: number,
  totalSize: number,
  userAddress: string,
  paymentAmount: number,
  signer: any
) {
  const tx = new TransactionBlock();
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(paymentAmount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::walrus_storage::store_bet_history`,
    arguments: [
      tx.object(WALRUS_STORAGE_REGISTRY_ID),
      tx.pure(Array.from(new TextEncoder().encode(blobId))),
      tx.pure(betsCount),
      tx.pure(totalSize),
      tx.pure(Array.from(new TextEncoder().encode(userAddress))),
      coin,
      tx.object('0x6'), // Clock object
    ],
  });

  return new Promise((resolve, reject) => {
    signer({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    }, {
      onSuccess: (result: any) => resolve(result),
      onError: (error: any) => reject(error),
    });
  });
}

// Get blob information from registry
export async function getWalrusBlobInfo(blobId: string, signer: any): Promise<WalrusStorageRecord | null> {
  try {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::walrus_storage::get_blob_info`,
      arguments: [
        tx.object(WALRUS_STORAGE_REGISTRY_ID),
        tx.pure(Array.from(new TextEncoder().encode(blobId))),
        tx.object('0x6'), // Clock object
      ],
    });

    const result = await new Promise<any>((resolve, reject) => {
      signer({
        transactionBlock: tx,
        options: {
          showEffects: true,
          showEvents: true,
        },
      }, {
        onSuccess: (result: any) => resolve(result),
        onError: (error: any) => reject(error),
      });
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
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::walrus_storage::blob_exists`,
      arguments: [
        tx.object(WALRUS_STORAGE_REGISTRY_ID),
        tx.pure(Array.from(new TextEncoder().encode(blobId))),
      ],
    });

    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });

    if (result.results?.[0]?.returnValues?.[0]) {
      const [existsBytes] = result.results[0].returnValues[0];
      return existsBytes[0] === 1;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking blob existence:', error);
    return false;
  }
}

// Get registry statistics
export async function getWalrusRegistryStats(): Promise<WalrusStorageStats> {
  try {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::walrus_storage::get_registry_stats`,
      arguments: [
        tx.object(WALRUS_STORAGE_REGISTRY_ID),
      ],
    });

    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });

    if (result.results?.[0]?.returnValues) {
      const [totalBlobsBytes, totalStorageBytes] = result.results[0].returnValues;
      return {
        totalBlobs: parseInt(totalBlobsBytes.toString()),
        totalStorage: parseInt(totalStorageBytes.toString()),
      };
    }
    
    return { totalBlobs: 0, totalStorage: 0 };
  } catch (error) {
    console.error('Error getting registry stats:', error);
    return { totalBlobs: 0, totalStorage: 0 };
  }
}