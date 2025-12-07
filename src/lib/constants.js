// Design System Constants

export const COLORS = {
  bg: {
    primary: '#0a0b0d',
    secondary: '#12141a',
    tertiary: '#1a1d26',
    elevated: '#22262f',
  },
  accent: {
    green: '#00d672',
    red: '#ff4757',
    yellow: '#ffc048',
    blue: '#4da6ff',
    purple: '#a855f7',
  },
  text: {
    primary: '#ffffff',
    secondary: '#94a3b8',
    tertiary: '#64748b',
    muted: '#475569',
  },
  border: {
    primary: '#2a2e38',
    secondary: '#1e2128',
  },
};

// Position Types
export const POSITION_TYPES = [
  { value: 'liquidity', label: 'Liquidity', color: COLORS.accent.blue },
  { value: 'collateral', label: 'Collateral', color: COLORS.accent.green },
  { value: 'stake', label: 'Stake', color: COLORS.accent.purple },
  { value: 'vault', label: 'Vault', color: COLORS.accent.yellow },
  { value: 'farming', label: 'Farming', color: '#ff6b9d' },
  { value: 'trading', label: 'Trading', color: '#00bcd4' },
];

// Exposure Categories
export const EXPOSURE_TYPES = [
  { value: 'ETH/USDC', label: 'ETH/USDC', color: '#627eea' },
  { value: 'ALT/USDC', label: 'ALT/USDC', color: '#00d672' },
  { value: 'ETH/BTC', label: 'ETH/BTC', color: '#f7931a' },
  { value: 'ETH/ALT', label: 'ETH/ALT', color: '#a855f7' },
  { value: 'Stable', label: 'Stable', color: '#2775ca' },
  { value: 'ETH', label: 'ETH', color: '#627eea' },
  { value: 'BTC', label: 'BTC', color: '#f7931a' },
  { value: 'ALT', label: 'ALT', color: '#ff6b9d' },
  { value: 'Other', label: 'Other', color: '#64748b' },
];

// Supported Chains
export const CHAINS = [
  { value: 'arbitrum', label: 'Arbitrum', color: '#28a0f0', chainId: 42161 },
  { value: 'optimism', label: 'Optimism', color: '#ff0420', chainId: 10 },
  { value: 'base', label: 'Base', color: '#0052ff', chainId: 8453 },
  { value: 'zksync', label: 'zkSync', color: '#8c8dfc', chainId: 324 },
  { value: 'polygon', label: 'Polygon', color: '#8247e5', chainId: 137 },
  { value: 'ethereum', label: 'Ethereum', color: '#627eea', chainId: 1 },
  { value: 'linea', label: 'Linea', color: '#61dfff', chainId: 59144 },
  { value: 'manta', label: 'Manta', color: '#00d9d5', chainId: 169 },
  { value: 'sonic', label: 'Sonic', color: '#5a67d8', chainId: 146 },
  { value: 'cosmos', label: 'Cosmos', color: '#6f7390', chainId: 0 },
];

// Protocols
export const PROTOCOLS = [
  { value: 'uniswap-v3', label: 'Uniswap V3' },
  { value: 'uniswap-v4', label: 'Uniswap V4' },
  { value: 'aave-v3', label: 'Aave V3' },
  { value: 'morpho', label: 'Morpho' },
  { value: 'curve', label: 'Curve' },
  { value: 'balancer', label: 'Balancer' },
  { value: 'gmx', label: 'GMX' },
  { value: 'camelot', label: 'Camelot' },
  { value: 'velodrome', label: 'Velodrome' },
  { value: 'aerodrome', label: 'Aerodrome' },
  { value: 'pendle', label: 'Pendle' },
  { value: 'other', label: 'Other' },
];

// Goal and thresholds
export const GOALS = {
  monthlyIncome: 635, // Target monthly passive income in USD
};

export const HEALTH_THRESHOLDS = {
  danger: 1.2,
  warning: 1.5,
  safe: 1.5,
};

// Chart colors for allocation
export const CHART_COLORS = [
  '#00d672', '#4da6ff', '#ffc048', '#ff4757', '#a855f7',
  '#ff6b9d', '#00bcd4', '#627eea', '#f7931a', '#64748b',
];

// DeFiLlama API
export const DEFILLAMA_API = 'https://coins.llama.fi';

// Common token addresses for price fetching
export const TOKEN_IDS = {
  ETH: 'coingecko:ethereum',
  WETH: 'coingecko:weth',
  USDC: 'coingecko:usd-coin',
  USDT: 'coingecko:tether',
  DAI: 'coingecko:dai',
  WBTC: 'coingecko:wrapped-bitcoin',
  ARB: 'coingecko:arbitrum',
  OP: 'coingecko:optimism',
};
