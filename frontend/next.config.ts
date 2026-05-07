import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@0g/storage-sdk', '@0g/compute-sdk'],
  webpack: (config) => {
    // Handle 0G SDK imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_0G_RPC_URL: process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai',
    NEXT_PUBLIC_0G_STORAGE_CONTRACT: process.env.NEXT_PUBLIC_0G_STORAGE_CONTRACT || '0xYourStorageContractAddress',
    NEXT_PUBLIC_0G_LOG_CONTRACT: process.env.NEXT_PUBLIC_0G_LOG_CONTRACT || '0xYourLogContractAddress',
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '16600',
  },
};

export default nextConfig;
