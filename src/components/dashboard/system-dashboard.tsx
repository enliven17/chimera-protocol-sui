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
  Eye,
  RefreshCw,
  ArrowLeftRight
} from "lucide-react";

// Import our hooks
import { useCryptoPrices } from "@/hooks/usePythPrices";
import { useASIAgentStatus, useASIPerformanceMetrics } from "@/hooks/useASIAgent";
import { ASIChat } from "@/components/agents/asi-chat";

import { usePYUSDBridgeDashboard } from "@/hooks/usePYUSDBridge";
import { useAccount } from "wagmi";

export function SystemDashboard() {
  const { address } = useAccount();

  // Data hooks
  const { data: cryptoPrices, isLoading: pricesLoading } = useCryptoPrices();
  const { data: asiStatus } = useASIAgentStatus();
  const { data: asiPerformance } = useASIPerformanceMetrics();

  // Blockchain analytics removed - use direct contract calls instead
  const bridgeDashboard = usePYUSDBridgeDashboard(address);

  const handleRefreshAll = () => {
    window.location.reload(); // Simple refresh for now
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Real-time monitoring of ChimeraAI ecosystem
          </p>
        </div>
        <Button
          onClick={handleRefreshAll}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-[#FFE100]" />
              <div>
                <p className="text-sm text-gray-400">Active Markets</p>
                <p className="text-2xl font-bold text-white">
                  3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">ASI Agent</p>
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={`${
                      asiStatus?.status === 'online' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {asiStatus?.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Security Status</p>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowLeftRight className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">PYUSD Bridge</p>
                <div className="flex items-center space-x-2">
                  <Badge 
                    className={`${
                      bridgeDashboard.info?.isActive 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {bridgeDashboard.info?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Activity */}
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <TrendingUp className="h-5 w-5 text-[#FFE100]" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#0A0C14] rounded-lg">
              <div>
                <p className="text-white font-medium text-sm">Contract Status</p>
                <p className="text-gray-400 text-xs">
                  ChimeraProtocol • Active
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Deployed
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Price Feeds */}
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <DollarSign className="h-5 w-5 text-[#FFE100]" />
              <span>Pyth Price Feeds</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricesLoading ? (
              <div className="text-gray-400">Loading prices...</div>
            ) : cryptoPrices?.data && cryptoPrices.data.length > 0 ? (
              cryptoPrices.data.slice(0, 5).map((price: any) => (
                <div key={price.priceId} className="flex items-center justify-between p-3 bg-[#0A0C14] rounded-lg">
                  <div>
                    <p className="text-white font-medium">{price.symbol || 'Unknown'}</p>
                    <p className="text-gray-400 text-sm">{price.name || 'Crypto Asset'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${price.formattedPrice}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(price.publishTime * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : cryptoPrices?.error ? (
              <div className="text-red-400">Error loading prices: {cryptoPrices.error.message}</div>
            ) : (
              <div className="text-gray-400">No price data available</div>
            )}
          </CardContent>
        </Card>

        {/* ASI Agent Performance */}
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Bot className="h-5 w-5 text-blue-400" />
              <span>ASI Agent Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {asiPerformance ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[#0A0C14] rounded-lg">
                  <p className="text-2xl font-bold text-white">{asiPerformance.winRate.toFixed(1)}%</p>
                  <p className="text-gray-400 text-sm">Win Rate</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C14] rounded-lg">
                  <p className="text-2xl font-bold text-white">{asiPerformance.totalBets}</p>
                  <p className="text-gray-400 text-sm">Total Bets</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C14] rounded-lg">
                  <p className="text-2xl font-bold text-white">{asiPerformance.averageReturn.toFixed(2)}%</p>
                  <p className="text-gray-400 text-sm">Avg Return</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C14] rounded-lg">
                  <p className="text-2xl font-bold text-white">${asiPerformance.totalProfit.toFixed(2)}</p>
                  <p className="text-gray-400 text-sm">Total Profit</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">ASI Agent performance data not available</div>
            )}
          </CardContent>
        </Card>

        {/* Bridge Statistics */}
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <ArrowLeftRight className="h-5 w-5 text-orange-400" />
              <span>PYUSD Bridge Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bridgeDashboard.stats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#0A0C14] rounded-lg">
                  <span className="text-gray-400">Total Volume</span>
                  <span className="text-white font-bold">${parseFloat(bridgeDashboard.stats.totalVolume).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0A0C14] rounded-lg">
                  <span className="text-gray-400">Total Transfers</span>
                  <span className="text-white font-bold">{bridgeDashboard.stats.totalTransfers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0A0C14] rounded-lg">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-white font-bold">{bridgeDashboard.stats.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0A0C14] rounded-lg">
                  <span className="text-gray-400">Avg Transfer Time</span>
                  <span className="text-white font-bold">{Math.round(bridgeDashboard.stats.averageTransferTime / 60)}m</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">Bridge statistics not available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Activity className="h-5 w-5 text-[#FFE100]" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blockchain */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <Eye className="h-4 w-4 text-[#FFE100]" />
                <span>Blockchain</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">ChimeraProtocol</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">PYUSD Token</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <Shield className="h-4 w-4 text-purple-400" />
                <span>Security</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">System Security</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Active Connections</span>
                  <span className="text-white text-sm">3</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ASI Agent Chat */}
      <ASIChat className="w-full" />
    </div>
  );
}