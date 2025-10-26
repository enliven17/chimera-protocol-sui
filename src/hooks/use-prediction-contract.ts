/**
 * Stub file for EVM/Hedera prediction contract hooks
 * This is not used in the Sui-only version but kept to prevent build errors
 * TODO: Remove or replace with Sui-specific implementation
 */

import { useState } from 'react';
import { toast } from 'sonner';

export const usePredictionContract = () => {
  const [isLoading] = useState(false);

  const createMarket = async () => {
    toast.error('This feature is not available in Sui version. Please use Sui market creation.');
    return null;
  };

  const placeBet = async () => {
    toast.error('This feature is not available in Sui version. Please use Sui betting.');
    return null;
  };

  const useMarket = () => {
    return { data: null, isLoading: false };
  };

  return {
    createMarket,
    placeBet,
    isLoading,
    isPending: false,
    isConfirming: false,
    isConfirmed: false,
    hash: null,
    useMarket,
  };
};
