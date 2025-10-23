import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "api.dicebear.com",
      "flowscan.org",
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
    ],
  },
  env: {
    NEXT_PUBLIC_HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CHIMERA_CONTRACT_ADDRESS,
    NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_PYUSD_CONTRACT_ADDRESS,
    NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_PYTH_CONTRACT_ADDRESS,
    NEXT_PUBLIC_HEDERA_CHAIN_ID: process.env.NEXT_PUBLIC_HEDERA_NETWORK === "mainnet" ? "295" : "296",
  },
  webpack: (config, { isServer }) => {
    // Add the Cadence loader first
    config.module.rules.push({
      test: /\.cdc$/,
      type: 'asset/source',
    });

    // Add alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@flow-wager': path.resolve(__dirname, 'flow-wager'),
    };

    // Only add fallback for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx']
};

export default nextConfig;