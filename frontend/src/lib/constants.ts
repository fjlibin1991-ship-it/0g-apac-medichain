// Provider configuration constants
export const OG_CHAIN_CONFIG = {
  chainId: 16600, // 0G testnet
  name: '0G Testnet',
  rpcUrl: 'https://evmrpc-testnet.0g.ai',
  blockExplorer: 'https://explorer.0g.ai',
};

// Contract addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  healthWorkerRegistry: process.env.NEXT_PUBLIC_HEALTH_WORKER_REGISTRY || '0x0000000000000000000000000000000000000000',
};
