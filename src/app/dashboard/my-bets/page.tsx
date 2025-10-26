"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Wallet, 
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { BetHistory } from "@/lib/walrus-client";
import { toast } from "sonner";

export default function MyBetsPage() {
  const currentAccount = useCurrentAccount();
  const isConnected = !!currentAccount;
  const address = currentAccount?.address;

  const [bets, setBets] = useState<BetHistory[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(false);

  // Load real bet data from localStorage (where blob IDs are stored after placing bets)
  useEffect(() => {
    if (isConnected && address) {
      loadUserBets();
    }
  }, [isConnected, address]);

  // Listen for bet updates
  useEffect(() => {
    const handleBetUpdate = () => {
      if (isConnected && address) {
        loadUserBets();
      }
    };

    // Listen for custom bet update events
    window.addEventListener('betPlaced', handleBetUpdate);
    window.addEventListener('storage', handleBetUpdate);

    return () => {
      window.removeEventListener('betPlaced', handleBetUpdate);
      window.removeEventListener('storage', handleBetUpdate);
    };
  }, [isConnected, address]);

  const loadUserBets = async () => {
    if (!address) return;
    
    setIsLoadingBets(true);
    try {
      // Get stored bet blob IDs from localStorage for this user
      const storedBlobIds = localStorage.getItem(`user_bet_blobs_${address}`);
      
      if (storedBlobIds) {
        const blobIds: string[] = JSON.parse(storedBlobIds);
        const loadedBets: BetHistory[] = [];
        
        // Fetch each bet from Walrus
        for (const blobId of blobIds) {
          try {
            // Direct API call to retrieve bet history
            const response = await fetch('/api/walrus-storage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'bet',
                action: 'retrieve',
                blobId
              })
            });

            const result = await response.json();
            const betData = result.success ? (result.bet || result.bets) : null;
            if (betData && Array.isArray(betData)) {
              // If it's an array of bets
              loadedBets.push(...betData.map(bet => ({
                id: bet.id,
                marketId: bet.marketId,
                marketTitle: bet.marketTitle,
                betAmount: typeof bet.betAmount === 'number' ? bet.betAmount : Number(bet.betAmount),
                betSide: bet.betSide,
                timestamp: new Date(bet.createdAt || bet.timestamp),
                status: bet.status,
                payout: bet.payout ? (typeof bet.payout === 'number' ? bet.payout : Number(bet.payout)) : undefined
              })));
            } else if (betData) {
              // Single bet object
              loadedBets.push({
                id: betData.id,
                marketId: betData.marketId,
                marketTitle: betData.marketTitle,
                betAmount: typeof betData.betAmount === 'number' ? betData.betAmount : Number(betData.betAmount),
                betSide: betData.betSide,
                timestamp: new Date(betData.createdAt || betData.timestamp),
                status: betData.status,
                payout: betData.payout ? (typeof betData.payout === 'number' ? betData.payout : Number(betData.payout)) : undefined
              });
            }
          } catch (error) {
            console.error(`Failed to load bet from blob ${blobId}:`, error);
          }
        }
        
        // Sort by timestamp (newest first)
        loadedBets.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setBets(loadedBets);
        
        if (loadedBets.length > 0) {
          toast.success(`Loaded ${loadedBets.length} bet${loadedBets.length > 1 ? 's' : ''} from Walrus`);
        }
      }
    } catch (error) {
      console.error('Error loading user bets:', error);
      toast.error('Failed to load bet history from Walrus');
    } finally {
      setIsLoadingBets(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'lost': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'active': return <Clock className="h-4 w-4 text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'active': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.betAmount, 0);
  const totalPayout = bets.reduce((sum, bet) => sum + (bet.payout || 0), 0);
  const winRate = bets.length > 0 ? (bets.filter(bet => bet.status === 'won').length / bets.length) * 100 : 0;

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-2">
                My Betting History
              </h1>
              <p className="text-gray-400 text-lg">
                Track all your prediction market bets and performance
              </p>
            </div>

            {/* Connect Wallet Card */}
            <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#4DA6FF]/20 to-[#3B82F6]/20 rounded-full flex items-center justify-center mb-6">
                  <Wallet className="h-8 w-8 text-[#4DA6FF]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Connect your wallet to view your complete betting history and track your performance across all markets.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white"
                  >
                    <Link href="/markets">
                      Browse Markets
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  >
                    <Link href="/learn">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="h-8 w-8 text-[#4DA6FF]" />
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                    My Betting History
                  </h1>
                </div>
                <p className="text-gray-400 text-lg">
                  Track all your prediction market bets and performance
                </p>
              </div>
              
              {isConnected && (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Walrus Storage</span>
                    </div>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadUserBets}
                    disabled={isLoadingBets}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    {isLoadingBets ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          </div>

          {isConnected && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Bet Amount</p>
                        <p className="text-2xl font-bold text-white">{totalBetAmount} SUI</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-[#4DA6FF]" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Payout</p>
                        <p className="text-2xl font-bold text-white">{totalPayout} SUI</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Win Rate</p>
                        <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bet History */}
              <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-[#4DA6FF]" />
                      <span>Betting History</span>
                    </div>
                    {isLoadingBets && (
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading from Walrus...</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingBets ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-12 w-12 text-[#4DA6FF] mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-semibold text-white mb-2">Loading Bets from Walrus</h3>
                      <p className="text-gray-400">Fetching your betting history from decentralized storage...</p>
                    </div>
                  ) : bets.length === 0 ? (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Bets Yet</h3>
                      <p className="text-gray-400 mb-6">Start betting on prediction markets to see your history here.</p>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-[#4DA6FF] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#2563EB] text-white"
                      >
                        <Link href="/markets">
                          Browse Markets
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bets.map((bet) => (
                        <div
                          key={bet.id}
                          className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium truncate flex-1 mr-4">
                              {bet.marketTitle}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(bet.status)}
                              <Badge className={getStatusColor(bet.status)}>
                                {bet.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Bet Amount</p>
                              <p className="text-white font-medium">{bet.betAmount} SUI</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Side</p>
                              <p className="text-white font-medium">Option {bet.betSide}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Date</p>
                              <p className="text-white font-medium">
                                {bet.timestamp.toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Payout</p>
                              <p className="text-white font-medium">
                                {bet.payout ? `${bet.payout} SUI` : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
