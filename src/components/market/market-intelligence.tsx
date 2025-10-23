"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Bot,
  Lightbulb,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  RefreshCw
} from "lucide-react";

// Import our AI hooks
import { useASIMarketIntelligence, useASIBettingRecommendation } from "@/hooks/useASIAgent";

import { usePythPrice, usePriceConditionCheck } from "@/hooks/usePythPrices";

interface MarketIntelligenceProps {
  marketId: string;
  marketData: {
    title: string;
    optionA: string;
    optionB: string;
    category: number;
    endTime: number;
    marketType?: number;
    pythPriceId?: string;
    targetPrice?: number;
    priceAbove?: boolean;
  };
  userProfile?: {
    riskTolerance: 'low' | 'medium' | 'high';
    bettingHistory: any[];
    availableBalance: number;
  };
}

export function MarketIntelligence({ 
  marketId, 
  marketData, 
  userProfile 
}: MarketIntelligenceProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock market statistics (replace with direct contract calls)
  const marketStats = {
    totalBets: 0,
    totalVolume: '0',
    optionAVolume: '0',
    optionBVolume: '0',
    uniqueBettors: 0,
    averageBetSize: '0',
    lastBetTime: null,
    isLoading: false
  };
  
  // Get AI intelligence
  const intelligence = useASIMarketIntelligence(marketData, true);
  const recommendation = useASIBettingRecommendation(marketId, userProfile, true);

  // Get price data if it's a price market
  const { data: priceData } = usePythPrice(
    marketData.pythPriceId || '', 
    marketData.marketType === 0 && !!marketData.pythPriceId
  );

  const priceCondition = usePriceConditionCheck(
    marketData.pythPriceId || '',
    marketData.targetPrice || 0,
    marketData.priceAbove || true,
    marketData.marketType === 0 && !!marketData.pythPriceId
  );

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    intelligence.refetch();
    recommendation.refetch();
    // marketStats is now static, no refetch needed
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'bet': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'wait': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'avoid': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-[#eab308]" />
          <h2 className="text-xl font-bold text-white">Market Intelligence</h2>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Market Overview */}
      <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <BarChart3 className="h-5 w-5 text-[#eab308]" />
            <span>Market Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-[#0A0C14] rounded-lg">
              <p className="text-2xl font-bold text-white">{marketStats.totalBets}</p>
              <p className="text-gray-400 text-sm">Total Bets</p>
            </div>
            <div className="text-center p-3 bg-[#0A0C14] rounded-lg">
              <p className="text-2xl font-bold text-white">${marketStats.totalVolume}</p>
              <p className="text-gray-400 text-sm">Total Volume</p>
            </div>
            <div className="text-center p-3 bg-[#0A0C14] rounded-lg">
              <p className="text-2xl font-bold text-white">{marketStats.uniqueBettors}</p>
              <p className="text-gray-400 text-sm">Unique Bettors</p>
            </div>
            <div className="text-center p-3 bg-[#0A0C14] rounded-lg">
              <p className="text-2xl font-bold text-white">${marketStats.averageBetSize}</p>
              <p className="text-gray-400 text-sm">Avg Bet Size</p>
            </div>
          </div>

          {/* Current Odds */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Current Market Odds</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#0A0C14] rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{marketData.optionA}</span>
                  <Badge className="bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30">
                    {Math.round((parseFloat(marketStats.optionAVolume) / parseFloat(marketStats.totalVolume) * 100) || 50)}%
                  </Badge>
                </div>
                <Progress 
                  value={(parseFloat(marketStats.optionAVolume) / parseFloat(marketStats.totalVolume) * 100) || 50} 
                  className="h-2"
                />
                <p className="text-gray-400 text-sm mt-1">${marketStats.optionAVolume} volume</p>
              </div>
              <div className="p-3 bg-[#0A0C14] rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{marketData.optionB}</span>
                  <Badge className="bg-gray-600/20 text-gray-300 border-gray-600/30">
                    {Math.round((parseFloat(marketStats.optionBVolume) / parseFloat(marketStats.totalVolume) * 100) || 50)}%
                  </Badge>
                </div>
                <Progress 
                  value={(parseFloat(marketStats.optionBVolume) / parseFloat(marketStats.totalVolume) * 100) || 50} 
                  className="h-2"
                />
                <p className="text-gray-400 text-sm mt-1">${marketStats.optionBVolume} volume</p>
              </div>
            </div>
          </div>

          {/* Price Data for Price Markets */}
          {marketData.marketType === 0 && priceData && (
            <div className="p-4 bg-[#0A0C14] rounded-lg border border-gray-800/50">
              <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-[#eab308]" />
                <span>Current Price Data</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Current Price</p>
                  <p className="text-2xl font-bold text-white">${priceData.formattedPrice}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Target Price</p>
                  <p className="text-xl font-bold text-white">${marketData.targetPrice}</p>
                </div>
              </div>
              <div className="mt-3">
                <Badge className={`${
                  priceCondition.conditionMet 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {priceCondition.conditionMet ? 'Condition Met' : 'Condition Not Met'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {intelligence.analysis && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Bot className="h-5 w-5 text-blue-400" />
              <span>ASI Agent Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">Recommendation:</span>
                <Badge className={`${
                  intelligence.analysis.recommendation === 'optionA' 
                    ? 'bg-[#eab308]/20 text-[#eab308] border-[#eab308]/30'
                    : intelligence.analysis.recommendation === 'optionB'
                    ? 'bg-gray-600/20 text-gray-300 border-gray-600/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {intelligence.analysis.recommendation === 'optionA' 
                    ? marketData.optionA
                    : intelligence.analysis.recommendation === 'optionB'
                    ? marketData.optionB
                    : 'Abstain'
                  }
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Confidence:</span>
                <span className="text-white font-bold">{(intelligence.analysis.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="p-4 bg-[#0A0C14] rounded-lg">
              <h4 className="font-semibold text-white mb-2 flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-[#eab308]" />
                <span>AI Reasoning</span>
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {intelligence.analysis.reasoning}
              </p>
            </div>

            {/* Analysis Factors */}
            <div className="space-y-2">
              <h4 className="font-semibold text-white">Key Factors</h4>
              <div className="space-y-2">
                {intelligence.analysis.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0A0C14] rounded-lg">
                    <div>
                      <p className="text-white font-medium text-sm">{factor.name}</p>
                      <p className="text-gray-400 text-xs">{factor.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{factor.value.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">Weight: {(factor.weight * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="p-4 bg-[#0A0C14] rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span>Risk Assessment</span>
                </h4>
                <Badge className={getRiskColor(intelligence.analysis.riskAssessment.level)}>
                  {intelligence.analysis.riskAssessment.level.toUpperCase()} RISK
                </Badge>
              </div>
              <ul className="space-y-1">
                {intelligence.analysis.riskAssessment.factors.map((factor, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-center space-x-2">
                    <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Betting Recommendation */}
      {recommendation.data && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Target className="h-5 w-5 text-[#eab308]" />
              <span>Betting Recommendation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">Action:</span>
                <Badge className={getRecommendationColor(recommendation.data.action)}>
                  {recommendation.data.action.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Confidence:</span>
                <span className="text-white font-bold">{(recommendation.data.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            {recommendation.data.option && recommendation.data.suggestedAmount && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#0A0C14] rounded-lg">
                  <p className="text-gray-400 text-sm">Suggested Option</p>
                  <p className="text-white font-bold">
                    {recommendation.data.option === 'optionA' ? marketData.optionA : marketData.optionB}
                  </p>
                </div>
                <div className="p-3 bg-[#0A0C14] rounded-lg">
                  <p className="text-gray-400 text-sm">Suggested Amount</p>
                  <p className="text-white font-bold">${recommendation.data.suggestedAmount.toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-[#0A0C14] rounded-lg">
              <h4 className="font-semibold text-white mb-2">Reasoning</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {recommendation.data.reasoning}
              </p>
            </div>

            {recommendation.data.riskWarnings.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="font-semibold text-red-400 mb-2 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Risk Warnings</span>
                </h4>
                <ul className="space-y-1">
                  {recommendation.data.riskWarnings.map((warning, index) => (
                    <li key={index} className="text-red-300 text-sm flex items-center space-x-2">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#0A0C14] rounded-lg">
                <p className="text-gray-400 text-sm">Expected Return</p>
                <p className="text-white font-bold">{(recommendation.data.expectedReturn * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-[#0A0C14] rounded-lg">
                <p className="text-gray-400 text-sm">Timeframe</p>
                <p className="text-white font-bold">{recommendation.data.timeframe}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contrarian Analysis */}
      {intelligence.contrarian && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <span>Contrarian Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">Contrarian Opportunity:</span>
                <Badge className={`${
                  intelligence.contrarian.isContrarianOpportunity
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {intelligence.contrarian.isContrarianOpportunity ? 'YES' : 'NO'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Confidence:</span>
                <span className="text-white font-bold">{(intelligence.contrarian.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            {intelligence.contrarian.isContrarianOpportunity && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#0A0C14] rounded-lg">
                    <p className="text-gray-400 text-sm">Crowd Bias</p>
                    <p className="text-white font-bold">
                      {intelligence.contrarian.crowdBias === 'optionA' 
                        ? marketData.optionA 
                        : intelligence.contrarian.crowdBias === 'optionB'
                        ? marketData.optionB
                        : 'Neutral'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-[#0A0C14] rounded-lg">
                    <p className="text-gray-400 text-sm">Bias Strength</p>
                    <p className="text-white font-bold">{(intelligence.contrarian.biasStrength * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="p-4 bg-[#0A0C14] rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Contrarian Reasoning</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {intelligence.contrarian.reasoning}
                  </p>
                </div>

                {intelligence.contrarian.contrarian_recommendation !== 'none' && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2 flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4" />
                      <span>Contrarian Recommendation</span>
                    </h4>
                    <p className="text-white font-medium">
                      Consider betting on: {' '}
                      <span className="text-purple-400">
                        {intelligence.contrarian.contrarian_recommendation === 'optionA' 
                          ? marketData.optionA 
                          : marketData.optionB
                        }
                      </span>
                    </p>
                    <p className="text-gray-300 text-sm mt-1">
                      Expected correction: {(intelligence.contrarian.expectedCorrection * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sentiment Analysis */}
      {intelligence.sentiment && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Users className="h-5 w-5 text-green-400" />
              <span>Sentiment Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">Overall Sentiment:</span>
                <Badge className={`${
                  intelligence.sentiment.overallSentiment === 'positive'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : intelligence.sentiment.overallSentiment === 'negative'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {intelligence.sentiment.overallSentiment.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Score:</span>
                <span className="text-white font-bold">{intelligence.sentiment.sentimentScore.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white">Source Breakdown</h4>
              <div className="space-y-2">
                {intelligence.sentiment.sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0A0C14] rounded-lg">
                    <div>
                      <p className="text-white font-medium capitalize">{source.platform}</p>
                      <p className="text-gray-400 text-sm">Volume: {source.volume} • Reliability: {(source.reliability * 100).toFixed(0)}%</p>
                    </div>
                    <Badge className={`${
                      source.sentiment > 0.1
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : source.sentiment < -0.1
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {source.sentiment.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {intelligence.sentiment.keyTopics.length > 0 && (
              <div>
                <h4 className="font-semibold text-white mb-2">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {intelligence.sentiment.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="bg-[#0A0C14] border-gray-700 text-gray-300">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading States */}
      {intelligence.isLoading && (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#151923] border-gray-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-[#eab308]" />
              <span className="text-white">Loading AI analysis...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}