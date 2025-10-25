'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, TrendingDown, Trophy, Image as ImageIcon, CheckCircle, Pause } from 'lucide-react';
import { Market, placeBet, claimWinnings } from '@/lib/sui-client';
import { useBetWalrusStorage } from '@/hooks/useWalrusStorage';
import { toast } from 'sonner';
import Link from 'next/link';
import { MarketStatus } from '@/types/market';

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
  const [imageError, setImageError] = useState(false);

  const totalShares = market.totalOptionAShares + market.totalOptionBShares;
  const optionAPercentage = totalShares > 0 ? (market.totalOptionAShares / totalShares) * 100 : 50;
  const optionBPercentage = totalShares > 0 ? (market.totalOptionBShares / totalShares) * 100 : 50;

  const isExpired = Date.now() > market.endTime;
  const isActive = market.status === 0 && !isExpired;

  // Compute the actual display status based on contract status and end time
  const getActualMarketStatus = () => {
    const now = Date.now();
    const endTime = market.endTime; // Sui uses milliseconds directly

    // If resolved, always show resolved
    if (market.status === 2 || market.resolved) { // MARKET_RESOLVED = 2
      return MarketStatus.Resolved;
    }

    // If past end time but not resolved, it's pending resolution
    if (endTime <= now && market.status === 0) { // MARKET_ACTIVE = 0
      return MarketStatus.Paused; // Using Paused to represent "Pending Resolution"
    }

    // Otherwise use contract status
    return market.status === 0 ? MarketStatus.Active : MarketStatus.Paused;
  };

  const actualStatus = getActualMarketStatus();

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const diff = endTime - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "< 1h";
  };

  const hasValidImage = market.imageUrl && !imageError;

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
      console.log('🎯 Placing Sui bet:', { marketId: market.id, optionIndex: selectedOption, betAmount: amount, address: currentAccount?.address });
      
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

  return (
    <Link href={`/markets/sui/${market.id}`} className="block">
      <Card className="group bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl hover:shadow-2xl hover:shadow-[#eab308]/10 transition-all duration-300 hover:scale-[1.02] hover:border-[#eab308]/30 overflow-hidden">
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            {hasValidImage ? (
              <img
                src={market.imageUrl}
                alt={market.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-600" />
              </div>
            )}
            
            {/* Status Badge Overlay */}
            <div className="absolute top-3 left-3">
              <Badge
                variant={actualStatus === MarketStatus.Active ? "default" : "secondary"}
                className={
                  actualStatus === MarketStatus.Active
                    ? "bg-yellow-500/90 text-white border-0 backdrop-blur-sm"
                    : actualStatus === MarketStatus.Resolved
                    ? "bg-blue-500/90 text-white border-0 backdrop-blur-sm"
                    : "bg-orange-500/90 text-white border-0 backdrop-blur-sm"
                }
              >
                <div className="flex items-center space-x-1">
                  {actualStatus === MarketStatus.Active && <TrendingUp className="h-3 w-3" />}
                  {actualStatus === MarketStatus.Paused && <Pause className="h-3 w-3" />}
                  {actualStatus === MarketStatus.Resolved && <CheckCircle className="h-3 w-3" />}
                  <span className="text-xs font-medium">
                    {actualStatus === MarketStatus.Active
                      ? "Active"
                      : actualStatus === MarketStatus.Resolved
                      ? "Resolved"
                      : "Pending"}
                  </span>
                </div>
              </Badge>
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30 backdrop-blur-sm text-xs">
                Category {market.category}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-[#eab308] transition-colors duration-200">
              {market.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {market.description}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {/* Option A */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">{market.optionA}</span>
                  <span className="text-sm font-bold text-green-400">{optionAPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={optionAPercentage} className="h-2 bg-gray-700">
                  <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" />
                </Progress>
                <div className="text-xs text-gray-500">
                  {formatCurrency(market.totalOptionAShares)} shares
                </div>
              </div>

              {/* Option B */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">{market.optionB}</span>
                  <span className="text-sm font-bold text-red-400">{optionBPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={optionBPercentage} className="h-2 bg-gray-700">
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" />
                </Progress>
                <div className="text-xs text-gray-500">
                  {formatCurrency(market.totalOptionBShares)} shares
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800/50">
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {formatCurrency(market.totalPool / 1e9)}
                </div>
                <div className="text-xs text-gray-500">Total Pool (SUI)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">
                  {formatTimeRemaining(market.endTime)}
                </div>
                <div className="text-xs text-gray-500">Time Left</div>
              </div>
            </div>

            {/* Betting Section */}
            {isActive && connected && (
              <div className="space-y-3 pt-4 border-t border-gray-800/50">
                <div className="flex space-x-2">
                  <Button
                    variant={selectedOption === 0 ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 ${
                      selectedOption === 0
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "border-green-500 text-green-400 hover:bg-green-500/10"
                    }`}
                    onClick={() => setSelectedOption(0)}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {market.optionA}
                  </Button>
                  <Button
                    variant={selectedOption === 1 ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 ${
                      selectedOption === 1
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "border-red-500 text-red-400 hover:bg-red-500/10"
                    }`}
                    onClick={() => setSelectedOption(1)}
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    {market.optionB}
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Amount (SUI)"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                    min={market.minBet / 1e9}
                    max={market.maxBet / 1e9}
                    step="0.01"
                  />
                  <Button
                    onClick={handlePlaceBet}
                    disabled={isPlacingBet || !betAmount || selectedOption === null}
                    className="bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white"
                  >
                    {isPlacingBet ? "Placing..." : "Bet"}
                  </Button>
                </div>
              </div>
            )}

            {/* Claim Winnings */}
            {market.resolved && market.outcome !== undefined && (
              <div className="pt-4 border-t border-gray-800/50">
                <Button
                  onClick={handleClaimWinnings}
                  disabled={isClaiming}
                  className="w-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white"
                >
                  {isClaiming ? (
                    <>
                      <Trophy className="h-4 w-4 mr-2 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 mr-2" />
                      Claim Winnings
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}