// src/types/api.ts
// API request/response type definitions

import type { Market, MarketActivity, MarketChartData, MarketOdds } from './market';
import type { UserStats, UserPosition, UserActivityItem, UserAchievement, LeaderboardUser, UserSearchResult, UserNotification, UserPreferences } from './user';

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string; // For validation errors
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Markets API
export interface GetMarketsRequest {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isBreakingNews?: boolean;
  creator?: string;
}

export interface GetMarketsResponse extends PaginatedResponse<Market> {}

export interface GetMarketRequest {
  id: string;
  includeActivity?: boolean;
  includeChart?: boolean;
}

export interface GetMarketResponse {
  market: Market;
  activity?: MarketActivity[];
  chartData?: MarketChartData[];
  odds: MarketOdds;
  timeRemaining: number;
}

export interface CreateMarketRequest {
  question: string;
  optionA: string;
  optionB: string;
  category: string;
  imageURI?: string;
  duration: number;
  isBreakingNews: boolean;
  minBet: number;
  maxBet: number;
}

export interface CreateMarketResponse {
  marketId: number;
  market: Market;
}

// Users API
export interface GetUserStatsRequest {
  address: string;
  period?: 'all_time' | 'monthly' | 'weekly';
}

export interface GetUserStatsResponse {
  stats: UserStats;
  recentActivity: UserActivityItem[];
  achievements: UserAchievement[];
}

export interface GetUserPositionsRequest {
  address: string;
  status?: 'active' | 'claimable' | 'claimed' | 'all';
  page?: number;
  limit?: number;
}

export interface GetUserPositionsResponse extends PaginatedResponse<UserPosition> {}

export interface GetLeaderboardRequest {
  sortBy?: 'winnings' | 'win_rate' | 'streak' | 'roi';
  period?: 'all_time' | 'monthly' | 'weekly';
  limit?: number;
  userAddress?: string; // To get user's rank
}

export interface GetLeaderboardResponse {
  leaderboard: LeaderboardUser[];
  userRank?: number;
  period: string;
  sortBy: string;
}

export interface UpdateUserProfileRequest {
  username?: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateUserPreferencesRequest {
  notifications?: Partial<UserPreferences['notifications']>;
  privacy?: Partial<UserPreferences['privacy']>;
  display?: Partial<UserPreferences['display']>;
}

// Positions API
export interface CreatePositionRequest {
  marketId: number;
  isOptionA: boolean;
  shares: number;
  amountInvested: number;
  txId: string; // Transaction ID
}

export interface CreatePositionResponse {
  position: UserPosition;
  market: Market;
}

export interface ClaimWinningsRequest {
  marketId: number;
  txId: string; // Transaction ID
}

export interface ClaimWinningsResponse {
  amount: number;
  fees: number;
  position: UserPosition;
}

// IPFS API
export interface UploadToIPFSRequest {
  file: File;
  metadata?: {
    name?: string;
    description?: string;
    attributes?: Record<string, any>;
  };
}

export interface UploadToIPFSResponse {
  cid: string;
  url: string;
  metadata?: any;
}

// Admin API
export interface ResolveMarketRequest {
  marketId: number;
  outcome: string;
  reason?: string;
  txId: string;
}

export interface ResolveMarketResponse {
  market: Market;
  affectedUsers: number;
  totalPayout: number;
}

export interface GetPlatformStatsRequest {
  period?: 'all_time' | 'monthly' | 'weekly' | 'daily';
}

export interface GetPlatformStatsResponse {
  totalMarkets: number;
  activeMarkets: number;
  totalVolume: number;
  totalUsers: number;
  totalFeesCollected: number;
  averageMarketDuration: number;
  topCategories: Array<{
    category: string;
    count: number;
    volume: number;
  }>;
  chartData: Array<{
    timestamp: number;
    volume: number;
    users: number;
    markets: number;
  }>;
}

// Search API
export interface SearchRequest {
  query: string;
  type?: 'markets' | 'users' | 'all';
  limit?: number;
  filters?: {
    category?: string;
    status?: string;
    minPool?: number;
    maxPool?: number;
  };
}

export interface SearchResponse {
  markets: Market[];
  users: UserSearchResult[];
  total: number;
}

// Notifications API
export interface GetNotificationsRequest {
  address: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface GetNotificationsResponse extends PaginatedResponse<UserNotification> {
  unreadCount: number;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface CreateNotificationRequest {
  userAddress: string;
  type: UserNotification['type'];
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

// WebSocket events
export interface WebSocketEvent {
  type: string;
  timestamp: number;
  data: any;
}

export interface MarketUpdateEvent extends WebSocketEvent {
  type: 'market_update';
  data: {
    marketId: number;
    odds: MarketOdds;
    totalPool: number;
    shares: {
      optionA: number;
      optionB: number;
    };
  };
}

export interface NewMarketEvent extends WebSocketEvent {
  type: 'new_market';
  data: {
    market: Market;
  };
}

export interface MarketResolvedEvent extends WebSocketEvent {
  type: 'market_resolved';
  data: {
    marketId: number;
    outcome: string;
    winningOption: string;
  };
}

export interface UserNotificationEvent extends WebSocketEvent {
  type: 'user_notification';
  data: {
    userAddress: string;
    notification: UserNotification;
  };
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // timestamp
  retryAfter?: number; // seconds
}

// Health check
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: number;
  services: {
    database: 'up' | 'down';
    ipfs: 'up' | 'down';
    blockchain: 'up' | 'down';
  };
  uptime: number;
}