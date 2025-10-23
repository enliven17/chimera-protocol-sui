import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Market, MarketStatus } from "@/types/market";
import {
  Calendar,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Pause,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface MarketCardProps {
  market: Market;
  className?: string;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const hasValidImage = market.imageURI && !imageError;

  // Calculate percentages for odds
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

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = Date.now();
    const end = parseInt(endTime) * 1000;
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "< 1h";
  };

  return (
    <Link href={`/markets/${market.id}`} className={`block ${className}`}>
      <Card className="group bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50 shadow-xl hover:shadow-2xl hover:shadow-[#eab308]/10 transition-all duration-300 hover:scale-[1.02] hover:border-[#eab308]/30 overflow-hidden">
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            {hasValidImage ? (
              <img
                src={market.imageURI}
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

            {/* Options Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-[#eab308] truncate flex-1 mr-2">
                  {market.optionA} {optionAPercentage.toFixed(1)}%
                </span>
                <span className="text-gray-400 truncate flex-1 text-right">
                  {market.optionB} {optionBPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={optionAPercentage}
                className="h-2 bg-gray-800 rounded-full overflow-hidden"
              />
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800/50">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <DollarSign className="h-3 w-3 text-yellow-400" />
                <span>{formatCurrency(market.totalPool)} PYUSD</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Clock className="h-3 w-3 text-yellow-400" />
                <span>{formatTimeRemaining(market.endTime)}</span>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>
                  {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(parseInt(market.createdAt) * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Resolved Outcome */}
            {actualStatus === MarketStatus.Resolved && market.outcome !== undefined && (
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-medium text-sm">
                    Winner: {market.outcome === 0 ? market.optionA : market.optionB}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-white shadow-lg group-hover:shadow-[#eab308]/25 transition-all duration-200"
              size="sm"
            >
              {actualStatus === MarketStatus.Active ? "Trade Now" : "View Details"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};