import React from 'react';
import { useContractOwner } from '@/hooks/use-contract-owner';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

interface OwnerOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  showDebugInfo?: boolean;
}

export const OwnerOnly: React.FC<OwnerOnlyProps> = ({ 
  children, 
  fallback,
  showFallback = true,
  showDebugInfo = false
}) => {
  const { address, isConnected } = useAccount();
  const { isOwner, isLoading, error, contractAddress, userAddress } = useContractOwner();

  // Debug info for development
  if (showDebugInfo && process.env.NODE_ENV === 'development') {
    console.log("OwnerOnly Debug:", {
      userLoggedIn: isConnected,
      userAddress,
      contractAddress,
      isOwner,
      isLoading,
      error
    });
  }

  // Loading state
  if (isLoading) {
    return showFallback ? (
      <Button disabled className="bg-gray-300">
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
        Checking permissions...
      </Button>
    ) : null;
  }

  // Error state
  if (error) {
    return showFallback ? (
      <div className="text-center">
        <Button disabled variant="outline" className="text-red-500 border-red-200">
          <AlertCircle className="h-4 w-4 mr-2" />
          Permission Error
        </Button>
        {showDebugInfo && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}
      </div>
    ) : null;
  }

  // Not logged in
  if (!isConnected || !userAddress) {
    return showFallback ? (
      <div className="text-center">
        <Button disabled variant="outline">
          <Lock className="h-4 w-4 mr-2" />
          Login Required
        </Button>
        <p className="text-xs text-gray-400 mt-1">
          Please connect your wallet
        </p>
      </div>
    ) : null;
  }

  // Not contract owner
  if (!isOwner) {
    return showFallback ? (
      fallback || (
        <div className="text-center">
          <Button disabled variant="outline" className="text-gray-500">
            <Lock className="h-4 w-4 mr-2" />
            Owner Only
          </Button>
          <div className="text-xs text-gray-400 mt-1 space-y-1">
            <p>Current: {truncateAddress(userAddress)}</p>
            <p>Required: {truncateAddress(contractAddress)}</p>
          </div>
        </div>
      )
    ) : null;
  }

  // Is contract owner - render children
  return (
    <div>
      {children}
      {showDebugInfo && (
        <p className="text-xs text-yellow-500 mt-1">
          ✅ Contract Owner: {truncateAddress(userAddress)}
        </p>
      )}
    </div>
  );
};