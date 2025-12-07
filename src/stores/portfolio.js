// Zustand store for portfolio state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId, calculatePortfolioMetrics, aggregateBy, calculatePercentages } from '../lib/utils';

// Sample data for initial state
const SAMPLE_POSITIONS = [
  {
    id: '1',
    name: 'USDC/ARB 0.3%',
    protocol: 'uniswap-v4',
    chain: 'arbitrum',
    type: 'liquidity',
    exposure: 'ALT/USDC',
    value: 2850,
    debt: 0,
    apr: 45.2,
    monthlyFees: 107.35,
    nftId: '103138',
    token0: 'USDC',
    token1: 'ARB',
    createdAt: '2024-11-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'ETH/USDC 0.05%',
    protocol: 'uniswap-v3',
    chain: 'arbitrum',
    type: 'liquidity',
    exposure: 'ETH/USDC',
    value: 4200,
    debt: 0,
    apr: 22.5,
    monthlyFees: 78.75,
    nftId: '98542',
    token0: 'ETH',
    token1: 'USDC',
    createdAt: '2024-10-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'WETH Collateral',
    protocol: 'aave-v3',
    chain: 'arbitrum',
    type: 'collateral',
    exposure: 'ETH',
    value: 8500,
    debt: 5200,
    apr: 2.1,
    monthlyFees: 0,
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: '4',
    name: 'USDC Collateral',
    protocol: 'morpho',
    chain: 'base',
    type: 'collateral',
    exposure: 'Stable',
    value: 3200,
    debt: 2300,
    apr: 8.5,
    monthlyFees: 22.67,
    createdAt: '2024-10-05T16:45:00Z',
  },
  {
    id: '5',
    name: 'WBTC/ETH 0.3%',
    protocol: 'uniswap-v3',
    chain: 'optimism',
    type: 'liquidity',
    exposure: 'ETH/BTC',
    value: 1800,
    debt: 0,
    apr: 18.3,
    monthlyFees: 27.45,
    nftId: '45678',
    token0: 'WBTC',
    token1: 'ETH',
    createdAt: '2024-11-01T12:00:00Z',
  },
  {
    id: '6',
    name: 'ARB Staking',
    protocol: 'other',
    chain: 'arbitrum',
    type: 'stake',
    exposure: 'ALT',
    value: 950,
    debt: 0,
    apr: 12.5,
    monthlyFees: 9.90,
    createdAt: '2024-11-10T09:15:00Z',
  },
  {
    id: '7',
    name: 'OP/USDC',
    protocol: 'velodrome',
    chain: 'optimism',
    type: 'liquidity',
    exposure: 'ALT/USDC',
    value: 1650,
    debt: 0,
    apr: 38.2,
    monthlyFees: 52.53,
    createdAt: '2024-10-25T11:30:00Z',
  },
  {
    id: '8',
    name: 'cbETH/ETH',
    protocol: 'aerodrome',
    chain: 'base',
    type: 'liquidity',
    exposure: 'ETH',
    value: 2100,
    debt: 0,
    apr: 8.7,
    monthlyFees: 15.23,
    createdAt: '2024-11-05T14:00:00Z',
  },
];

const usePortfolioStore = create(
  persist(
    (set, get) => ({
      // State
      positions: SAMPLE_POSITIONS,
      snapshots: [],
      settings: {
        walletAddress: '0xfdf3B3B1cfE5f4967DabA1719693d589Ba790c1c',
        theme: 'dark',
        goalAmount: 635,
      },
      isLoading: false,
      error: null,

      // Computed values (as getters via selectors)
      getMetrics: () => {
        const { positions } = get();
        return calculatePortfolioMetrics(positions);
      },

      getChainAllocation: () => {
        const { positions } = get();
        const aggregated = aggregateBy(positions, 'chain', 'value');
        return calculatePercentages(aggregated);
      },

      getExposureAllocation: () => {
        const { positions } = get();
        const aggregated = aggregateBy(positions, 'exposure', 'value');
        return calculatePercentages(aggregated);
      },

      getTypeAllocation: () => {
        const { positions } = get();
        const aggregated = aggregateBy(positions, 'type', 'value');
        return calculatePercentages(aggregated);
      },

      getProtocolAllocation: () => {
        const { positions } = get();
        const aggregated = aggregateBy(positions, 'protocol', 'value');
        return calculatePercentages(aggregated);
      },

      // Position Actions
      addPosition: (position) => {
        const newPosition = {
          ...position,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          positions: [...state.positions, newPosition],
        }));
        return newPosition;
      },

      updatePosition: (id, updates) => {
        set((state) => ({
          positions: state.positions.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deletePosition: (id) => {
        set((state) => ({
          positions: state.positions.filter((p) => p.id !== id),
        }));
      },

      duplicatePosition: (id) => {
        const { positions, addPosition } = get();
        const position = positions.find((p) => p.id === id);
        if (position) {
          const { id: _, createdAt: __, ...rest } = position;
          return addPosition({ ...rest, name: `${rest.name} (copy)` });
        }
        return null;
      },

      // Bulk Actions
      setPositions: (positions) => {
        set({ positions });
      },

      clearPositions: () => {
        set({ positions: [] });
      },

      // Snapshot Actions
      saveSnapshot: () => {
        const { positions } = get();
        const metrics = calculatePortfolioMetrics(positions);
        const snapshot = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          positions: positions.length,
          ...metrics,
        };
        set((state) => ({
          snapshots: [...state.snapshots, snapshot].slice(-100), // Keep last 100
        }));
        return snapshot;
      },

      clearSnapshots: () => {
        set({ snapshots: [] });
      },

      // Settings Actions
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // UI State
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Data Import/Export
      exportData: () => {
        const { positions, snapshots, settings } = get();
        return {
          positions,
          snapshots,
          settings,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        };
      },

      importData: (data) => {
        if (data.positions) {
          set({ positions: data.positions });
        }
        if (data.snapshots) {
          set({ snapshots: data.snapshots });
        }
        if (data.settings) {
          set((state) => ({
            settings: { ...state.settings, ...data.settings },
          }));
        }
      },

      // Reset to sample data
      resetToSampleData: () => {
        set({
          positions: SAMPLE_POSITIONS,
          snapshots: [],
        });
      },
    }),
    {
      name: 'fedx-portfolio',
      version: 1,
    }
  )
);

export default usePortfolioStore;
