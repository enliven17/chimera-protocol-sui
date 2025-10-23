/**
 * Cookie utilities for ChimeraAI app
 */

export const setCookie = (name: string, value: string, days: number = 365): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export interface BetInfo {
  marketId: string;
  side: "optionA" | "optionB";
  amount: number;
  shares: number;
  timestamp: number;
  transactionId: string;
  marketTitle?: string;
  optionName?: string;
}

export const addBetToHistory = (address: string, betInfo: BetInfo): void => {
  const existingBets = getUserBetHistory(address);
  const updatedBets = [...existingBets, betInfo];
  setCookie(`prediction_bets_${address}`, JSON.stringify(updatedBets));
};

export const getUserBetHistory = (address: string): BetInfo[] => {
  const cookieData = getCookie(`prediction_bets_${address}`);
  if (!cookieData) return [];
  
  try {
    return JSON.parse(cookieData);
  } catch {
    return [];
  }
};