import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';

interface OwnerOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  showDebugInfo?: boolean;
  marketCreator?: string; // Sui market creator address
}

export const OwnerOnly: React.FC<OwnerOnlyProps> = ({ 
  children, 
  fallback,
  showFallback = true,
  showDebugInfo = false,
  marketCreator
}) => {
  const currentAccount = useCurrentAccount();
  const isConnected = !!currentAccount;
  const userAddress = currentAccount?.address;

  // For Sui, we check if the current user is the market creator
  const isOwner = marketCreator ? userAddress === marketCreator : false;

  // Debug info for development
  if (showDebugInfo && process.env.NODE_ENV === 'development') {
    console.log("OwnerOnly Debug:", {
      userLoggedIn: isConnected,
      userAddress,
      marketCreator,
      isOwner
    });
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
          Please connect your Sui wallet
        </p>
      </div>
    ) : null;
  }

  // Not market creator
  if (!isOwner) {
    return showFallback ? (
      fallback || (
        <div className="text-center">
          <Button disabled variant="outline" className="text-gray-500">
            <Lock className="h-4 w-4 mr-2" />
            Creator Only
          </Button>
          <div className="text-xs text-gray-400 mt-1 space-y-1">
            <p>Current: {truncateAddress(userAddress)}</p>
            {marketCreator && <p>Required: {truncateAddress(marketCreator)}</p>}
          </div>
        </div>
      )
    ) : null;
  }

  // Is market creator - render children
  return (
    <div>
      {children}
      {showDebugInfo && (
        <p className="text-xs text-yellow-500 mt-1">
          ✅ Market Creator: {truncateAddress(userAddress)}
        </p>
      )}
    </div>
  );
};