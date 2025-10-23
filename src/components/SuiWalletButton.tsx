'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

export function SuiWalletButton() {
  const currentAccount = useCurrentAccount();

  return (
    <ConnectButton
      connectText="Connect Sui Wallet"
      connectedText={`${currentAccount?.address?.slice(0, 6)}...${currentAccount?.address?.slice(-4)}`}
    />
  );
}