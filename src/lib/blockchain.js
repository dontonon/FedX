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
];

// Uniswap V3 Factory ABI
const FACTORY_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'fee', type: 'uint24' },
    ],
    name: 'getPool',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Uniswap V3 Pool ABI
const POOL_ABI = [
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' },
    ],
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
];

// Contract addresses by chain
const CONTRACTS = {
  arbitrum: {
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  optimism: {
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  base: {
    positionManager: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
    factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  },
  polygon: {
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
  ethereum: {
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  },
};

// Token price mapping for DeFiLlama
const TOKEN_PRICE_IDS = {
  'WETH': 'coingecko:weth',
  'ETH': 'coingecko:ethereum',
  'USDC': 'coingecko:usd-coin',
  'USDC.e': 'coingecko:usd-coin',
  'USDbC': 'coingecko:usd-coin',
  'USDT': 'coingecko:tether',
  'DAI': 'coingecko:dai',
  'WBTC': 'coingecko:wrapped-bitcoin',
  'ARB': 'coingecko:arbitrum',
  'OP': 'coingecko:optimism',
  'MATIC': 'coingecko:matic-network',
  'LINK': 'coingecko:chainlink',
  'UNI': 'coingecko:uniswap',
  'AAVE': 'coingecko:aave',
  'CRV': 'coingecko:curve-dao-token',
  'GMX': 'coingecko:gmx',
  'PENDLE': 'coingecko:pendle',
  'STG': 'coingecko:stargate-finance',
  'GRAIL': 'coingecko:camelot-token',
  'cbETH': 'coingecko:coinbase-wrapped-staked-eth',
  'rETH': 'coingecko:rocket-pool-eth',
  'wstETH': 'coingecko:wrapped-steth',
};

// Uniswap V3 math - calculate sqrtPrice from tick
const Q96 = 2n ** 96n;

function tickToSqrtPriceX96(tick) {
  // Using the formula: sqrtPrice = 1.0001^(tick/2) * 2^96
  // We use a lookup table approach for precision
  const absTick = Math.abs(tick);
  let ratio = absTick & 0x1 ? 0xfffcb933bd6fad37aa2d162d1a594001n : 0x100000000000000000000000000000000n;

  if (absTick & 0x2) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
  if (absTick & 0x4) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if (absTick & 0x8) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if (absTick & 0x10) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if (absTick & 0x20) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if (absTick & 0x40) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if (absTick & 0x80) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if (absTick & 0x100) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if (absTick & 0x200) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if (absTick & 0x400) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if (absTick & 0x800) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if (absTick & 0x1000) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if (absTick & 0x2000) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if (absTick & 0x4000) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if (absTick & 0x8000) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if (absTick & 0x10000) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if (absTick & 0x20000) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if (absTick & 0x40000) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if (absTick & 0x80000) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;

  if (tick > 0) {
    ratio = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn / ratio;
  }

  return (ratio >> 32n) + (ratio % (1n << 32n) === 0n ? 0n : 1n);
}

function getTokenAmounts(liquidity, sqrtPriceX96, tickLower, tickUpper, currentTick, decimals0, decimals1) {
  const sqrtPriceLower = tickToSqrtPriceX96(tickLower);
  const sqrtPriceUpper = tickToSqrtPriceX96(tickUpper);
  const liquidityBN = BigInt(liquidity);
  const sqrtPriceCurrent = BigInt(sqrtPriceX96);

  let amount0 = 0n;
  let amount1 = 0n;

  if (currentTick < tickLower) {
    // Position is entirely in token0
    amount0 = (liquidityBN * Q96 * (sqrtPriceUpper - sqrtPriceLower)) / (sqrtPriceLower * sqrtPriceUpper);
  } else if (currentTick >= tickUpper) {
    // Position is entirely in token1
    amount1 = (liquidityBN * (sqrtPriceUpper - sqrtPriceLower)) / Q96;
  } else {
    // Position is in range
    amount0 = (liquidityBN * Q96 * (sqrtPriceUpper - sqrtPriceCurrent)) / (sqrtPriceCurrent * sqrtPriceUpper);
    amount1 = (liquidityBN * (sqrtPriceCurrent - sqrtPriceLower)) / Q96;
  }

  // Convert to human readable
  const amount0Human = Number(amount0) / Math.pow(10, decimals0);
  const amount1Human = Number(amount1) / Math.pow(10, decimals1);

  return { amount0: amount0Human, amount1: amount1Human };
}

// Fetch token prices from DeFiLlama
async function fetchTokenPrices(symbols) {
  const ids = symbols
    .map(s => TOKEN_PRICE_IDS[s] || TOKEN_PRICE_IDS[s.toUpperCase()])
    .filter(Boolean);

  if (ids.length === 0) {
    console.warn('No price IDs found for symbols:', symbols);
    return {};
  }

  try {
    const response = await fetch(`https://coins.llama.fi/prices/current/${ids.join(',')}`);
    const data = await response.json();

    const prices = {};
    symbols.forEach(symbol => {
      const id = TOKEN_PRICE_IDS[symbol] || TOKEN_PRICE_IDS[symbol.toUpperCase()];
      if (id && data.coins?.[id]) {
        prices[symbol] = data.coins[id].price;
      }
    });

    return prices;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return {};
  }
}

// Fetch Uniswap V3 position with full value calculation
export async function fetchUniswapV3Position(chainName, nftId) {
  const client = getPublicClient(chainName);
  const contracts = CONTRACTS[chainName];

  if (!contracts) {
    throw new Error(`Uniswap V3 not supported on ${chainName}`);
  }

  try {
    // 1. Get position data
    const position = await client.readContract({
      address: contracts.positionManager,
      abi: POSITION_MANAGER_ABI,
      functionName: 'positions',
      args: [BigInt(nftId)],
    });

    const [
      nonce, operator, token0, token1, fee, tickLower, tickUpper, liquidity,
      feeGrowthInside0LastX128, feeGrowthInside1LastX128, tokensOwed0, tokensOwed1,
    ] = position;

    // Check if position has liquidity
    if (liquidity === 0n) {
      throw new Error('Position has no liquidity (may be closed)');
    }

    // 2. Get token info
    const [token0Symbol, token1Symbol, token0Decimals, token1Decimals] = await Promise.all([
      client.readContract({ address: token0, abi: ERC20_ABI, functionName: 'symbol' }),
      client.readContract({ address: token1, abi: ERC20_ABI, functionName: 'symbol' }),
      client.readContract({ address: token0, abi: ERC20_ABI, functionName: 'decimals' }),
      client.readContract({ address: token1, abi: ERC20_ABI, functionName: 'decimals' }),
    ]);

    // 3. Get pool address and current price
    const poolAddress = await client.readContract({
      address: contracts.factory,
      abi: FACTORY_ABI,
      functionName: 'getPool',
      args: [token0, token1, fee],
    });

    if (poolAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Pool not found');
    }

    const slot0 = await client.readContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'slot0',
    });

    const [sqrtPriceX96, currentTick] = slot0;

    // 4. Calculate token amounts
    const { amount0, amount1 } = getTokenAmounts(
      liquidity,
      sqrtPriceX96,
      Number(tickLower),
      Number(tickUpper),
      Number(currentTick),
      Number(token0Decimals),
      Number(token1Decimals)
    );

    // Add unclaimed fees
    const unclaimed0 = Number(formatUnits(tokensOwed0, Number(token0Decimals)));
    const unclaimed1 = Number(formatUnits(tokensOwed1, Number(token1Decimals)));

    const totalAmount0 = amount0 + unclaimed0;
    const totalAmount1 = amount1 + unclaimed1;

    // 5. Fetch token prices
    const prices = await fetchTokenPrices([token0Symbol, token1Symbol]);
    const price0 = prices[token0Symbol] || 0;
    const price1 = prices[token1Symbol] || 0;

    // 6. Calculate USD values
    const value0 = totalAmount0 * price0;
    const value1 = totalAmount1 * price1;
    const totalValueUSD = value0 + value1;

    // Determine if in range
    const inRange = Number(currentTick) >= Number(tickLower) && Number(currentTick) < Number(tickUpper);

    return {
      nftId: nftId.toString(),
      token0: {
        address: token0,
        symbol: token0Symbol,
        decimals: Number(token0Decimals),
        amount: totalAmount0,
        price: price0,
        valueUSD: value0,
      },
      token1: {
        address: token1,
        symbol: token1Symbol,
        decimals: Number(token1Decimals),
        amount: totalAmount1,
        price: price1,
        valueUSD: value1,
      },
      fee: Number(fee) / 10000,
      tickLower: Number(tickLower),
      tickUpper: Number(tickUpper),
      currentTick: Number(currentTick),
      liquidity: liquidity.toString(),
      inRange,
      unclaimed: {
        token0: unclaimed0,
        token1: unclaimed1,
      },
      totalValueUSD,
      chain: chainName,
      protocol: 'uniswap-v3',
    };
  } catch (error) {
    console.error('Error fetching Uniswap V3 position:', error);
    throw error;
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
      totalCollateralBase, totalDebtBase, availableBorrowsBase,
      currentLiquidationThreshold, ltv, healthFactor,
    ] = data;

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

// Fetch all Uniswap V3 positions for a wallet address
export async function fetchAllUniswapV3Positions(chainName, walletAddress, onProgress) {
  const client = getPublicClient(chainName);
  const contracts = CONTRACTS[chainName];

  if (!contracts) {
    throw new Error(`Uniswap V3 not supported on ${chainName}`);
  }

  try {
    // Get number of NFTs owned by wallet
    const balance = await client.readContract({
      address: contracts.positionManager,
      abi: POSITION_MANAGER_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    const numPositions = Number(balance);

    if (numPositions === 0) {
      return [];
    }

    // Get all NFT IDs
    const tokenIdPromises = [];
    for (let i = 0; i < numPositions; i++) {
      tokenIdPromises.push(
        client.readContract({
          address: contracts.positionManager,
          abi: POSITION_MANAGER_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [walletAddress, BigInt(i)],
        })
      );
    }

    const tokenIds = await Promise.all(tokenIdPromises);

    // Fetch position data for each NFT
    const positions = [];
    for (let i = 0; i < tokenIds.length; i++) {
      const nftId = tokenIds[i].toString();

      if (onProgress) {
        onProgress({ current: i + 1, total: tokenIds.length, nftId });
      }

      try {
        const position = await fetchUniswapV3Position(chainName, nftId);

        // Only include positions with liquidity
        if (position.liquidity !== '0') {
          positions.push(position);
        }
      } catch (error) {
        console.warn(`Failed to fetch position ${nftId}:`, error.message);
        // Continue with other positions
      }
    }

    return positions;
  } catch (error) {
    console.error('Error fetching all Uniswap V3 positions:', error);
    throw error;
  }
}

// Convert blockchain position to app position format
export function convertUniswapPositionToAppFormat(blockchainPosition) {
  const { token0, token1, fee, totalValueUSD, nftId, chain } = blockchainPosition;

  return {
    name: `${token0.symbol}/${token1.symbol} ${fee}%`,
    protocol: 'uniswap-v3',
    chain: chain,
    type: 'liquidity',
    exposure: `${token0.symbol}/${token1.symbol}`,
    value: totalValueUSD,
    debt: 0,
    apr: 0, // Would need to calculate from fees/historical data
    monthlyFees: 0, // Would need to calculate from fees
    nftId: nftId,
    token0: token0.symbol,
    token1: token1.symbol,
  };
}
