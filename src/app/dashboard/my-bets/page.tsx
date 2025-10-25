"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Wallet, 
  Save, 
  Upload, 
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useWalrusStorage } from "@/hooks/useWalrusStorage";
import { BetHistory } from "@/lib/walrus-client";
import { toast } from "sonner";

export default function MyBetsPage() {
  const currentAccount = useCurrentAccount();
  const walrusStorage = useWalrusStorage();
  const isConnected = !!currentAccount;
  const address = currentAccount?.address;

  const [bets, setBets] = useState<BetHistory[]>([]);
  const [blobIdInput, setBlobIdInput] = useState('');
  const [isLoadingBets, setIsLoadingBets] = useState(false);

  // Mock bet data for demonstration
  const mockBets: BetHistory[] = [
    {
      id: '1',
      marketId: 'market_1',
      marketTitle: 'Bitcoin Price Above $100k by End of 2024',
      betAmount: 100,
      betSide: 'A',
      timestamp: new Date('2024-01-15'),
      status: 'active',
    },
    {
      id: '2',
      marketId: 'market_2',
      marketTitle: 'Ethereum 2.0 Launch Success',
      betAmount: 50,
      betSide: 'B',
      timestamp: new Date('2024-01-10'),
      status: 'won',
      payout: 95,
    },
    {
      id: '3',
      marketId: 'market_3',
      marketTitle: 'AI Breakthrough in 2024',
      betAmount: 75,
      betSide: 'A',
      timestamp: new Date('2024-01-05'),
      status: 'lost',
    },
  ];

  // Load mock data on component mount
  useEffect(() => {
    if (isConnected && bets.length === 0) {
      setBets(mockBets);
    }
  }, [isConnected]);

  const saveBetsToWalrus = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (bets.length === 0) {
      toast.error('No bet history to save');
      return;
    }

    const blobId = await walrusStorage.storeBetHistory(bets, address);
    if (blobId) {
      console.log('Bet history saved to Walrus with blob ID:', blobId);
    }
  };

  const loadBetsFromWalrus = async () => {
    if (!blobIdInput.trim()) {
      toast.error('Please enter a blob ID');
      return;
    }

    const loadedBets = await walrusStorage.retrieveBetHistory(blobIdInput.trim());
    if (loadedBets) {
      setBets(loadedBets);
      setBlobIdInput('');
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
                    Walrus Storage
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveBetsToWalrus}
                    disabled={walrusStorage.isLoading || bets.length === 0}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    {walrusStorage.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save to Walrus
                  </Button>
                </div>
              )}
            </div>
          </div>

          {isConnected && (
            <>
              {/* Walrus Load Section */}
              <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-purple-400" />
                    <span>Load from Walrus</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Input
                      value={blobIdInput}
                      onChange={(e) => setBlobIdInput(e.target.value)}
                      placeholder="Enter Walrus blob ID to load bet history..."
                      className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                    />
                    <Button
                      onClick={loadBetsFromWalrus}
                      disabled={walrusStorage.isLoading || !blobIdInput.trim()}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    >
                      {walrusStorage.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Load History
                    </Button>
                  </div>
                  {walrusStorage.lastBlobId && (
                    <p className="text-sm text-gray-400 mt-3">
                      Last saved blob ID: <code className="bg-gray-800 px-2 py-1 rounded text-xs">{walrusStorage.lastBlobId}</code>
                    </p>
                  )}
                </CardContent>
              </Card>

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
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-[#4DA6FF]" />
                    <span>Betting History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bets.length === 0 ? (
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
