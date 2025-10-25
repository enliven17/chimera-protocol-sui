'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/sui.js/zklogin';
import { SuiClient } from '@mysten/sui.js/client';
import { suiClient } from '@/lib/sui-client';

export type Provider = 'google' | 'facebook' | 'twitch';

interface ZkLoginState {
  // Authentication state
  isAuthenticated: boolean;
  userInfo: {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    provider: Provider;
  } | null;
  suiAddress: string | null;
  
  // Loading states
  isLoading: boolean;
  isGeneratingProof: boolean;
  
  // Methods
  loginWithProvider: (provider: Provider) => Promise<void>;
  logout: () => void;
  
  // zkLogin specific
  ephemeralKeyPair: Ed25519Keypair | null;
  userSalt: string | null;
  zkProof: any | null;
}

const ZkLoginContext = createContext<ZkLoginState | null>(null);

interface ZkLoginProviderProps {
  children: ReactNode;
}

export function ZkLoginProvider({ children }: ZkLoginProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<ZkLoginState['userInfo']>(null);
  const [suiAddress, setSuiAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair | null>(null);
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [zkProof, setZkProof] = useState<any>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('zklogin-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setUserInfo(session.userInfo);
        setSuiAddress(session.suiAddress);
        setUserSalt(session.userSalt);
        setIsAuthenticated(true);
        
        // Restore ephemeral keypair if available
        if (session.ephemeralPrivateKey) {
          const keypair = Ed25519Keypair.fromSecretKey(
            Uint8Array.from(session.ephemeralPrivateKey)
          );
          setEphemeralKeyPair(keypair);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('zklogin-session');
      }
    }
  }, []);

  const getProviderConfig = (provider: Provider) => {
    switch (provider) {
      case 'google':
        return {
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          scope: 'openid email profile',
        };
      case 'facebook':
        return {
          clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID!,
          authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
          scope: 'email public_profile',
        };
      case 'twitch':
        return {
          clientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          authUrl: 'https://id.twitch.tv/oauth2/authorize',
          scope: 'openid user:read:email',
        };
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  const loginWithProvider = async (provider: Provider) => {
    setIsLoading(true);
    
    try {
      // Generate ephemeral keypair
      const ephemeralKeyPair = new Ed25519Keypair();
      setEphemeralKeyPair(ephemeralKeyPair);
      
      // Generate randomness and nonce
      const randomness = generateRandomness();
      const nonce = generateNonce(
        ephemeralKeyPair.getPublicKey(),
        BigInt(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        randomness
      );

      // Store ephemeral data
      const ephemeralData = {
        ephemeralPrivateKey: Array.from(ephemeralKeyPair.getSecretKey()),
        randomness: randomness.toString(),
        nonce,
      };
      localStorage.setItem('zklogin-ephemeral', JSON.stringify(ephemeralData));

      // Get provider config
      const config = getProviderConfig(provider);
      
      // Build OAuth URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
        response_type: 'code',
        scope: config.scope,
        nonce,
        state: provider, // Pass provider in state
      });

      const authUrl = `${config.authUrl}?${params.toString()}`;
      
      // Redirect to OAuth provider
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setSuiAddress(null);
    setEphemeralKeyPair(null);
    setUserSalt(null);
    setZkProof(null);
    
    // Clear stored data
    localStorage.removeItem('zklogin-session');
    localStorage.removeItem('zklogin-ephemeral');
  };

  const value: ZkLoginState = {
    isAuthenticated,
    userInfo,
    suiAddress,
    isLoading,
    isGeneratingProof,
    loginWithProvider,
    logout,
    ephemeralKeyPair,
    userSalt,
    zkProof,
  };

  return (
    <ZkLoginContext.Provider value={value}>
      {children}
    </ZkLoginContext.Provider>
  );
}

export function useZkLogin() {
  const context = useContext(ZkLoginContext);
  if (!context) {
    throw new Error('useZkLogin must be used within a ZkLoginProvider');
  }
  return context;
}