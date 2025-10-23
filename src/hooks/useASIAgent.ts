import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  asiAgentClient, 
  MarketAnalysis, 
  BettingRecommendation, 
  ContrarianAnalysis,
  SentimentAnalysis,
  AgentPerformance,
  MarketSignal
} from '@/lib/asi-agent-client';
import { toast } from 'sonner';

// Hook for agent status
export function useASIAgentStatus() {
  return useQuery({
    queryKey: ['asi-agent-status'],
    queryFn: () => asiAgentClient.getAgentStatus(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });
}

// Hook for market analysis
export function useASIMarketAnalysis(marketData: {
  marketId: string;
  title: string;
  optionA: string;
  optionB: string;
  category: number;
  endTime: number;
  currentOdds?: { optionA: number; optionB: number };
  historicalData?: any[];
}, enabled = true) {
  return useQuery({
    queryKey: ['asi-market-analysis', marketData.marketId],
    queryFn: () => asiAgentClient.analyzeMarket(marketData),
    enabled: enabled && !!marketData.marketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for betting recommendations
export function useASIBettingRecommendation(
  marketId: string, 
  userProfile?: {
    riskTolerance: 'low' | 'medium' | 'high';
    bettingHistory: any[];
    availableBalance: number;
  },
  enabled = true
) {
  return useQuery({
    queryKey: ['asi-betting-recommendation', marketId, userProfile],
    queryFn: () => asiAgentClient.getBettingRecommendation(marketId, userProfile),
    enabled: enabled && !!marketId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for contrarian analysis
export function useASIContrarianAnalysis(marketData: {
  marketId: string;
  currentOdds: { optionA: number; optionB: number };
  volume: { optionA: number; optionB: number };
  timeRemaining: number;
  category: number;
}, enabled = true) {
  return useQuery({
    queryKey: ['asi-contrarian-analysis', marketData.marketId],
    queryFn: () => asiAgentClient.getContrarianAnalysis(marketData),
    enabled: enabled && !!marketData.marketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for sentiment analysis
export function useASISentimentAnalysis(
  marketId: string, 
  externalSources?: string[],
  enabled = true
) {
  return useQuery({
    queryKey: ['asi-sentiment-analysis', marketId, externalSources],
    queryFn: () => asiAgentClient.getSentimentAnalysis(marketId, externalSources),
    enabled: enabled && !!marketId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for agent performance metrics
export function useASIPerformanceMetrics(timeframe = '30d') {
  return useQuery({
    queryKey: ['asi-performance-metrics', timeframe],
    queryFn: () => asiAgentClient.getPerformanceMetrics(timeframe),
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });
}

// Hook for real-time market signals
export function useASIMarketSignals(marketIds?: string[]) {
  return useQuery({
    queryKey: ['asi-market-signals', marketIds],
    queryFn: () => asiAgentClient.getMarketSignals(marketIds),
    refetchInterval: 30000, // 30 seconds for real-time signals
    staleTime: 15000, // 15 seconds
  });
}

// Mutation for submitting feedback
export function useASISubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      marketId: string;
      prediction: any;
      actualOutcome: number;
      profitLoss: number;
      confidence: number;
    }) => asiAgentClient.submitFeedback(data),
    onSuccess: () => {
      toast.success('Feedback submitted to ASI Agent');
      queryClient.invalidateQueries({ queryKey: ['asi-performance-metrics'] });
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    },
  });
}

// Mutation for updating agent configuration
export function useASIUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: {
      riskTolerance?: number;
      maxBetSize?: number;
      analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
      enabledStrategies?: string[];
    }) => asiAgentClient.updateAgentConfig(config),
    onSuccess: () => {
      toast.success('ASI Agent configuration updated');
      queryClient.invalidateQueries({ queryKey: ['asi-agent-status'] });
    },
    onError: (error) => {
      console.error('Error updating config:', error);
      toast.error('Failed to update agent configuration');
    },
  });
}

// Combined hook for comprehensive market intelligence
export function useASIMarketIntelligence(marketData: {
  marketId: string;
  title: string;
  optionA: string;
  optionB: string;
  category: number;
  endTime: number;
  currentOdds?: { optionA: number; optionB: number };
  volume?: { optionA: number; optionB: number };
}, enabled = true) {
  const analysis = useASIMarketAnalysis(marketData, enabled);
  const contrarian = useASIContrarianAnalysis({
    marketId: marketData.marketId,
    currentOdds: marketData.currentOdds || { optionA: 50, optionB: 50 },
    volume: marketData.volume || { optionA: 0, optionB: 0 },
    timeRemaining: marketData.endTime - Math.floor(Date.now() / 1000),
    category: marketData.category,
  }, enabled);
  const sentiment = useASISentimentAnalysis(marketData.marketId, undefined, enabled);

  return {
    analysis: analysis.data as MarketAnalysis | undefined,
    contrarian: contrarian.data as ContrarianAnalysis | undefined,
    sentiment: sentiment.data as SentimentAnalysis | undefined,
    isLoading: analysis.isLoading || contrarian.isLoading || sentiment.isLoading,
    error: analysis.error || contrarian.error || sentiment.error,
    refetch: () => {
      analysis.refetch();
      contrarian.refetch();
      sentiment.refetch();
    },
  };
}

// Hook for agent-driven auto-betting (with user approval)
export function useASIAutoBetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      marketId: string;
      recommendation: BettingRecommendation;
      userApproval: boolean;
    }) => {
      if (!params.userApproval) {
        throw new Error('User approval required for auto-betting');
      }

      // This would integrate with the Lit Protocol Vincent skill
      // for secure execution of the bet
      return {
        success: true,
        message: 'Auto-bet executed via ASI Agent',
        recommendation: params.recommendation,
      };
    },
    onSuccess: (data) => {
      toast.success('ASI Agent auto-bet executed successfully');
      queryClient.invalidateQueries({ queryKey: ['envio-market-bets'] });
      queryClient.invalidateQueries({ queryKey: ['envio-user-positions'] });
    },
    onError: (error) => {
      console.error('Error executing auto-bet:', error);
      toast.error('Failed to execute auto-bet');
    },
  });
}