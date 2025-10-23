"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Bot,
  RefreshCw,
  ArrowLeftRight
} from "lucide-react";

// Import our hooks
import { useCryptoPrices } from "@/hooks/usePythPrices";
import { useASIAgentStatus, useASIPerformanceMetrics } from "@/hooks/useASIAgent";
import { usePYUSDBridgeDashboard } from "@/hooks/usePYUSDBridge";
import { useAccount } from "wagmi";

export function CompactDashboard() {
  const { address } = useAccount();

  // Data hooks
  const { data: cryptoPrices, isLoading: pricesLoading } = useCryptoPrices();
  const { data: asiStatus } = useASIAgentStatus();
  const { data: asiPerformance } = useASIPerformanceMetrics();
  const bridgeDashboard = usePYUSDBridgeDashboard(address);

  const handleRefreshAll = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-3 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">System Status</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* ASI Agent Status */}
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Bot className="h-4 w-4 text-[#FFE100]" />
              <Badge 
                className={`text-xs ${
                  asiStatus?.isOnline 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {asiStatus?.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">ASI Agent</p>
          </CardContent>
        </Card>

        {/* Bridge Status */}
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <ArrowLeftRight className="h-4 w-4 text-[#FFE100]" />
              <Badge 
                className={`text-xs ${
                  bridgeDashboard.info?.isActive 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {bridgeDashboard.info?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">PYUSD Bridge</p>
          </CardContent>
        </Card>
      </div>

      {/* Price Feeds */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-[#FFE100]" />
            <span>Live Prices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pricesLoading ? (
            <div className="text-xs text-gray-400">Loading prices...</div>
          ) : cryptoPrices && cryptoPrices.length > 0 ? (
            cryptoPrices.slice(0, 3).map((price) => (
              <div key={price.symbol} className="flex justify-between items-center text-xs">
                <span className="text-gray-300">{price.symbol}</span>
                <div className="text-right">
                  <div className="text-white font-medium">${price.price.toFixed(2)}</div>
                  <div className={`text-xs ${price.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400">No price data available</div>
          )}
        </CardContent>
      </Card>

      {/* ASI Performance */}
      {asiPerformance && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center space-x-2">
              <Activity className="h-4 w-4 text-[#FFE100]" />
              <span>AI Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Success Rate</span>
              <span className="text-white font-medium">{asiPerformance.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Total Predictions</span>
              <span className="text-white font-medium">{asiPerformance.totalPredictions}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Avg Confidence</span>
              <span className="text-white font-medium">{asiPerformance.averageConfidence.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bridge Stats */}
      {bridgeDashboard.stats && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-[#FFE100]" />
              <span>Bridge Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Total Volume</span>
              <span className="text-white font-medium">${parseFloat(bridgeDashboard.stats.totalVolume).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Success Rate</span>
              <span className="text-white font-medium">{bridgeDashboard.stats.successRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300">Avg Time</span>
              <span className="text-white font-medium">{Math.round(bridgeDashboard.stats.averageTransferTime / 60)}m</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center space-x-2">
            <Shield className="h-4 w-4 text-[#FFE100]" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Overall Status</span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              Operational
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}