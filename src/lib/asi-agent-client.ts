// ASI Agent API client for MeTTa reasoning and market analysis
export class ASIAgentClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_ASI_AGENT_ENDPOINT || 'http://localhost:8001';
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_ASI_AGENT_API_KEY;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`ASI Agent API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get agent status and health
  async getAgentStatus() {
    return this.makeRequest('/status');
  }

  // Analyze market using MeTTa reasoning
  async analyzeMarket(marketData: {
    marketId: string;
    title: string;
    optionA: string;
    optionB: string;
    category: number;
    endTime: number;
    currentOdds?: { optionA: number; optionB: number };
    historicalData?: any[];
    externalData?: any;
  }) {
    return this.makeRequest('/analyze-market', {
      method: 'POST',
      body: JSON.stringify(marketData),
    });
  }

  // Get betting recommendation
  async getBettingRecommendation(marketId: string, userProfile?: {
    riskTolerance: 'low' | 'medium' | 'high';
    bettingHistory: any[];
    availableBalance: number;
  }) {
    return this.makeRequest('/betting-recommendation', {
      method: 'POST',
      body: JSON.stringify({
        marketId,
        userProfile,
      }),
    });
  }

  // Execute contrarian analysis
  async getContrarianAnalysis(marketData: {
    marketId: string;
    currentOdds: { optionA: number; optionB: number };
    volume: { optionA: number; optionB: number };
    timeRemaining: number;
    category: number;
  }) {
    return this.makeRequest('/contrarian-analysis', {
      method: 'POST',
      body: JSON.stringify(marketData),
    });
  }

  // Get market sentiment analysis
  async getSentimentAnalysis(marketId: string, externalSources?: string[]) {
    return this.makeRequest('/sentiment-analysis', {
      method: 'POST',
      body: JSON.stringify({
        marketId,
        sources: externalSources || ['twitter', 'reddit', 'news'],
      }),
    });
  }

  // Submit feedback for learning
  async submitFeedback(data: {
    marketId: string;
    prediction: any;
    actualOutcome: number;
    profitLoss: number;
    confidence: number;
  }) {
    return this.makeRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get agent performance metrics
  async getPerformanceMetrics(timeframe = '30d') {
    return this.makeRequest(`/performance?timeframe=${timeframe}`);
  }

  // Configure agent parameters
  async updateAgentConfig(config: {
    riskTolerance?: number;
    maxBetSize?: number;
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
    enabledStrategies?: string[];
  }) {
    return this.makeRequest('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Get real-time market signals
  async getMarketSignals(marketIds?: string[]) {
    const query = marketIds ? `?markets=${marketIds.join(',')}` : '';
    return this.makeRequest(`/signals${query}`);
  }
}

// Response types
export interface MarketAnalysis {
  marketId: string;
  confidence: number;
  recommendation: 'optionA' | 'optionB' | 'abstain';
  reasoning: string;
  factors: {
    name: string;
    weight: number;
    value: number;
    description: string;
  }[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  expectedValue: number;
  timestamp: string;
}

export interface BettingRecommendation {
  marketId: string;
  action: 'bet' | 'wait' | 'avoid';
  option?: 'optionA' | 'optionB';
  suggestedAmount?: number;
  confidence: number;
  reasoning: string;
  riskWarnings: string[];
  expectedReturn: number;
  timeframe: string;
}

export interface ContrarianAnalysis {
  marketId: string;
  isContrarianOpportunity: boolean;
  crowdBias: 'optionA' | 'optionB' | 'neutral';
  biasStrength: number;
  contrarian_recommendation: 'optionA' | 'optionB' | 'none';
  reasoning: string;
  confidence: number;
  expectedCorrection: number;
}

export interface SentimentAnalysis {
  marketId: string;
  overallSentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -1 to 1
  sources: {
    platform: string;
    sentiment: number;
    volume: number;
    reliability: number;
  }[];
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  keyTopics: string[];
  timestamp: string;
}

export interface AgentPerformance {
  totalBets: number;
  winRate: number;
  averageReturn: number;
  totalProfit: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestStrategies: string[];
  recentPerformance: {
    period: string;
    winRate: number;
    profit: number;
  }[];
}

export interface MarketSignal {
  marketId: string;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  strength: number; // 0-1
  reasoning: string;
  triggers: string[];
  timestamp: string;
  expiresAt: string;
}

// Create singleton instance
export const asiAgentClient = new ASIAgentClient();