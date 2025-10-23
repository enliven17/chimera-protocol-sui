import { defineChain } from "viem";

export const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HBAR",
    symbol: "HBAR",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "Hashscan",
      url: "https://hashscan.io/testnet",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1,
    },
  },
  testnet: true,
});

export const hederaMainnet = defineChain({
  id: 295,
  name: "Hedera Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "HBAR",
    symbol: "HBAR",
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.hashio.io/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "Hashscan",
      url: "https://hashscan.io/mainnet",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1,
    },
  },
  testnet: false,
});