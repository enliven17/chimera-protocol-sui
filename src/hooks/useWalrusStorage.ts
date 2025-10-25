import { useState, useCallback } from 'react';
import { walrusClient, ChatMessage, BetHistory } from '@/lib/walrus-client';
import { toast } from 'sonner';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

export interface WalrusStorageState {
  isLoading: boolean;
  error: string | null;
  lastBlobId: string | null;
}

export function useWalrusStorage() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [state, setState] = useState<WalrusStorageState>({
    isLoading: false,
    error: null,
    lastBlobId: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setBlobId = useCallback((blobId: string | null) => {
    setState(prev => ({ ...prev, lastBlobId: blobId }));
  }, []);

  /**
   * Store chat messages to Walrus with on-chain registration
   */
  const storeChatMessages = useCallback(async (
    messages: ChatMessage[], 
    userAddress: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const blobId = await walrusClient.storeChatMessages(messages, userAddress, signAndExecute);
      setBlobId(blobId);
      toast.success('Chat history saved to Walrus and registered on-chain');
      return blobId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to store chat messages';
      setError(errorMessage);
      toast.error('Failed to save chat history');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setBlobId, signAndExecute]);

  /**
   * Store bet history to Walrus with on-chain registration
   */
  const storeBetHistory = useCallback(async (
    bets: BetHistory[], 
    userAddress: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const blobId = await walrusClient.storeBetHistory(bets, userAddress, signAndExecute);
      setBlobId(blobId);
      toast.success('Bet history saved to Walrus and registered on-chain');
      return blobId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to store bet history';
      setError(errorMessage);
      toast.error('Failed to save bet history');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setBlobId, signAndExecute]);

  /**
   * Retrieve chat messages from Walrus
   */
  const retrieveChatMessages = useCallback(async (blobId: string): Promise<ChatMessage[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const messages = await walrusClient.retrieveChatMessages(blobId);
      toast.success('Chat history loaded from Walrus');
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve chat messages';
      setError(errorMessage);
      toast.error('Failed to load chat history');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Retrieve bet history from Walrus
   */
  const retrieveBetHistory = useCallback(async (blobId: string): Promise<BetHistory[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const bets = await walrusClient.retrieveBetHistory(blobId);
      toast.success('Bet history loaded from Walrus');
      return bets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve bet history';
      setError(errorMessage);
      toast.error('Failed to load bet history');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Store market analysis to Walrus
   */
  const storeMarketAnalysis = useCallback(async (
    analysis: any, 
    userAddress: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const blobId = await walrusClient.storeMarketAnalysis(analysis, userAddress);
      setBlobId(blobId);
      toast.success('Market analysis saved to Walrus');
      return blobId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to store market analysis';
      setError(errorMessage);
      toast.error('Failed to save market analysis');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setBlobId]);

  return {
    ...state,
    storeChatMessages,
    storeBetHistory,
    retrieveChatMessages,
    retrieveBetHistory,
    storeMarketAnalysis,
  };
}