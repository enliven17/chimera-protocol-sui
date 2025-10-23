import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// Sui client configuration
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// Contract addresses (will be updated after deployment)
export const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';
export const MARKET_REGISTRY_ID = process.env.NEXT_PUBLIC_SUI_MARKET_REGISTRY_ID || '';

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
  signer: any
) {
  const tx = new TransactionBlock();
  
  // Split coin for the bet
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
  
  tx.moveCall({
    target: `${PACKAGE_ID}::prediction_market::place_bet`,
    arguments: [
      tx.object(marketId),
      tx.pure(option),
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
      },
    }, {
      onSuccess: (result: any) => resolve(result),
      onError: (error: any) => reject(error),
    });
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
    // This is a placeholder - in practice you'd query events or use an indexer
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
}