"use client";

import { ReactNode } from 'react';
// Import Mysten CSS with correct path
import '@mysten/dapp-kit/dist/index.css';

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


