"use client";

// Import Mysten CSS on client side only
import '@mysten/dapp-kit/dist/index.css';
import { ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Client-side wrapper that imports Mysten SDK CSS
 * This ensures CSS is only loaded on the client, not the server
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return <>{children}</>;
}

