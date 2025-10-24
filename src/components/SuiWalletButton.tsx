'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export function SuiWalletButton() {
  return (
    <ConnectButton connectText="Connect Sui Wallet" />
  );
}