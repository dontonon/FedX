import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, optimism, base, zkSync } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Katana chain (custom chain for Ronin Network)
export const katana = defineChain({
  id: 1261120,
  name: 'Katana',
  nativeCurrency: {
    decimals: 18,
    name: 'Ronin',
    symbol: 'RON',
  },
  rpcUrls: {
    default: { http: ['https://api.katana.roninchain.com/rpc'] },
    public: { http: ['https://api.katana.roninchain.com/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Katana Explorer', url: 'https://explorer.katana.roninchain.com' },
  },
  testnet: false,
});

export const config = getDefaultConfig({
  appName: 'FedX - DeFi Portfolio Tracker',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'fedx-defi-portfolio-tracker', // Get from https://cloud.walletconnect.com
  chains: [arbitrum, optimism, base, katana, zkSync],
  ssr: false,
});

export const supportedChains = {
  arbitrum: {
    id: arbitrum.id,
    name: 'Arbitrum',
    symbol: 'ARB',
    nativeCurrency: 'ETH',
  },
  optimism: {
    id: optimism.id,
    name: 'Optimism',
    symbol: 'OP',
    nativeCurrency: 'ETH',
  },
  base: {
    id: base.id,
    name: 'Base',
    symbol: 'BASE',
    nativeCurrency: 'ETH',
  },
  katana: {
    id: katana.id,
    name: 'Katana',
    symbol: 'RON',
    nativeCurrency: 'RON',
  },
  zkSync: {
    id: zkSync.id,
    name: 'zkSync',
    symbol: 'ZK',
    nativeCurrency: 'ETH',
  },
};

// Uniswap V3 NonfungiblePositionManager addresses per chain
export const UNISWAP_V3_NFT_MANAGER = {
  [arbitrum.id]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  [optimism.id]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  [base.id]: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
  // Note: Katana and zkSync may not have Uniswap V3
};

// Aave V3 Pool addresses per chain
export const AAVE_V3_POOL = {
  [arbitrum.id]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [optimism.id]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [base.id]: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
};
