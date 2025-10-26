import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { createPlaceBetTransaction } from '@/lib/sui-client';
import { useBetWalrusStorage } from '@/hooks/useWalrusStorage';
import { toast } from 'sonner';
import { Loader2, TrendingUp, AlertCircle, CheckCircle, Coins, ExternalLink, Copy } from 'lucide-react';

interface SuiBetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketId: string;
  marketTitle: string;
  selectedSide: 'optionA' | 'optionB';
  optionA: string;
  optionB: string;
  minBet: number;
  maxBet: number;
  onSuccess?: () => void;
}

export const SuiBetDialog: React.FC<SuiBetDialogProps> = ({
  open,
  onOpenChange,
  marketId,
  marketTitle,
  selectedSide,
  optionA,
  optionB,
  minBet,
  maxBet,
  onSuccess
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [betSuccess, setBetSuccess] = useState<{txHash: string, blobId?: string} | null>(null);
  
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { storeBet } = useBetWalrusStorage();
  
  const connected = !!currentAccount;
  const selectedOption = selectedSide === 'optionA' ? optionA : optionB;
  const optionIndex = selectedSide === 'optionA' ? 0 : 1;

  const formatBlobId = (blobId: string) => {
    if (!blobId) return '';
    return `${blobId.slice(0, 8)}...${blobId.slice(-8)}`;
  };

  const copyBlobId = async (blobId: string) => {
    try {
      await navigator.clipboard.writeText(blobId);
      toast.success('Blob ID copied to clipboard');
    } catch (error) {
      console.error('Failed to copy blob ID:', error);
      toast.error('Failed to copy blob ID');
    }
  };

  const openWalrusScan = (blobId: string) => {
    const walrusScanUrl = `https://walruscan.com/testnet/blob/${blobId}`;
    window.open(walrusScanUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (!connected) {
      toast.error('Please connect your Sui wallet');
      return;
    }

    const amount = parseFloat(betAmount);
    if (amount < minBet / 1e9 || amount > maxBet / 1e9) {
      toast.error(`Bet amount must be between ${minBet / 1e9} and ${maxBet / 1e9} SUI`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('🎯 Placing Sui bet:', { marketId, optionIndex, betAmount, address: currentAccount?.address });
      
      // Create and execute transaction
      const { createPlaceBetTransaction } = await import('@/lib/sui-client');
      const tx = createPlaceBetTransaction(
        marketId,
        optionIndex,
        Math.floor(amount * 1e9) // Convert to MIST
      );

      console.log('📝 Transaction created, waiting for user signature...');

      // Execute transaction using the hook - using mutateAsync for Promise support
      let result;
      try {
        console.log('🔄 Calling signAndExecuteTransaction...');
        result = await signAndExecuteTransaction({
          transaction: tx,
        });
        console.log('✅ Transaction result received:', result);
      } catch (signError: any) {
        console.error('❌ Transaction error:', signError);
        
        // Handle signing errors specifically
        if (signError.message?.includes('User rejected') || 
            signError.message?.includes('cancelled') || 
            signError.message?.includes('denied') ||
            signError.message?.includes('User canceled')) {
          console.log('👤 User cancelled transaction');
          return; // Exit silently
        }
        throw signError; // Re-throw other errors
      }

      // Check if transaction was successful and has a digest
      if (!result || !result.digest) {
        console.log('❌ Transaction was cancelled or returned no result:', result);
        return; // Exit silently if user cancelled
      }

      console.log('✅ Transaction successful with digest:', result.digest);

      // Show success modal IMMEDIATELY after transaction is confirmed (don't wait for Walrus)
      console.log('🎉 Setting bet success state with txHash:', result.digest);
      setBetSuccess({ txHash: result.digest });
      console.log('🎉 Bet success state set, showing success modal now');
      
      // Show success toast
      toast.success('Bet placed successfully!');
      setBetAmount('');
      
      console.log('📢 Dispatching betPlaced event for market:', marketId);
      
      // Dispatch custom event to update bet lists and refresh market data
      const event = new CustomEvent('betPlaced', { 
        detail: { 
          marketId, 
          userAddress: currentAccount?.address,
          txHash: result.digest,
          amount: amount
        } 
      });
      window.dispatchEvent(event);
      console.log('📢 betPlaced event dispatched successfully');
      
      // Store to Walrus in background (async, don't wait for it)
      const userAddr = currentAccount?.address;
      console.log('👤 Current user address:', userAddr);
      
      const betData = {
        id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        marketId: marketId,
        marketTitle: marketTitle,
        userId: userAddr,
        userAddress: userAddr,
        betAmount: amount,
        betSide: selectedSide === 'optionA' ? 'A' as const : 'B' as const,
        odds: 1.5, // Simplified calculation
        potentialPayout: amount * 1.5,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        transactionHash: result.digest, // Add transaction hash
        metadata: {
          suiTransaction: true,
          optionA: optionA,
          optionB: optionB,
          minBet: minBet,
          maxBet: maxBet,
          transactionHash: result.digest
        }
      };

      // FIRST: Save bet data to localStorage immediately (for fast access)
      if (currentAccount?.address) {
        try {
          // Save full bet data to localStorage
          const localBetsKey = `user_bets_${currentAccount.address}`;
          const existingBets = localStorage.getItem(localBetsKey);
          const bets = existingBets ? JSON.parse(existingBets) : [];
          bets.unshift(betData); // Add to beginning (newest first)
          localStorage.setItem(localBetsKey, JSON.stringify(bets));
          console.log('✅ Bet data saved to localStorage for fast access');
          
          // Also save to global bets for market activity
          const globalBetsKey = 'all_bets';
          const allBetsData = localStorage.getItem(globalBetsKey);
          const allBets = allBetsData ? JSON.parse(allBetsData) : [];
          allBets.unshift(betData);
          // Keep only last 100 bets to avoid localStorage bloat
          if (allBets.length > 100) allBets.splice(100);
          localStorage.setItem(globalBetsKey, JSON.stringify(allBets));
          console.log('✅ Bet added to global bets list');
        } catch (error) {
          console.error('Failed to save bet to localStorage:', error);
        }
      }
      
      // THEN: Store to Walrus in background (as backup/permanent storage)
      console.log('🔄 Starting Walrus storage for bet data:', betData);
      storeBet(betData).then((walrusResult) => {
        console.log('🔄 Walrus storage result (full):', JSON.stringify(walrusResult, null, 2));
        if (walrusResult && walrusResult.blobId) {
          console.log('✅ Bet stored to Walrus with blob ID:', walrusResult.blobId);
          
          // Update success state with blob ID (modal is already showing)
          setBetSuccess(prev => prev ? { ...prev, blobId: walrusResult.blobId } : { txHash: result.digest, blobId: walrusResult.blobId });
          
          // UPDATE: Add blob ID to the bet data in localStorage
          if (currentAccount?.address) {
            try {
              // Update user's bets with blob ID
              const localBetsKey = `user_bets_${currentAccount.address}`;
              const existingBets = localStorage.getItem(localBetsKey);
              if (existingBets) {
                const bets = JSON.parse(existingBets);
                const betIndex = bets.findIndex((b: any) => b.id === betData.id);
                if (betIndex !== -1) {
                  bets[betIndex].blobId = walrusResult.blobId;
                  bets[betIndex].metadata = {
                    ...bets[betIndex].metadata,
                    blobId: walrusResult.blobId
                  };
                  localStorage.setItem(localBetsKey, JSON.stringify(bets));
                  console.log('✅ Blob ID added to user bet data in localStorage');
                }
              }
              
              // Update global bets with blob ID
              const globalBetsKey = 'all_bets';
              const allBetsData = localStorage.getItem(globalBetsKey);
              if (allBetsData) {
                const allBets = JSON.parse(allBetsData);
                const betIndex = allBets.findIndex((b: any) => b.id === betData.id);
                if (betIndex !== -1) {
                  allBets[betIndex].blobId = walrusResult.blobId;
                  allBets[betIndex].metadata = {
                    ...allBets[betIndex].metadata,
                    blobId: walrusResult.blobId
                  };
                  localStorage.setItem(globalBetsKey, JSON.stringify(allBets));
                  console.log('✅ Blob ID added to global bet data in localStorage');
                }
              }
              
              // Save blob ID reference for Walrus lookups
              const storageKey = `user_bet_blobs_${currentAccount.address}`;
              const existingBlobs = localStorage.getItem(storageKey);
              const blobIds: string[] = existingBlobs ? JSON.parse(existingBlobs) : [];
              
              if (!blobIds.includes(walrusResult.blobId)) {
                blobIds.unshift(walrusResult.blobId);
                localStorage.setItem(storageKey, JSON.stringify(blobIds));
                console.log('✅ Walrus blob ID reference saved');
              }
              
              // Save blob ID to global index
              const globalBlobIndex = localStorage.getItem('global_bet_blobs');
              const globalBlobIds: string[] = globalBlobIndex ? JSON.parse(globalBlobIndex) : [];
              if (!globalBlobIds.includes(walrusResult.blobId)) {
                globalBlobIds.unshift(walrusResult.blobId);
                localStorage.setItem('global_bet_blobs', JSON.stringify(globalBlobIds));
                console.log('✅ Walrus blob ID added to global index');
              }
              
              // Dispatch storage event to trigger re-render
              window.dispatchEvent(new Event('storage'));
            } catch (error) {
              console.error('Failed to save Walrus blob ID:', error);
            }
          }
        } else {
          console.log('❌ Walrus storage returned null or invalid result:', walrusResult);
        }
      }).catch((error) => {
        console.error('❌ Failed to store bet to Walrus (CATCH):', error);
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          error: error
        });
        // Bet is already saved to localStorage, so it's ok if Walrus fails
      });
      
      // Don't call onSuccess yet - wait for user to close the success modal
      // onSuccess?.();
    } catch (error: any) {
      console.error('❌ Bet failed:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to place bet';
      
      if (error.message?.includes('cancelled') || error.message?.includes('rejected') || error.message?.includes('denied') || error.message?.includes('Transaction was cancelled')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance or gas';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error - please try again';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-[#eab308]" />
            <span>Place Bet</span>
          </DialogTitle>
        </DialogHeader>

        {betSuccess ? (
          <div className="space-y-6">
            {/* Success State */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-400 mb-2">Bet Placed Successfully!</h3>
              <p className="text-gray-300 text-sm mb-4">
                Your bet of {betAmount} SUI on "{selectedOption}" has been placed.
              </p>
              
              {/* Transaction Hash */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Transaction:</span>
                  <code className="text-xs text-[#eab308] font-mono">
                    {betSuccess.txHash.slice(0, 8)}...{betSuccess.txHash.slice(-8)}
                  </code>
                </div>
              </div>

              {/* Walrus Blob ID */}
              {betSuccess.blobId && (
                <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Walrus Blob:</span>
                    <div className="flex items-center space-x-1">
                      <code className="text-xs text-[#eab308] font-mono">
                        {formatBlobId(betSuccess.blobId)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyBlobId(betSuccess.blobId!)}
                        className="h-5 w-5 p-0 text-gray-400 hover:text-[#eab308]"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openWalrusScan(betSuccess.blobId!)}
                        className="h-5 w-5 p-0 text-gray-400 hover:text-[#eab308]"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setBetSuccess(null);
                    onOpenChange(false);
                    onSuccess?.(); // Call onSuccess when user closes the modal
                  }}
                  className="flex-1 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-gray-300">Market</h3>
              <p className="text-white font-medium">{marketTitle}</p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-gray-300">Your Prediction</h3>
              <Badge className={`${
                selectedSide === 'optionA'
                  ? 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30'
                  : 'bg-gray-600/20 text-gray-300 border-gray-600/30'
              } font-medium`}>
                {selectedOption}
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="betAmount" className="text-sm font-medium text-gray-300">
                  Bet Amount (SUI)
                </Label>
                <Input
                  id="betAmount"
                  type="number"
                  step="0.01"
                  min={minBet / 1e9}
                  max={maxBet / 1e9}
                  placeholder="0.00"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20"
                  disabled={isSubmitting}
                />

                <div className="flex justify-between text-xs text-gray-400">
                  <span>Min: {(minBet / 1e9).toFixed(2)} SUI</span>
                  <span>Max: {(maxBet / 1e9).toFixed(0)} SUI</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black shadow-lg font-semibold"
                  disabled={!betAmount || parseFloat(betAmount) <= 0 || isSubmitting || !connected}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Placing Bet...</span>
                    </div>
                  ) : (
                    `Place Bet (${betAmount || '0'} SUI)`
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

