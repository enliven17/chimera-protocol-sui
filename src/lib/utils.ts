/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAmount = (amount: string): string => {
  return parseFloat(amount).toFixed(8);
};

export const parseAmount = (amount: string): number => {
  return parseFloat(amount);
};

export const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export interface ContractError {
  message: string;
  code?: number;
  details?: any;
}

export const handleContractError = (error: any): ContractError => {
  if (error?.message) {
    return {
      message: error.message,
      code: error.code,
      details: error,
    };
  }
  return { message: "Unknown contract error occurred", details: error };
};

export const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTime = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};

// Hedera Hashscan helper (testnet by default)
export const getHederaHashscanUrl = (address: string): string => {
  const baseUrl = "https://hashscan.io/testnet";
  return `${baseUrl}/address/${address}`;
};



export const getAvatarFallback = (address: string): string => {
  return address.slice(2, 4).toUpperCase();
};

export const safeToString = (value: any): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export const safeToNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const parsed = parseInt(safeToString(value));
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

export const safeToUInt64 = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "object" && (value as any).rawValue !== undefined) {
    return parseInt((value as any).rawValue.toString());
  }
  const parsed = parseInt(safeToString(value));
  return Number.isNaN(parsed) ? defaultValue : parsed;
};
