"use client";

import { MarketCard } from "@/components/market/market-card";
import { MarketError } from "@/components/market/market-error";
import { MarketLoading } from "@/components/market/market-loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChimeraProtocol } from "@/hooks/useChimeraProtocol";
import { useDirectContract } from "@/hooks/useDirectContract";
import { Market } from "@/types/market";
import {
  DollarSign,
  Search,
  Timer,
  TrendingUp,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Use direct contract calls (wagmi hooks not working without wallet)
  const { allMarkets, activeMarkets, loading, error, refetch } = useDirectContract();
  
  // Debug logging
  console.log('🔍 Direct Contract Debug:', {
    allMarkets,
    activeMarkets,
    loading,
    error
  });
  
  // Using direct contract calls instead of wagmi hooks

  // Log contract data for debugging
  useEffect(() => {
    if (allMarkets && allMarkets.length > 0) {
      console.log('📊 Contract Markets Data:', allMarkets);
    }
  }, [allMarkets]);

  // Filter markets based on active tab
  const getMarketsForTab = () => {
    if (activeTab === "active") {
      return activeMarkets || [];
    } else if (activeTab === "resolved") {
      return (allMarkets || []).filter(market => market.resolved);
    } else {
      return allMarkets || []; // "all" tab
    }
  };

  const markets = getMarketsForTab();

  const filteredMarkets = markets.filter(market =>
    market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return <MarketLoading />;
  }

  // Error state
  if (error) {
    return <MarketError error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-2">
                Prediction Markets
              </h1>
              <p className="text-gray-400 text-lg">
                Trade on the outcomes of real-world events with PYUSD tokens
              </p>
            </div>

            {/* Create market button removed - admin only access */}
          </div>

          {/* Platform Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] rounded-xl p-6 border border-gray-800/50 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#eab308]/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-[#eab308]" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Active Markets
                </span>
              </div>
              <p className="text-3xl font-bold text-white">
                {markets.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Live from contract
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] rounded-xl p-6 border border-gray-800/50 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#eab308]/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-[#eab308]" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Total Volume
                </span>
              </div>
              <p className="text-3xl font-bold text-white">
                {markets.reduce((sum, m) => sum + parseFloat(m.totalPool || "0"), 0).toFixed(0)} PYUSD
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All-time trading volume
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] rounded-xl p-6 border border-gray-800/50 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#eab308]/20 rounded-lg">
                  <Users className="h-5 w-5 text-[#eab308]" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Total Users
                </span>
              </div>
              <p className="text-3xl font-bold text-white">
                {new Set(markets.map(m => m.creator)).size}
              </p>
              <p className="text-xs text-gray-500 mt-1">Registered traders</p>
            </div>

            <div className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] rounded-xl p-6 border border-gray-800/50 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#eab308]/20 rounded-lg">
                  <Timer className="h-5 w-5 text-[#eab308]" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Pending Resolution
                </span>
              </div>
              <p className="text-3xl font-bold text-white">
                0
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting resolution</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search markets by title, description, or options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-[#1A1F2C] border-gray-700 text-white placeholder-gray-400 focus:border-[#eab308] focus:ring-[#eab308]/20"
              />
            </div>
          </div>
        </div>

        {/* Markets Grid */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full bg-[#1A1F2C] border border-gray-800/50 rounded-xl p-1 h-auto grid grid-cols-3">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-[#eab308] data-[state=active]:text-white text-gray-400 hover:text-white transition-all duration-200 rounded-lg py-3 px-4 font-medium"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Active</span>
                <Badge
                  variant="secondary"
                  className="bg-gray-700/50 text-gray-300 border-0 text-xs px-2 py-0.5"
                >
                  {activeMarkets?.length || 0}
                </Badge>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="resolved"
              className="data-[state=active]:bg-[#eab308] data-[state=active]:text-white text-gray-400 hover:text-white transition-all duration-200 rounded-lg py-3 px-4 font-medium"
            >
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>Resolved</span>
                <Badge
                  variant="secondary"
                  className="bg-gray-700/50 text-gray-300 border-0 text-xs px-2 py-0.5"
                >
                  {(allMarkets || []).filter(m => m.resolved).length}
                </Badge>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-[#eab308] data-[state=active]:text-white text-gray-400 hover:text-white transition-all duration-200 rounded-lg py-3 px-4 font-medium"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>All</span>
                <Badge
                  variant="secondary"
                  className="bg-gray-700/50 text-gray-300 border-0 text-xs px-2 py-0.5"
                >
                  {allMarkets?.length || 0}
                </Badge>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            {filteredMarkets.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-[#1A1F2C] to-[#151923] rounded-2xl border border-gray-800/50">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  No markets found
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {markets.length === 0
                    ? "No markets have been created yet"
                    : "No markets match your search criteria"}
                </p>
                {/* Create first market button removed - admin only access */}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMarkets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Status Section */}
        {filteredMarkets.length > 0 && (
          <div className="text-center mt-12 pt-8 border-t border-gray-800/50">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>
                  Showing {filteredMarkets.length} of {markets.length} markets
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}