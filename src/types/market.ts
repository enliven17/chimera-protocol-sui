/* eslint-disable @typescript-eslint/no-explicit-any */

// Market-related type definitions aligned with ChimeraAI contract
export interface Market {
  id: string;
  title: string;
  description: string;
  category: number;
  optionA: string;
  optionB: string;
  creator: string;
  createdAt: string;
  endTime: string;
  minBet: string;
  maxBet: string;
  status: number;
  outcome: number | null;
  resolved: boolean;
  totalOptionAShares: string;
  totalOptionBShares: string;
  totalPool: string;
  imageURI?: string;
  // Additional calculated fields
  totalBets?: number;
  totalParticipants?: number;
  imageUrl?: string;
}

export interface MarketMetadata {
  ipfsHash?: string;
  source?: string;
  rules?: string;
  additionalInfo?: string;
}

export enum MarketStatus {
  Active = 0,
  Paused = 1,
  Resolved = 2,
  Cancelled = 3,
}

export enum MarketOutcome {
  OptionA = 0,
  OptionB = 1,
  Draw = 2,
  Cancelled = 3,
}

export enum MarketCategory {
  Sports = 0,
  Entertainment = 1,
  Technology = 2,
  Economics = 3,
  Weather = 4,
  Crypto = 5,
  Politics = 6,
  BreakingNews = 7,
  Other = 8,
}

export const MarketStatusLabels = {
  [MarketStatus.Active]: "Active",
  [MarketStatus.Paused]: "Paused",
  [MarketStatus.Resolved]: "Resolved",
  [MarketStatus.Cancelled]: "Cancelled",
} as const;

export const MarketOutcomeLabels = {
  [MarketOutcome.OptionA]: "Option A",
  [MarketOutcome.OptionB]: "Option B",
  [MarketOutcome.Draw]: "Draw",
  [MarketOutcome.Cancelled]: "Cancelled",
} as const;

export const MarketCategoryLabels = {
  [MarketCategory.Sports]: "Sports",
  [MarketCategory.Entertainment]: "Entertainment",
  [MarketCategory.Technology]: "Technology",
  [MarketCategory.Economics]: "Economics",
  [MarketCategory.Weather]: "Weather",
  [MarketCategory.Crypto]: "Crypto",
  [MarketCategory.Politics]: "Politics",
  [MarketCategory.BreakingNews]: "Breaking News",
  [MarketCategory.Other]: "Other",
} as const;

export interface Position {
  marketId: string;
  optionAShares: string;
  optionBShares: string;
  totalInvested: string;
  averagePrice: string;
  claimed: boolean;
}

export interface MarketFilter {
  category?: MarketCategory;
  status?: MarketStatus;
  search?: string;
  sortBy?: "volume" | "endTime" | "createdAt" | "activity";
  sortOrder?: "asc" | "desc";
}

export interface BetParams {
  marketId: string;
  option: number;
  amount: string;
}

export interface MarketOdds {
  optionA: number;
  optionB: number;
}

export interface MarketFilters {
  category?: MarketCategory | 'ALL';
  status?: MarketStatus;
  search?: string;
  sortBy?: 'newest' | 'ending_soon' | 'popular' | 'pool_size';
  sortOrder?: 'asc' | 'desc';
}

export interface MarketPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MarketResponse {
  markets: Market[];
  pagination: MarketPagination;
}

export interface CreateMarketRequest {
  title: string;
  description: string;
  optionA: string;
  optionB: string;
  category: MarketCategory;
  endTime: string;
  minBet: string;
  maxBet: string;
}

export interface ResolveMarketRequest {
  marketId: string;
  outcome: MarketOutcome;
}

export interface MarketChartData {
  timestamp: number;
  optionAPrice: number;
  optionBPrice: number;
  volume: number;
  optionAShares: number;
  optionBShares: number;
}

export interface MarketActivity {
  id: string;
  marketId: string;
  type: 'shares_purchased' | 'market_created' | 'market_resolved' | 'winnings_claimed';
  user: string;
  timestamp: number;
  data: {
    amount?: string;
    option?: number;
    outcome?: MarketOutcome;
    shares?: string;
    [key: string]: any;
  };
}

export type MarketId = string;
export type Address = string;
export type UFix64String = string;
export type UInt64String = string;

export interface PlatformStats {
  totalMarkets: number;
  activeMarkets: number;
  totalUsers: number;
  totalVolume: string;
  totalFees: string;
}