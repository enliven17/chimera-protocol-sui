'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { Market, placeBet, claimWinnings } from '@/lib/sui-client';
import { useBetWalrusStorage } from '@/hooks/useWalrusStorage';
import { toast } from 'sonner';

interface SuiMarketCardProps {
  market: Market;
  onUpdate?: () => void;
}

export function SuiMarketCard({ market, onUpdate }: SuiMarketCardProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { storeBet } = useBetWalrusStorage();
  const connected = !!currentAccount;
  const [betAmount, setBetAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const totalShares = market.totalOptionAShares + market.totalOptionBShares;
  const optionAPercentage = totalShares > 0 ? (market.totalOptionAShares / totalShares) * 100 : 50;
  const optionBPercentage = totalShares > 0 ? (market.totalOptionBShares / totalShares) * 100 : 50;

  const isExpired = Date.now() > market.endTime;
  const isActive = market.status === 0 && !isExpired;

  const handlePlaceBet = async () => {
    if (!connected || selectedOption === null) {
      toast.error('Please connect your wallet and select an option');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < market.minBet / 1e9 || amount > market.maxBet / 1e9) {
      toast.error(`Bet amount must be between ${market.minBet / 1e9} and ${market.maxBet / 1e9} SUI`);
      return;
    }

    setIsPlacingBet(true);
    try {
      // Place bet on Sui blockchain
      await placeBet(
        market.id,
        selectedOption,
        Math.floor(amount * 1e9), // Convert to MIST
        signAndExecuteTransaction
      );

      // Store bet data to Walrus decentralized storage
      const betData = {
        id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        marketId: market.id,
        marketTitle: market.title,
        userId: currentAccount?.address || 'unknown',
        userAddress: currentAccount?.address || 'unknown',
        betAmount: amount,
        betSide: selectedOption === 0 ? 'A' as const : 'B' as const,
        odds: selectedOption === 0 ? 
          (market.totalOptionAShares + market.totalOptionBShares) / (market.totalOptionAShares + 1) :
          (market.totalOptionAShares + market.totalOptionBShares) / (market.totalOptionBShares + 1),
        potentialPayout: amount * 1.5, // Simplified calculation
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        metadata: {
          suiTransaction: true,
          optionA: market.optionA,
          optionB: market.optionB,
          minBet: market.minBet,
          maxBet: market.maxBet
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
      setSelectedOption(null);
      onUpdate?.();
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handleClaimWinnings = async () => {
    if (!connected) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsClaiming(true);
    try {
      await claimWinnings(
        market.id,
        signAndExecuteTransaction
      );

      toast.success('Winnings claimed successfully!');
      onUpdate?.();
    } catch (error) {
      console.error('Error claiming winnings:', error);
      toast.error('Failed to claim winnings');
    } finally {
      setIsClaiming(false);
    }
  };

  const getStatusBadge = () => {
    if (market.resolved) {
      return <Badge variant="secondary">Resolved</Badge>;
    }
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (isActive) {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="outline">Paused</Badge>;
  };

  const formatTimeRemaining = () => {
    if (isExpired) return 'Expired';
    
    const timeLeft = market.endTime - Date.now();
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{market.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-muted-foreground">{market.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatTimeRemaining()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Market Options */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Market Options</span>
            <span className="text-sm text-muted-foreground">
              Total Pool: {(market.totalPool / 1e9).toFixed(2)} SUI
            </span>
          </div>

          {/* Option A */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{market.optionA}</span>
              <span className="text-sm font-medium">{optionAPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={optionAPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {market.totalOptionAShares} shares
            </div>
          </div>

          {/* Option B */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{market.optionB}</span>
              <span className="text-sm font-medium">{optionBPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={optionBPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {market.totalOptionBShares} shares
            </div>
          </div>
        </div>

        {/* Betting Interface */}
        {isActive && connected && (
          <div className="space-y-3 border-t pt-4">
            <div className="text-sm font-medium">Place Your Bet</div>
            
            {/* Option Selection */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedOption === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedOption(0)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {market.optionA}
              </Button>
              <Button
                variant={selectedOption === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedOption(1)}
                className="flex items-center gap-2"
              >
                <TrendingDown className="h-4 w-4" />
                {market.optionB}
              </Button>
            </div>

            {/* Bet Amount */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bet Amount (SUI)</span>
                <span className="text-muted-foreground">
                  Min: {market.minBet / 1e9} - Max: {market.maxBet / 1e9}
                </span>
              </div>
              <Input
                type="number"
                placeholder="0.0"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min={market.minBet / 1e9}
                max={market.maxBet / 1e9}
                step="0.1"
              />
            </div>

            <Button
              onClick={handlePlaceBet}
              disabled={!selectedOption || !betAmount || isPlacingBet}
              className="w-full"
            >
              {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
            </Button>
          </div>
        )}

        {/* Resolved Market */}
        {market.resolved && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Market Resolved
            </div>
            <div className="text-sm">
              Winning Option: {market.outcome === 0 ? market.optionA : market.optionB}
            </div>
            
            {connected && (
              <Button
                onClick={handleClaimWinnings}
                disabled={isClaiming}
                variant="outline"
                className="w-full"
              >
                {isClaiming ? 'Claiming...' : 'Claim Winnings'}
              </Button>
            )}
          </div>
        )}

        {/* Connect Wallet Prompt */}
        {!connected && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Connect your Sui wallet to participate
          </div>
        )}
      </CardContent>
    </Card>
  );
}