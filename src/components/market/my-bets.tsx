import React from 'react';
import { useUserBets } from '@/hooks/use-user-bets';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, ExternalLink, User, BarChart3, Coins } from 'lucide-react';
import Link from 'next/link';

interface MyBetsProps {
  marketId?: string;
  userAddress: string;
  showAllBets?: boolean; // If true, show all user bets, if false, show only for current market
}

export const MyBets: React.FC<MyBetsProps> = ({ 
  marketId, 
  userAddress, 
  showAllBets = false 
}) => {
  const { userBets, isLoading, error, getUserBetsForMarket, getUserStats } = useUserBets(userAddress);

  // Get bets to display
  const betsToShow = showAllBets ? userBets : (marketId ? getUserBetsForMarket(marketId) : []);
  const stats = getUserStats();

  if (!userAddress) {
    return (
      <div className="p-8 text-center text-gray-400">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">Connect Wallet</p>
        <p className="text-sm">Connect your wallet to view your betting history</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#eab308]" />
        <span className="ml-2 text-gray-400">Loading your bets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        <p>Failed to load your bets</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  const formatAddress = (address: string | undefined) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* User Stats (only show when showing all bets) */}
      {showAllBets && stats.totalBets > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#eab308]">{stats.totalBets}</div>
              <div className="text-xs text-gray-400">Total Bets</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalAmount.toFixed(2)}</div>
              <div className="text-xs text-gray-400">Total SUI</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.uniqueMarkets}</div>
              <div className="text-xs text-gray-400">Markets</div>
            </CardContent>
          </Card>
          
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-[#eab308]" />
          <h3 className="text-lg font-semibold text-white">
            {showAllBets ? 'My Betting History' : 'My Bets on This Market'}
          </h3>
        </div>
        <Badge variant="outline" className="text-gray-400 border-gray-600">
          {betsToShow.length} bets
        </Badge>
      </div>

      {/* Bets List */}
      {betsToShow.length === 0 ? (
        <Card className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg font-medium mb-2">
              {showAllBets ? 'No bets yet' : 'No bets on this market'}
            </p>
            <p className="text-gray-500 text-sm">
              {showAllBets 
                ? 'Start trading to build your betting history!' 
                : 'Place your first bet on this market to see it here.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {betsToShow.map((bet) => (
            <Card key={bet.id} className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Option Icon */}
                    <div className={`p-2 rounded-lg ${
                      bet.betSide === 'A' 
                        ? 'bg-[#eab308]/20 text-[#eab308]' 
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {bet.betSide === 'A' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>

                    {/* Bet Info */}
                    <div className="flex-1 min-w-0">
                      {/* Market Title (only show when showing all bets) */}
                      {showAllBets && bet.marketTitle && (
                        <div className="mb-1">
                          <Link 
                            href={`/markets/sui/${bet.marketId}`}
                            className="text-white font-medium hover:text-[#eab308] transition-colors truncate block"
                          >
                            {bet.marketTitle}
                          </Link>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[#eab308] font-bold">
                          {bet.betAmount} SUI
                        </span>
                        <span className="text-gray-400 text-sm">on</span>
                        <Badge className={`text-xs ${
                          bet.betSide === 'A' 
                            ? 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30' 
                            : 'bg-gray-600/20 text-gray-300 border-gray-600/30'
                        }`}>
                          {bet.betSide === 'A' ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{formatTimeAgo(bet.createdAt)}</span>
                        {bet.blobId && (
                          <span className="text-[#eab308]">Walrus ✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* View Market Button (only when showing all bets) */}
                    {showAllBets && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      >
                        <Link href={`/markets/sui/${bet.marketId}`}>
                          View Market
                        </Link>
                      </Button>
                    )}
                    
                    {/* Transaction & Walrus Links */}
                    {bet.transactionHash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          window.open(`https://suiscan.xyz/testnet/tx/${bet.transactionHash}`, '_blank');
                        }}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50"
                        title="View Transaction on Suiscan"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {bet.blobId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          window.open(`https://walruscan.com/testnet/blob/${bet.blobId}`, '_blank');
                        }}
                        className="h-8 w-8 p-0 text-[#eab308] hover:text-white hover:bg-gray-700/50"
                        title="View on Walrus"
                      >
                        <Coins className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};