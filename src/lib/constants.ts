/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarketCategory, MarketStatus } from "@/types/market";

export function formatCurrency(value: string | number, currency = "PYUSD"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return `0.00 ${currency}`;
  return `${num.toFixed(2)} ${currency}`;
}

export function formatCompactCurrency(value: string | number, currency = "PYUSD"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return `0 ${currency}`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M ${currency}`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K ${currency}`;
  return `${num.toFixed(0)} ${currency}`;
}

// Percentage formatting
export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

// Price formatting for markets (0-1 range to 0-100¢)
export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "0¢";
  return `${(num * 100).toFixed(0)}¢`;
}

// Address formatting
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Time formatting utilities
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export function formatTimeUntil(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff <= 0) return 'Ended';
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} left`;
}

// Market utilities
export function getMarketStatusColor(status: MarketStatus): string {
  switch (status) {
    case MarketStatus.Active:
      return "text-yellow-600";
    case MarketStatus.Paused:
      return "text-yellow-600";
    case MarketStatus.Resolved:
      return "text-blue-600";
    case MarketStatus.Cancelled:
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function getCategoryColor(category: MarketCategory): string {
  switch (category) {
    case MarketCategory.Sports:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case MarketCategory.Politics:
      return "bg-red-100 text-red-800 border-red-200";
    case MarketCategory.Entertainment:
      return "bg-purple-100 text-purple-800 border-purple-200";
    case MarketCategory.Technology:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case MarketCategory.Economics:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case MarketCategory.Crypto:
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// Validation utilities
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num < 1000000;
}

export function isValidPrice(price: string): boolean {
  const num = parseFloat(price);
  return !isNaN(num) && num >= 0 && num <= 1;
}

// Calculation utilities
export function calculateImpliedProbability(price: string | number): number {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return Math.max(0, Math.min(100, num * 100));
}

export function calculateROI(currentValue: string | number, originalCost: string | number): number {
  const current = typeof currentValue === "string" ? parseFloat(currentValue) : currentValue;
  const cost = typeof originalCost === "string" ? parseFloat(originalCost) : originalCost;
  
  if (cost === 0) return 0;
  return ((current - cost) / cost) * 100;
}

// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}