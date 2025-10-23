/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { BetDialog } from "@/components/market/bet-dialog";
import { CommentsSection } from "@/components/comments/comments-section";
import { CountdownTimer } from "@/components/market/countdown-timer";
import { MarketError } from "@/components/market/market-error";
import { MarketLoading } from "@/components/market/market-loading";
import { MarketActivity } from "@/components/market/market-activity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketDetail } from "@/hooks/use-market-detail";
import {
  extractImageFromMarket,
  getOptimizedImageUrl,
  isValidImageUrl,
} from "@/lib/flow/market";
import { useAccount } from "wagmi";
import { MarketCategory, MarketStatus } from "@/types/market";
import {
  BarChart3,
  Bookmark,
  Calendar,
  CheckCircle,
  Clock,
  Flag,
  Flame,
  Image as ImageIcon,
  Lock,
  Pause,
  RefreshCw,
  Share2,
  TrendingUp,
  Users,
  Volume2,
  Zap,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = params.id as string;
  const { address } = useAccount();

  const {
    market,
    trades,
    comments,
    priceHistory,
    userPosition,
    loading,
    error,
    refreshMarketData,
  } = useMarketDetail(marketId, address || "");

  const [betDialogOpen, setBetDialogOpen] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"optionA" | "optionB">("optionA");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Auto-refresh market data every 30 seconds
  useEffect(() => {
    if (!loading && market) {
      const interval = setInterval(() => {
        console.log("Auto-refreshing market data...");
        refreshMarketData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [loading, market, refreshMarketData]);

  // Loading state
  if (loading) {
    return <MarketLoading />;
  }

  // Error state
  if (error || !market) {
    return (
      <MarketError
        error={error || "Market not found"}
        onRetry={refreshMarketData}
      />
    );
  }

  // Extract image from market data
  const finalImageURI =
    market.imageURI ||
    (market.description
      ? extractImageFromMarket(market.description).imageURI
      : undefined);
  const optimizedImageUrl = getOptimizedImageUrl(finalImageURI, 800, 400);
  const hasValidImage = isValidImageUrl(optimizedImageUrl) && !imageError;

  const totalShares =
    parseFloat(market.totalOptionAShares) +
    parseFloat(market.totalOptionBShares);
  const optionAPercentage =
    totalShares > 0
      ? (parseFloat(market.totalOptionAShares) / totalShares) * 100
      : 50;
  const optionBPercentage = 100 - optionAPercentage;

  // Compute the actual display status based on contract status and end time
  const getActualMarketStatus = () => {
    const now = Date.now();
    const endTime = parseInt(market.endTime) * 1000;

    // If resolved, always show resolved
    if (market.status === MarketStatus.Resolved || market.resolved) {
      return MarketStatus.Resolved;
    }

    // If past end time but not resolved, it's pending resolution
    if (endTime <= now && market.status === MarketStatus.Active) {
      return MarketStatus.Paused; // Using Paused to represent "Pending Resolution"
    }

    // Otherwise use contract status
    return market.status;
  };

  const actualStatus = getActualMarketStatus();

  // Check if market allows betting
  const isBettingDisabled =
    actualStatus !== MarketStatus.Active ||
    (market.endTime && parseInt(market.endTime) * 1000 <= Date.now());

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const handleBet = (side: "optionA" | "optionB") => {
    if (isBettingDisabled) return;
    setSelectedSide(side);
    setBetDialogOpen(true);
  };

  const handleBetSuccess = () => {
    setBetDialogOpen(false);
    setTimeout(() => {
      refreshMarketData();
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Market Header */}
        <div className="bg-gradient-to-br from-[#1A1F2C] via-[#151923] to-[#0A0C14] rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Market Image */}
              <div className="relative w-16 h-16 flex-shrink-0">
                {hasValidImage ? (
                  <img
                    src={(market as any).imageUrl || optimizedImageUrl}
                    alt={market.title}
                    className="w-full h-full object-cover rounded-xl"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl flex items-center justify-center border border-gray-700/50">
                    <ImageIcon className="h-8 w-8 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30 font-medium">
                  Category {market.category}
                </Badge>
                <Badge
                  variant={actualStatus === MarketStatus.Active ? "default" : "secondary"}
                  className={
                    actualStatus === MarketStatus.Active
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : actualStatus === MarketStatus.Resolved
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  }
                >
                  <div className="flex items-center space-x-1">
                    {actualStatus === MarketStatus.Active && <TrendingUp className="h-3 w-3" />}
                    {actualStatus === MarketStatus.Paused && <Pause className="h-3 w-3" />}
                    {actualStatus === MarketStatus.Resolved && <CheckCircle className="h-3 w-3" />}
                    <span>
                      {actualStatus === MarketStatus.Active
                        ? "Active"
                        : actualStatus === MarketStatus.Resolved
                        ? "Resolved"
                        : "Pending Resolution"}
                    </span>
                  </div>
                </Badge>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="border-0 text-white hover:bg-[#1A1F2C] hover:text-white bg-[#1A1F2C]"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current text-[#eab308]" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-0 text-white hover:bg-[#1A1F2C] hover:text-white bg-[#1A1F2C]"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Title and description */}
          <h1 className="text-3xl font-bold mb-4 text-white leading-tight">
            {market.title}
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed mb-6">
            {market.description}
          </p>

          {/* Market Meta */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-[#eab308]" />
              <span>Created by</span>
              <Link
                href={`/dashboard/${market.creator}`}
                className="text-[#eab308] hover:text-[#ca8a04] font-medium"
              >
                {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>
                {new Date(parseInt(market.createdAt) * 1000).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <CountdownTimer endTime={parseInt(market.endTime) * 1000} />
            </div>

            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-yellow-400" />
              <span>{formatCurrency(market.totalPool)} PYUSD volume</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trading & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Prices */}
            <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-[#eab308]" />
                  <span>Current Prices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-[#eab308]">
                      {market.optionA} {optionAPercentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-400">
                      {market.optionB} {optionBPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={optionAPercentage}
                    className="h-4 bg-gray-800 rounded-full overflow-hidden"
                  />
                </div>

                {/* Show resolved outcome if available */}
                {actualStatus === MarketStatus.Resolved && market.outcome !== undefined && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-blue-400" />
                      <span className="font-semibold text-blue-400">Market Resolved</span>
                    </div>
                    <p className="text-white font-bold text-lg">
                      Winner: {market.outcome === 0 ? market.optionA : market.optionB}
                    </p>
                  </div>
                )}

                {/* User Position Display */}
                {userPosition && (
                  <div className="bg-gradient-to-r from-[#0A0C14] to-[#1A1F2C]/30 rounded-xl p-4 border border-gray-800/50">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-[#eab308]" />
                      <span>Your Position</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-[#eab308] font-bold text-lg">
                          {formatCurrency(userPosition.optionAShares)}
                        </div>
                        <div className="text-gray-500 text-xs">{market.optionA} shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 font-bold text-lg">
                          {formatCurrency(userPosition.optionBShares)}
                        </div>
                        <div className="text-gray-500 text-xs">{market.optionB} shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">
                          {formatCurrency(userPosition.totalInvested)} PYUSD
                        </div>
                        <div className="text-gray-500 text-xs">Total invested</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show disabled message for non-active markets */}
                {isBettingDisabled && (
                  <div className="bg-gradient-to-r from-gray-700/10 to-gray-600/10 rounded-xl p-4 border border-gray-600/20">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {actualStatus === MarketStatus.Resolved
                          ? "Market has been resolved"
                          : market.endTime && parseInt(market.endTime) * 1000 <= Date.now()
                          ? "Market has ended - awaiting resolution"
                          : "Betting not available"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Betting Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    onClick={() => handleBet("optionA")}
                    className={`h-20 transform transition-all duration-200 ${
                      isBettingDisabled
                        ? "bg-gray-700/50 text-gray-500 cursor-not-allowed hover:bg-gray-700/50 hover:scale-100 shadow-none"
                        : "bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white shadow-lg shadow-[#eab308]/25 hover:shadow-[#eab308]/40 hover:scale-105"
                    }`}
                    disabled={!!isBettingDisabled}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold flex items-center justify-center space-x-2">
                        {isBettingDisabled && <Lock className="h-4 w-4" />}
                        <span>{market.optionA}</span>
                      </div>
                      <div className="text-sm opacity-90">{optionAPercentage.toFixed(0)}%</div>
                    </div>
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleBet("optionB")}
                    className={`h-20 transform transition-all duration-200 ${
                      isBettingDisabled
                        ? "bg-gray-700/50 text-gray-500 cursor-not-allowed hover:bg-gray-700/50 hover:scale-100 shadow-none"
                        : "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg hover:shadow-gray-700/40 hover:scale-105"
                    }`}
                    disabled={!!isBettingDisabled}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold flex items-center justify-center space-x-2">
                        {isBettingDisabled && <Lock className="h-4 w-4" />}
                        <span>{market.optionB}</span>
                      </div>
                      <div className="text-sm opacity-90">{optionBPercentage.toFixed(0)}%</div>
                    </div>
                  </Button>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800/50">
                  <div className="text-center p-3 rounded-lg bg-gray-800/20">
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(market.totalPool)}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Volume</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-800/20">
                    <div className="text-xl font-bold text-white">
                      {formatCurrency(totalShares)}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Shares</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-800/20">
                    <div className="text-xl font-bold text-white">{trades.length}</div>
                    <div className="text-xs text-gray-400 font-medium">Trades</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Details Tabs */}
            <div className="space-y-4">
              <Tabs defaultValue="bets" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-[#1A1F2C] to-[#151923] border border-gray-800/50 rounded-xl p-1 h-12">
                  <TabsTrigger
                    value="bets"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#eab308] data-[state=active]:to-[#ca8a04] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all duration-200 rounded-lg h-10 font-medium"
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    Bets
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#eab308] data-[state=active]:to-[#ca8a04] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all duration-200 rounded-lg h-10 font-medium"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Comments
                  </TabsTrigger>
                </TabsList>

                {/* Bets Tab Content */}
                <TabsContent value="bets" className="mt-4">
                  <MarketActivity
                    marketId={market.id}
                    marketTitle={market.title}
                    optionA={market.optionA}
                    optionB={market.optionB}
                  />
                </TabsContent>

                {/* Comments Tab Content */}
                <TabsContent value="comments" className="mt-4">
                  <CommentsSection
                    marketId={parseInt(market.id)}
                    marketTitle={market.title}
                    currentUserAddress={address || ""}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Market Status */}
            <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  {actualStatus === MarketStatus.Active && <TrendingUp className="h-5 w-5 text-yellow-400" />}
                  {actualStatus === MarketStatus.Paused && <Clock className="h-5 w-5 text-orange-400" />}
                  {actualStatus === MarketStatus.Resolved && <CheckCircle className="h-5 w-5 text-blue-400" />}
                  <span>Market Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge
                    variant={actualStatus === MarketStatus.Active ? "default" : "secondary"}
                    className={`w-full justify-center py-3 text-sm font-semibold ${
                      actualStatus === MarketStatus.Active
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : actualStatus === MarketStatus.Resolved
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    }`}
                  >
                    {actualStatus === MarketStatus.Active
                      ? "Active"
                      : actualStatus === MarketStatus.Resolved
                      ? "Resolved"
                      : "Pending Resolution"}
                  </Badge>
                  {actualStatus === MarketStatus.Active && (
                    <div className="text-center bg-gray-800/30 rounded-lg p-4">
                      <CountdownTimer endTime={parseInt(market.endTime) * 1000} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bet Dialog */}
      <BetDialog
        open={betDialogOpen}
        onOpenChange={setBetDialogOpen}
        marketId={market.id}
        marketTitle={market.title}
        selectedSide={selectedSide}
        optionA={market.optionA}
        optionB={market.optionB}
        onSuccess={handleBetSuccess}
      />
    </div>
  );
}
