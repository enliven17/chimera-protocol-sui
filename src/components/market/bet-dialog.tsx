import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useChimeraProtocol } from '@/hooks/useChimeraProtocol';
import { usePYUSD } from '@/hooks/usePYUSD';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { Loader2, TrendingUp, AlertCircle, CheckCircle, ArrowRight, Shield, Coins } from 'lucide-react';

interface BetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketId: string;
  marketTitle: string;
  selectedSide: 'optionA' | 'optionB';
  optionA: string;
  optionB: string;
  onSuccess?: () => void;
}

export const BetDialog: React.FC<BetDialogProps> = ({
  open,
  onOpenChange,
  marketId,
  marketTitle,
  selectedSide,
  optionA,
  optionB,
  onSuccess
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Persistent step state that survives page refreshes
  const getStoredStep = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`bet-step-${marketId}`);
      return stored as 'input' | 'approval' | 'betting' | 'success' || 'input';
    }
    return 'input';
  };
  
  const [currentStep, setCurrentStep] = useState<'input' | 'approval' | 'betting' | 'success'>(getStoredStep);
  
  // Update localStorage when step changes
  const updateStep = (step: 'input' | 'approval' | 'betting' | 'success') => {
    setCurrentStep(step);
    if (typeof window !== 'undefined') {
      if (step === 'input') {
        localStorage.removeItem(`bet-step-${marketId}`);
      } else {
        localStorage.setItem(`bet-step-${marketId}`, step);
      }
    }
  };

  const { address, isConnected, chain } = useAccount();
  const { 
    useBalance, 
    useChimeraAllowance, 
    useTokenInfo,
    hasAllowance, 
    approveChimera, 
    formatBalance: formatPYUSDBalance,
    isPending: isApprovePending,
    isConfirming: isApproveConfirming 
  } = usePYUSD();
  const { data: balance } = useBalance(address);
  const { data: allowance } = useChimeraAllowance(address);
  const { placeBet, isPending, isConfirming, isConfirmed, hash, useMarket } = useChimeraProtocol();
  const { data: market } = useMarket(parseInt(marketId));

  const selectedOption = selectedSide === 'optionA' ? optionA : optionB;
  const optionIndex = selectedSide === 'optionA' ? 0 : 1;

  // Handle successful transactions
  useEffect(() => {
    if (isConfirmed && hash) {
      toast.success('Bet placed successfully!');
      setBetAmount('');
      setCurrentStep('input');
      onSuccess?.();
      onOpenChange(false);
    }
  }, [isConfirmed, hash, onSuccess, onOpenChange]);

  // Reset step when dialog closes
  useEffect(() => {
    if (!open) {
      updateStep('input');
      setBetAmount('');
      setManualAllowanceApproved(false);
    }
  }, [open]);

  // Check if user has enough balance
  const hasEnoughBalance = balance && betAmount ? 
    parseFloat(formatPYUSDBalance(balance)) >= parseFloat(betAmount) : false;

  // Manual allowance tracking to prevent page refresh issues
  const [manualAllowanceApproved, setManualAllowanceApproved] = useState(false);
  
  // Check if user has enough allowance
  const hasEnoughAllowance = (allowance && betAmount ? 
    hasAllowance(allowance, betAmount) : false) || manualAllowanceApproved;

  const needsApproval = betAmount && parseFloat(betAmount) > 0 && !hasEnoughAllowance;

  const handleApprove = async () => {
    if (!betAmount) return;
    
    try {
      setIsSubmitting(true);
      updateStep('approval');
      
      const txHash = await approveChimera(betAmount);
      
      console.log('✅ Approval submitted:', txHash);
      
      // Mark allowance as approved manually to avoid page refresh
      setManualAllowanceApproved(true);
      
      // Show success message and allow user to proceed
      toast.success('Approval successful! You can now place your bet.', {
        duration: 3000
      });
      
    } catch (error: any) {
      console.error('Approval failed:', error);
      updateStep('input'); // Reset on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!hasEnoughBalance) {
      toast.error('Insufficient PYUSD balance');
      return;
    }

    if (needsApproval) {
      toast.error('Please approve PYUSD spending first');
      return;
    }

    try {
      setIsSubmitting(true);
      updateStep('betting');
      
      console.log('🔗 Wallet Status:', {
        address,
        isConnected,
        chainId: chain?.id,
        chainName: chain?.name
      });
      
      console.log('🎯 Placing bet:', { marketId, optionIndex, betAmount, address });
      
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }
      
      if (chain?.id !== 296) {
        throw new Error(`Wrong network. Expected Hedera Testnet (296), got ${chain?.id}`);
      }
      
      const txHash = await placeBet(parseInt(marketId), optionIndex, betAmount);
      
      console.log('✅ Bet transaction submitted successfully:', txHash);
      
      // Show success step
      updateStep('success');
      
      // Close dialog after successful bet
      setTimeout(() => {
        onOpenChange(false);
        setBetAmount('');
        updateStep('input');
        onSuccess?.();
      }, 3000);
    } catch (error: any) {
      console.error('❌ Bet failed:', error);
      
      // User-friendly error messages - don't show technical details
      let errorMessage = 'Failed to place bet';
      
      if (error.message?.includes('cancelled') || error.message?.includes('rejected') || error.message?.includes('denied')) {
        errorMessage = 'Transaction cancelled';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance or gas';
      } else if (error.message?.includes('allowance')) {
        errorMessage = 'Please approve token spending first';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error - please try again';
      }
      
      toast.error(errorMessage);
      updateStep('input'); // Reset step on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0';
    return formatPYUSDBalance(balance);
  };

  const isValidAmount = betAmount && parseFloat(betAmount) > 0;

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
          {/* Step Indicator */}
          {needsApproval && (
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-gray-300 mb-3">Betting Process</h3>
              <div className="flex items-center space-x-2 text-xs">
                {/* Step 1: Approval */}
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  currentStep === 'approval' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  currentStep === 'betting' || currentStep === 'success' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-700/50 text-gray-400'
                }`}>
                  <Shield className="h-3 w-3" />
                  <span>1. Approve Spending</span>
                  {(currentStep === 'betting' || currentStep === 'success') && <CheckCircle className="h-3 w-3" />}
                  {currentStep === 'approval' && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
                
                <ArrowRight className="h-3 w-3 text-gray-500" />
                
                {/* Step 2: Place Bet */}
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  currentStep === 'betting' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  currentStep === 'success' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-700/50 text-gray-400'
                }`}>
                  <Coins className="h-3 w-3" />
                  <span>2. Place Bet</span>
                  {currentStep === 'success' && <CheckCircle className="h-3 w-3" />}
                  {currentStep === 'betting' && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
              </div>
              
              {/* Step Description */}
              <div className="mt-3 text-xs text-gray-400">
                {currentStep === 'input' && needsApproval && (
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-400">Approval Required</p>
                      <p>First, you need to approve the contract to spend your wPYUSD tokens. This is a one-time security step.</p>
                    </div>
                  </div>
                )}
                {currentStep === 'approval' && (
                  <div className="flex items-start space-x-2">
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-400">Approving Spending Cap...</p>
                      <p>Please confirm the spending cap approval in your wallet. This allows the contract to use your tokens for betting.</p>
                    </div>
                  </div>
                )}
                {currentStep === 'betting' && (
                  <div className="flex items-start space-x-2">
                    <Loader2 className="h-4 w-4 text-yellow-400 animate-spin mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-400">Placing Your Bet...</p>
                      <p>Confirm the betting transaction in your wallet to place your {betAmount} wPYUSD bet.</p>
                    </div>
                  </div>
                )}
                {currentStep === 'success' && (
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-400">Bet Placed Successfully!</p>
                      <p>Your bet has been confirmed on the Hedera network. Good luck! 🎯</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                Bet Amount (PYUSD)
              </Label>
              <Input
                id="betAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#eab308] focus:ring-[#eab308]/20"
                disabled={isSubmitting || isPending}
              />

              <div className="flex justify-between text-xs text-gray-400">
                <span>Available Balance:</span>
                <span>{formatBalance(balance)} PYUSD</span>
              </div>
              
              {/* Status info */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="text-xs text-gray-400 mt-1 space-y-1">
                  <div>Balance: {balance ? formatPYUSDBalance(balance) : 'Loading...'} wPYUSD</div>
                  <div>Status: {hasEnoughBalance ? '✅ Sufficient balance' : '❌ Insufficient balance'}</div>
                  {hasEnoughBalance && (
                    <div>Approval: {needsApproval ? '⏳ Required' : '✅ Ready'}</div>
                  )}
                </div>
              )}

              {/* Balance and Allowance Status */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="space-y-1">
                  {!hasEnoughBalance && (
                    <div className="flex items-center space-x-2 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Insufficient balance</span>
                    </div>
                  )}
                  {hasEnoughBalance && needsApproval && (
                    <div className="flex items-center space-x-2 text-yellow-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Approval required</span>
                    </div>
                  )}
                  {hasEnoughBalance && !needsApproval && (
                    <div className="flex items-center space-x-2 text-green-400 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>Ready to bet</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                disabled={isSubmitting || isPending || isApprovePending}
              >
                Cancel
              </Button>

              {needsApproval ? (
                <Button
                  type="button"
                  onClick={handleApprove}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                  disabled={!isValidAmount || isSubmitting || isApprovePending || !address || !hasEnoughBalance}
                >
                  {isSubmitting || isApprovePending || isApproveConfirming ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Approving...</span>
                    </div>
                  ) : (
                    `Approve ${betAmount || '0'} PYUSD`
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#FFE100] to-[#E6CC00] hover:from-[#E6CC00] hover:to-[#CCAA00] text-black shadow-lg font-semibold"
                  disabled={!isValidAmount || isSubmitting || isPending || !address || !hasEnoughBalance || needsApproval}
                >
                  {isSubmitting || isPending || isConfirming ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Placing Bet...</span>
                    </div>
                  ) : (
                    `Place Bet (${betAmount || '0'} PYUSD)`
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};