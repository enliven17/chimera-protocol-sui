import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  pyusdBridgeClient,
  BridgeInfo,
  BridgeStats,
  TransferHistory,
  PendingTransfer,
  TransferStatus,
  BridgeFees,
  BridgeLiquidity,
  OperatorStatus
} from '@/lib/pyusd-bridge-client';
import { toast } from 'sonner';

// Hook for bridge info
export function usePYUSDBridgeInfo() {
  return useQuery({
    queryKey: ['pyusd-bridge-info'],
    queryFn: () => pyusdBridgeClient.getBridgeInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}

// Hook for bridge statistics
export function usePYUSDBridgeStats() {
  return useQuery({
    queryKey: ['pyusd-bridge-stats'],
    queryFn: () => pyusdBridgeClient.getBridgeStats(),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });
}

// Hook for user's transfer history
export function usePYUSDTransferHistory(userAddress: string, limit = 50) {
  return useQuery({
    queryKey: ['pyusd-transfer-history', userAddress, limit],
    queryFn: () => pyusdBridgeClient.getTransferHistory(userAddress, limit),
    enabled: !!userAddress,
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

// Hook for pending transfers
export function usePYUSDPendingTransfers(userAddress?: string) {
  return useQuery({
    queryKey: ['pyusd-pending-transfers', userAddress],
    queryFn: () => pyusdBridgeClient.getPendingTransfers(userAddress),
    refetchInterval: 10 * 1000, // 10 seconds for real-time updates
    staleTime: 5 * 1000, // 5 seconds
  });
}

// Hook for transfer status
export function usePYUSDTransferStatus(txHash: string) {
  return useQuery({
    queryKey: ['pyusd-transfer-status', txHash],
    queryFn: () => pyusdBridgeClient.getTransferStatus(txHash),
    enabled: !!txHash,
    refetchInterval: 15 * 1000, // 15 seconds
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Hook for bridge fees
export function usePYUSDBridgeFees() {
  return useQuery({
    queryKey: ['pyusd-bridge-fees'],
    queryFn: () => pyusdBridgeClient.getBridgeFees(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for bridge liquidity
export function usePYUSDBridgeLiquidity() {
  return useQuery({
    queryKey: ['pyusd-bridge-liquidity'],
    queryFn: () => pyusdBridgeClient.getBridgeLiquidity(),
    refetchInterval: 60 * 1000, // 1 minute
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook for operator status
export function usePYUSDOperatorStatus() {
  return useQuery({
    queryKey: ['pyusd-operator-status'],
    queryFn: () => pyusdBridgeClient.getOperatorStatus(),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });
}

// Hook for supported networks
export function usePYUSDSupportedNetworks() {
  return useQuery({
    queryKey: ['pyusd-supported-networks'],
    queryFn: () => pyusdBridgeClient.getSupportedNetworks(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Hook for bridge health
export function usePYUSDBridgeHealth() {
  return useQuery({
    queryKey: ['pyusd-bridge-health'],
    queryFn: () => pyusdBridgeClient.getBridgeHealth(),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 15 * 1000, // 15 seconds
  });
}

// Mutation for initiating bridge transfer (Ethereum → Hedera)
export function usePYUSDInitiateBridgeTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      amount: string;
      hederaAddress: string;
      userAddress: string;
    }) => pyusdBridgeClient.initiateBridgeTransfer(params),
    onSuccess: (data, variables) => {
      toast.success('Bridge transfer initiated successfully!');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['pyusd-transfer-history', variables.userAddress] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pyusd-pending-transfers', variables.userAddress] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pyusd-bridge-stats'] 
      });
    },
    onError: (error) => {
      console.error('Error initiating bridge transfer:', error);
      toast.error('Failed to initiate bridge transfer');
    },
  });
}

// Mutation for initiating reverse bridge transfer (Hedera → Ethereum)
export function usePYUSDInitiateReverseBridgeTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      amount: string;
      ethereumAddress: string;
      userAddress: string;
    }) => pyusdBridgeClient.initiateReverseBridgeTransfer(params),
    onSuccess: (data, variables) => {
      toast.success('Reverse bridge transfer initiated successfully!');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['pyusd-transfer-history', variables.userAddress] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pyusd-pending-transfers', variables.userAddress] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['pyusd-bridge-stats'] 
      });
    },
    onError: (error) => {
      console.error('Error initiating reverse bridge transfer:', error);
      toast.error('Failed to initiate reverse bridge transfer');
    },
  });
}

// Mutation for validating transfer parameters
export function usePYUSDValidateTransfer() {
  return useMutation({
    mutationFn: (params: {
      amount: string;
      fromNetwork: string;
      toNetwork: string;
      userAddress: string;
    }) => pyusdBridgeClient.validateTransfer(params),
    onError: (error) => {
      console.error('Error validating transfer:', error);
      toast.error('Failed to validate transfer parameters');
    },
  });
}

// Hook for transfer time estimation
export function usePYUSDTransferTimeEstimate(fromNetwork: string, toNetwork: string) {
  return useQuery({
    queryKey: ['pyusd-transfer-time-estimate', fromNetwork, toNetwork],
    queryFn: () => pyusdBridgeClient.estimateTransferTime(fromNetwork, toNetwork),
    enabled: !!fromNetwork && !!toNetwork,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Combined hook for comprehensive bridge dashboard
export function usePYUSDBridgeDashboard(userAddress?: string) {
  const bridgeInfo = usePYUSDBridgeInfo();
  const bridgeStats = usePYUSDBridgeStats();
  const bridgeLiquidity = usePYUSDBridgeLiquidity();
  const operatorStatus = usePYUSDOperatorStatus();
  const bridgeHealth = usePYUSDBridgeHealth();
  const transferHistory = usePYUSDTransferHistory(userAddress || '', 20);
  const pendingTransfers = usePYUSDPendingTransfers(userAddress);

  return {
    info: bridgeInfo.data as BridgeInfo | undefined,
    stats: bridgeStats.data as BridgeStats | undefined,
    liquidity: bridgeLiquidity.data as BridgeLiquidity | undefined,
    operatorStatus: operatorStatus.data as OperatorStatus | undefined,
    health: bridgeHealth.data,
    transferHistory: transferHistory.data as TransferHistory[] | undefined,
    pendingTransfers: pendingTransfers.data as PendingTransfer[] | undefined,
    isLoading: bridgeInfo.isLoading || bridgeStats.isLoading || bridgeLiquidity.isLoading,
    error: bridgeInfo.error || bridgeStats.error || bridgeLiquidity.error,
    refetch: () => {
      bridgeInfo.refetch();
      bridgeStats.refetch();
      bridgeLiquidity.refetch();
      operatorStatus.refetch();
      bridgeHealth.refetch();
      if (userAddress) {
        transferHistory.refetch();
        pendingTransfers.refetch();
      }
    },
  };
}

// Hook for real-time transfer updates
export function usePYUSDRealTimeTransfers(userAddress: string) {
  const queryClient = useQueryClient();
  const { data: pendingTransfers } = usePYUSDPendingTransfers(userAddress);

  const subscribeToUpdates = (callback: (update: any) => void) => {
    return pyusdBridgeClient.subscribeToTransferUpdates(userAddress, (update) => {
      // Update the cache with real-time data
      queryClient.setQueryData(
        ['pyusd-pending-transfers', userAddress],
        (oldData: PendingTransfer[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(transfer => 
            transfer.id === update.transferId 
              ? { ...transfer, ...update }
              : transfer
          );
        }
      );
      
      // Call the callback
      callback(update);
      
      // Show toast notification for status changes
      if (update.status === 'completed') {
        toast.success(`Bridge transfer completed: ${update.amount} PYUSD`);
      } else if (update.status === 'failed') {
        toast.error(`Bridge transfer failed: ${update.error}`);
      }
    });
  };

  return {
    pendingTransfers,
    subscribeToUpdates,
  };
}

// Helper function to calculate bridge fees
export function calculateBridgeFee(
  amount: string, 
  fees: BridgeFees | undefined, 
  direction: 'ethToHedera' | 'hederaToEth'
): string {
  if (!fees) return '0';
  
  const amountNum = parseFloat(amount);
  const feeConfig = fees[direction];
  
  const baseFee = parseFloat(feeConfig.baseFee);
  const percentageFee = (amountNum * feeConfig.percentageFee) / 100;
  const totalFee = baseFee + percentageFee;
  
  const minFee = parseFloat(feeConfig.minFee);
  const maxFee = parseFloat(feeConfig.maxFee);
  
  return Math.max(minFee, Math.min(maxFee, totalFee)).toFixed(6);
}

// Helper function to format transfer status
export function formatTransferStatus(status: string): {
  label: string;
  color: string;
  description: string;
} {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        color: 'yellow',
        description: 'Transfer is waiting to be processed'
      };
    case 'processing':
      return {
        label: 'Processing',
        color: 'blue',
        description: 'Transfer is being processed by the bridge operator'
      };
    case 'completed':
      return {
        label: 'Completed',
        color: 'green',
        description: 'Transfer has been completed successfully'
      };
    case 'failed':
      return {
        label: 'Failed',
        color: 'red',
        description: 'Transfer failed and needs attention'
      };
    default:
      return {
        label: 'Unknown',
        color: 'gray',
        description: 'Unknown transfer status'
      };
  }
}