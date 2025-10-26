import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Exclude Mysten packages from server components bundling
  serverExternalPackages: [
    '@mysten/dapp-kit',
    '@mysten/sui.js',
    '@mysten/wallet-standard',
  ],
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
    NEXT_PUBLIC_SUIMERA_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_SUIMERA_CONTRACT_ADDRESS,
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

    // Handle Mysten SDK packages - mark as external for server-side
    if (isServer) {
      // Get existing externals or initialize empty array
      const existingExternals = config.externals || [];
      
      config.externals = [
        ...(Array.isArray(existingExternals) ? existingExternals : [existingExternals]),
        // Mark Mysten packages as external for server-side
        ({ request }: { request: string }, callback: (error?: Error | null, result?: string) => void) => {
          if (
            request.startsWith('@mysten/') ||
            request.includes('@mysten/dapp-kit') ||
            request.includes('@mysten/sui') ||
            request.includes('@mysten/wallet')
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }

    // Only add fallback for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
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