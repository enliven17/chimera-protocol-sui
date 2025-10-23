"use client";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { hederaTestnet, hederaMainnet } from "@/config/hedera";

const queryClient = new QueryClient();

const isMainnet = process.env.NEXT_PUBLIC_HEDERA_NETWORK === "mainnet";
const activeChain = isMainnet ? hederaMainnet : hederaTestnet;

const wagmiConfig = getDefaultConfig({
  appName: "Chimera",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [sepolia, activeChain as any],
  transports: {
    [sepolia.id]: http(),
    [activeChain.id]: http(activeChain.rpcUrls.default.http[0]),
  },
  ssr: true,
}) as any;

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#eab308" })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}