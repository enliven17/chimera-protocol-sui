import React from 'react';
import { useBetActivity } from '@/hooks/use-bet-activity';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { formatEther } from 'viem';

interface MarketActivityProps {
  marketId: string;
  marketTitle: string;
  optionA: string;
  optionB: string;
}

export const MarketActivity: React.FC<MarketActivityProps> = ({
  marketId,
  marketTitle,
  optionA,
  optionB
}) => {
  const { activities, isLoading, error } = useBetActivity(marketId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#eab308]" />
        <span className="ml-2 text-gray-400">Loading activity...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        <p>Failed to load market activity</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No bets yet</p>
        <p className="text-sm">Be the first to place a bet on this market!</p>
      </div>
    );
  }

  const formatAddress = (address: string) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <Badge variant="outline" className="text-gray-400 border-gray-600">
          {activities.length} bets
        </Badge>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <Card key={activity.id} className="bg-gradient-to-r from-[#1A1F2C] to-[#151923] border-gray-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Option Icon */}
                  <div className={`p-2 rounded-lg ${activity.option === 0
                    ? 'bg-[#eab308]/20 text-[#eab308]'
                    : 'bg-gray-600/20 text-gray-400'
                    }`}>
                    {activity.option === 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>

                  {/* Bet Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium">
                        {formatAddress(activity.user_address)}
                      </span>
                      <span className="text-gray-400 text-sm">bet</span>
                      <span className="text-[#eab308] font-bold">
                        {activity.amount} PYUSD
                      </span>
                      <span className="text-gray-400 text-sm">on</span>
                      <Badge className={`text-xs ${activity.option === 0
                        ? 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30'
                        : 'bg-gray-600/20 text-gray-300 border-gray-600/30'
                        }`}>
                        {activity.option === 0 ? optionA : optionB}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Shares: {activity.shares}</span>
                      <span>{formatTimeAgo(activity.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Link */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      window.open(`https://hashscan.io/testnet/transaction/${activity.tx_hash}`, '_blank');
                    }}
                    className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                    title="View on Explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
