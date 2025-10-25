import { NextRequest, NextResponse } from 'next/server';
import { marketWalrusStorage } from '@/lib/market-walrus-storage';
import { betWalrusStorage } from '@/lib/bet-walrus-storage';
import { commentWalrusStorage } from '@/lib/comment-walrus-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, action, data, blobId } = body;

    switch (type) {
      case 'market':
        return await handleMarketAction(action, data, blobId);
      case 'bet':
        return await handleBetAction(action, data, blobId);
      case 'comment':
        return await handleCommentAction(action, data, blobId);
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Walrus storage API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleMarketAction(action: string, data: any, blobId?: string) {
  switch (action) {
    case 'store':
      if (!data) {
        return NextResponse.json({ error: 'Market data is required' }, { status: 400 });
      }
      const storeResult = await marketWalrusStorage.storeMarket(data);
      return NextResponse.json({ success: true, ...storeResult });

    case 'retrieve':
      if (!blobId) {
        return NextResponse.json({ error: 'Blob ID is required' }, { status: 400 });
      }
      const market = await marketWalrusStorage.retrieveMarket(blobId);
      return NextResponse.json({ success: true, market });

    case 'update':
      if (!blobId || !data) {
        return NextResponse.json({ error: 'Blob ID and update data are required' }, { status: 400 });
      }
      const updateResult = await marketWalrusStorage.updateMarket(blobId, data);
      return NextResponse.json({ success: true, ...updateResult });

    case 'exists':
      if (!blobId) {
        return NextResponse.json({ error: 'Blob ID is required' }, { status: 400 });
      }
      const exists = await marketWalrusStorage.marketExists(blobId);
      return NextResponse.json({ success: true, exists });

    case 'batch':
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: 'Array of markets is required' }, { status: 400 });
      }
      const batchResult = await marketWalrusStorage.storeMarketsBatch(data);
      return NextResponse.json({ success: true, results: batchResult });

    default:
      return NextResponse.json({ error: 'Invalid market action' }, { status: 400 });
  }
}

async function handleBetAction(action: string, data: any, blobId?: string) {
  switch (action) {
    case 'store':
      if (!data) {
        return NextResponse.json({ error: 'Bet data is required' }, { status: 400 });
      }
      const storeResult = await betWalrusStorage.storeBet(data);
      return NextResponse.json({ success: true, ...storeResult });

    case 'retrieve':
      if (!blobId) {
        return NextResponse.json({ error: 'Blob ID is required' }, { status: 400 });
      }
      const bet = await betWalrusStorage.retrieveBet(blobId);
      return NextResponse.json({ success: true, bet });

    case 'update':
      if (!blobId || !data) {
        return NextResponse.json({ error: 'Blob ID and update data are required' }, { status: 400 });
      }
      const updateResult = await betWalrusStorage.updateBet(blobId, data);
      return NextResponse.json({ success: true, ...updateResult });

    case 'exists':
      if (!blobId) {
        return NextResponse.json({ error: 'Blob ID is required' }, { status: 400 });
      }
      const exists = await betWalrusStorage.betExists(blobId);
      return NextResponse.json({ success: true, exists });

    case 'user-history':
      if (!data.userAddress || !Array.isArray(data.bets)) {
        return NextResponse.json({ error: 'User address and bets array are required' }, { status: 400 });
      }
      const historyResult = await betWalrusStorage.storeUserBetHistory(data.userAddress, data.bets);
      return NextResponse.json({ success: true, ...historyResult });

    case 'market-summary':
      if (!data.marketId || !Array.isArray(data.bets)) {
        return NextResponse.json({ error: 'Market ID and bets array are required' }, { status: 400 });
      }
      const summaryResult = await betWalrusStorage.storeMarketBetSummary(data.marketId, data.bets);
      return NextResponse.json({ success: true, ...summaryResult });

    case 'batch':
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: 'Array of bets is required' }, { status: 400 });
      }
      const batchResult = await betWalrusStorage.storeBetsBatch(data);
      return NextResponse.json({ success: true, results: batchResult });

    default:
      return NextResponse.json({ error: 'Invalid bet action' }, { status: 400 });
  }
}

async function handleCommentAction(action: string, data: any, blobId?: string) {
  switch (action) {
    case 'store':
      if (!data) {
        return NextResponse.json({ error: 'Comment data is required' }, { status: 400 });
      }
      const storeResult = await commentWalrusStorage.storeComment(data);
      return NextResponse.json({ success: true, ...storeResult });

    case 'retrieve':
      if (!blobId) {
        return NextResponse.json({ error: 'Blob ID is required' }, { status: 400 });
      }
      const comment = await commentWalrusStorage.retrieveComment(blobId);
      return NextResponse.json({ success: true, comment });

    case 'update':
      if (!blobId || !data) {
        return NextResponse.json({ error: 'Blob ID and update data are required' }, { status: 400 });
      }
      const updateResult = await commentWalrusStorage.updateComment(blobId, data);
      return NextResponse.json({ success: true, ...updateResult });

    case 'exists':
      if (!blobId) {
        return NextResponse.json({ error: 'Blob ID is required' }, { status: 400 });
      }
      const exists = await commentWalrusStorage.commentExists(blobId);
      return NextResponse.json({ success: true, exists });

    case 'market-comments':
      if (!data.marketId || !Array.isArray(data.comments)) {
        return NextResponse.json({ error: 'Market ID and comments array are required' }, { status: 400 });
      }
      const marketCommentsResult = await commentWalrusStorage.storeMarketComments(data.marketId, data.comments);
      return NextResponse.json({ success: true, ...marketCommentsResult });

    case 'user-history':
      if (!data.userAddress || !Array.isArray(data.comments)) {
        return NextResponse.json({ error: 'User address and comments array are required' }, { status: 400 });
      }
      const historyResult = await commentWalrusStorage.storeUserCommentHistory(data.userAddress, data.comments);
      return NextResponse.json({ success: true, ...historyResult });

    case 'with-replies':
      if (!data.comment || !Array.isArray(data.replies)) {
        return NextResponse.json({ error: 'Comment and replies array are required' }, { status: 400 });
      }
      const repliesResult = await commentWalrusStorage.storeCommentWithReplies(data.comment, data.replies);
      return NextResponse.json({ success: true, ...repliesResult });

    case 'batch':
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: 'Array of comments is required' }, { status: 400 });
      }
      const batchResult = await commentWalrusStorage.storeCommentsBatch(data);
      return NextResponse.json({ success: true, results: batchResult });

    default:
      return NextResponse.json({ error: 'Invalid comment action' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const action = searchParams.get('action');
    const blobId = searchParams.get('blobId');

    if (!type || !action) {
      return NextResponse.json({ error: 'Type and action are required' }, { status: 400 });
    }

    switch (type) {
      case 'market':
        return await handleMarketAction(action, null, blobId || undefined);
      case 'bet':
        return await handleBetAction(action, null, blobId || undefined);
      case 'comment':
        return await handleCommentAction(action, null, blobId || undefined);
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Walrus storage API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

