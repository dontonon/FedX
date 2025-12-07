// Blockchain utilities using Viem

import { createPublicClient, http, formatUnits } from 'viem';
import { arbitrum, optimism, base, polygon, mainnet, linea } from 'viem/chains';

// Chain configurations
const chainConfigs = {
  arbitrum: {
    chain: arbitrum,
    rpc: 'https://arb1.arbitrum.io/rpc',
  },
  optimism: {
    chain: optimism,
    rpc: 'https://mainnet.optimism.io',
  },
  base: {
    chain: base,
    rpc: 'https://mainnet.base.org',
  },
  polygon: {
    chain: polygon,
    rpc: 'https://polygon-rpc.com',
  },
  ethereum: {
    chain: mainnet,
    rpc: 'https://eth.llamarpc.com',
  },
  linea: {
    chain: linea,
    rpc: 'https://rpc.linea.build',
  },
};

// Create public client for a chain
export function getPublicClient(chainName) {
  const config = chainConfigs[chainName];
  if (!config) {
    throw new Error(`Unsupported chain: ${chainName}`);
  }

  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpc),
  });
}

// Uniswap V3 Position Manager ABI (minimal)
const POSITION_MANAGER_ABI = [
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'positions',
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// ERC20 ABI (minimal)
const ERC20_ABI = [
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Uniswap V3 Position Manager addresses by chain
const POSITION_MANAGERS = {
  arbitrum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  optimism: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  base: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
  polygon: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  ethereum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
};

// Fetch Uniswap V3 position by NFT ID
export async function fetchUniswapV3Position(chainName, nftId) {
  const client = getPublicClient(chainName);
  const positionManager = POSITION_MANAGERS[chainName];

  if (!positionManager) {
    throw new Error(`Uniswap V3 not supported on ${chainName}`);
  }

  try {
    const position = await client.readContract({
      address: positionManager,
      abi: POSITION_MANAGER_ABI,
      functionName: 'positions',
      args: [BigInt(nftId)],
    });

    const [
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
    ] = position;

    // Fetch token symbols
    const [token0Symbol, token1Symbol, token0Decimals, token1Decimals] = await Promise.all([
      client.readContract({ address: token0, abi: ERC20_ABI, functionName: 'symbol' }),
      client.readContract({ address: token1, abi: ERC20_ABI, functionName: 'symbol' }),
      client.readContract({ address: token0, abi: ERC20_ABI, functionName: 'decimals' }),
      client.readContract({ address: token1, abi: ERC20_ABI, functionName: 'decimals' }),
    ]);

    return {
      nftId: nftId.toString(),
      token0: {
        address: token0,
        symbol: token0Symbol,
        decimals: token0Decimals,
      },
      token1: {
        address: token1,
        symbol: token1Symbol,
        decimals: token1Decimals,
      },
      fee: Number(fee) / 10000, // Convert to percentage
      tickLower: Number(tickLower),
      tickUpper: Number(tickUpper),
      liquidity: liquidity.toString(),
      tokensOwed0: formatUnits(tokensOwed0, token0Decimals),
      tokensOwed1: formatUnits(tokensOwed1, token1Decimals),
      chain: chainName,
      protocol: 'uniswap-v3',
    };
  } catch (error) {
    console.error('Error fetching Uniswap V3 position:', error);
    throw error;
  }
}

// Fetch all Uniswap V3 positions for a wallet
export async function fetchAllUniswapV3Positions(chainName, walletAddress) {
  const client = getPublicClient(chainName);
  const positionManager = POSITION_MANAGERS[chainName];

  if (!positionManager) {
    return [];
  }

  try {
    const balance = await client.readContract({
      address: positionManager,
      abi: POSITION_MANAGER_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    const positions = [];
    for (let i = 0; i < Number(balance); i++) {
      const tokenId = await client.readContract({
        address: positionManager,
        abi: POSITION_MANAGER_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [walletAddress, BigInt(i)],
      });

      try {
        const position = await fetchUniswapV3Position(chainName, tokenId.toString());
        positions.push(position);
      } catch (e) {
        console.warn(`Failed to fetch position ${tokenId}:`, e);
      }
    }

    return positions;
  } catch (error) {
    console.error('Error fetching all positions:', error);
    return [];
  }
}

// Aave V3 Pool ABI (minimal)
const AAVE_POOL_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { name: 'totalCollateralBase', type: 'uint256' },
      { name: 'totalDebtBase', type: 'uint256' },
      { name: 'availableBorrowsBase', type: 'uint256' },
      { name: 'currentLiquidationThreshold', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// Aave V3 Pool addresses by chain
const AAVE_POOLS = {
  arbitrum: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  optimism: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  base: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  polygon: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  ethereum: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
};

// Fetch Aave V3 account data
export async function fetchAaveAccountData(chainName, walletAddress) {
  const client = getPublicClient(chainName);
  const poolAddress = AAVE_POOLS[chainName];

  if (!poolAddress) {
    throw new Error(`Aave V3 not supported on ${chainName}`);
  }

  try {
    const data = await client.readContract({
      address: poolAddress,
      abi: AAVE_POOL_ABI,
      functionName: 'getUserAccountData',
      args: [walletAddress],
    });

    const [
      totalCollateralBase,
      totalDebtBase,
      availableBorrowsBase,
      currentLiquidationThreshold,
      ltv,
      healthFactor,
    ] = data;

    // Values are in 8 decimals (USD base)
    return {
      totalCollateral: Number(formatUnits(totalCollateralBase, 8)),
      totalDebt: Number(formatUnits(totalDebtBase, 8)),
      availableBorrows: Number(formatUnits(availableBorrowsBase, 8)),
      liquidationThreshold: Number(currentLiquidationThreshold) / 100,
      ltv: Number(ltv) / 100,
      healthFactor: Number(formatUnits(healthFactor, 18)),
      chain: chainName,
      protocol: 'aave-v3',
    };
  } catch (error) {
    console.error('Error fetching Aave account data:', error);
    throw error;
  }
}

// Fetch token balance
export async function fetchTokenBalance(chainName, tokenAddress, walletAddress) {
  const client = getPublicClient(chainName);

  try {
    const [balance, decimals, symbol] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress],
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
    ]);

    return {
      balance: formatUnits(balance, decimals),
      decimals,
      symbol,
      tokenAddress,
      chain: chainName,
    };
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
}

// Fetch native ETH balance
export async function fetchNativeBalance(chainName, walletAddress) {
  const client = getPublicClient(chainName);

  try {
    const balance = await client.getBalance({ address: walletAddress });
    return {
      balance: formatUnits(balance, 18),
      symbol: 'ETH',
      chain: chainName,
    };
  } catch (error) {
    console.error('Error fetching native balance:', error);
    throw error;
  }
}
