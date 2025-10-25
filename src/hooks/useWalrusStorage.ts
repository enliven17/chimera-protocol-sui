import { useState, useCallback } from 'react';
import { MarketData, MarketStorageResult } from '@/lib/market-walrus-storage';
import { BetData, BetStorageResult } from '@/lib/bet-walrus-storage';
import { CommentData, CommentStorageResult } from '@/lib/comment-walrus-storage';

export function useMarketWalrusStorage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeMarket = useCallback(async (marketData: MarketData): Promise<MarketStorageResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'market',
          action: 'store',
          data: marketData
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to store market');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Market storage error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const retrieveMarket = useCallback(async (blobId: string): Promise<MarketData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'market',
          action: 'retrieve',
          blobId
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to retrieve market');
      }

      return result.market;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Market retrieval error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMarket = useCallback(async (blobId: string, updateData: Partial<MarketData>): Promise<MarketStorageResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'market',
          action: 'update',
          blobId,
          data: updateData
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update market');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Market update error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkMarketExists = useCallback(async (blobId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'market',
          action: 'exists',
          blobId
        })
      });

      const result = await response.json();
      return result.success && result.exists;
    } catch (err) {
      console.error('Market exists check error:', err);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    storeMarket,
    retrieveMarket,
    updateMarket,
    checkMarketExists
  };
}

export function useBetWalrusStorage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeBet = useCallback(async (betData: BetData): Promise<BetStorageResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bet',
          action: 'store',
          data: betData
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to store bet');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Bet storage error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const retrieveBet = useCallback(async (blobId: string): Promise<BetData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bet',
          action: 'retrieve',
          blobId
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to retrieve bet');
      }

      return result.bet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Bet retrieval error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const storeUserBetHistory = useCallback(async (userAddress: string, bets: BetData[]): Promise<BetStorageResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bet',
          action: 'user-history',
          data: { userAddress, bets }
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to store user bet history');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('User bet history storage error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const storeMarketBetSummary = useCallback(async (marketId: string, bets: BetData[]): Promise<BetStorageResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bet',
          action: 'market-summary',
          data: { marketId, bets }
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to store market bet summary');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Market bet summary storage error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    storeBet,
    retrieveBet,
    storeUserBetHistory,
    storeMarketBetSummary
  };
}

export function useCommentWalrusStorage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeComment = useCallback(async (commentData: CommentData): Promise<CommentStorageResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment',
          action: 'store',
          data: commentData
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to store comment');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Comment storage error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const retrieveComment = useCallback(async (blobId: string): Promise<CommentData | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment',
          action: 'retrieve',
          blobId
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to retrieve comment');
      }

      return result.comment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Comment retrieval error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const storeMarketComments = useCallback(async (marketId: string, comments: CommentData[]): Promise<CommentStorageResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment',
          action: 'market-comments',
          data: { marketId, comments }
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to store market comments');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Market comments storage error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const storeUserCommentHistory = useCallback(async (userAddress: string, comments: CommentData[]): Promise<CommentStorageResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/walrus-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment',
          action: 'user-history',
          data: { userAddress, comments }
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to store user comment history');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('User comment history storage error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    storeComment,
    retrieveComment,
    storeMarketComments,
    storeUserCommentHistory
  };
}