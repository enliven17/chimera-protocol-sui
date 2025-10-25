import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { placeBet } from '@/lib/sui-client';
import { useBetWalrusStorage } from '@/hooks/useWalrusStorage';
import { toast } from 'sonner';
import { Loader2, TrendingUp, AlertCircle, CheckCircle, Coins } from 'lucide-react';

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
  
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { storeBet } = useBetWalrusStorage();
  
  const connected = !!currentAccount;
  const selectedOption = selectedSide === 'optionA' ? optionA : optionB;
  const optionIndex = selectedSide === 'optionA' ? 0 : 1;

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
      
      // Place bet on Sui blockchain
      await placeBet(
        marketId,
        optionIndex,
        Math.floor(amount * 1e9), // Convert to MIST
        signAndExecuteTransaction
      );

      // Store bet data to Walrus decentralized storage
      const betData = {
        id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        marketId: marketId,
        marketTitle: marketTitle,
        userId: currentAccount?.address || 'unknown',
        userAddress: currentAccount?.address || 'unknown',
        betAmount: amount,
        betSide: selectedSide === 'optionA' ? 'A' as const : 'B' as const,
        odds: 1.5, // Simplified calculation
        potentialPayout: amount * 1.5,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        metadata: {
          suiTransaction: true,
          optionA: optionA,
          optionB: optionB,
          minBet: minBet,
          maxBet: maxBet
        }
      };

      // Store to Walrus (async, don't wait for it)
      storeBet(betData).then((result) => {
        if (result) {
          console.log('✅ Bet stored to Walrus:', result);
        }
      }).catch((error) => {
        console.error('❌ Failed to store bet to Walrus:', error);
        // Don't show error to user as the bet was successful on Sui
      });

      toast.success('Bet placed successfully!');
      setBetAmount('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Bet failed:', error);
      
      // User-friendly error messages
      let errorMessage = 'Failed to place bet';
      
      if (error.message?.includes('cancelled') || error.message?.includes('rejected') || error.message?.includes('denied')) {
        errorMessage = 'Transaction cancelled';
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
      </DialogContent>
    </Dialog>
  );
};

