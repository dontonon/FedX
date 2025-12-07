// DeFiLlama Price Fetching

import { DEFILLAMA_API, TOKEN_IDS } from './constants';

// Cache for prices (5 minute TTL)
const priceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get cached price or null if expired
function getCachedPrice(tokenId) {
  const cached = priceCache.get(tokenId);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL) {
    priceCache.delete(tokenId);
    return null;
  }

  return cached.price;
}

// Set price in cache
function setCachedPrice(tokenId, price) {
  priceCache.set(tokenId, {
    price,
    timestamp: Date.now(),
  });
}

// Fetch current prices from DeFiLlama
export async function fetchPrices(tokenIds) {
  if (!tokenIds || tokenIds.length === 0) {
    return {};
  }

  // Check cache first
  const uncachedIds = [];
  const prices = {};

  tokenIds.forEach(id => {
    const cached = getCachedPrice(id);
    if (cached !== null) {
      prices[id] = cached;
    } else {
      uncachedIds.push(id);
    }
  });

  // If all cached, return early
  if (uncachedIds.length === 0) {
    return prices;
  }

  try {
    const coins = uncachedIds.join(',');
    const response = await fetch(`${DEFILLAMA_API}/prices/current/${coins}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.status}`);
    }

    const data = await response.json();

    // Process and cache results
    if (data.coins) {
      Object.entries(data.coins).forEach(([id, info]) => {
        const price = info.price || 0;
        prices[id] = price;
        setCachedPrice(id, price);
      });
    }

    return prices;
  } catch (error) {
    console.error('Error fetching prices from DeFiLlama:', error);
    return prices; // Return whatever we have from cache
  }
}

// Fetch single token price
export async function fetchPrice(tokenId) {
  const prices = await fetchPrices([tokenId]);
  return prices[tokenId] || null;
}

// Fetch common token prices
export async function fetchCommonPrices() {
  const tokenIds = Object.values(TOKEN_IDS);
  return fetchPrices(tokenIds);
}

// Get token price by symbol (convenience function)
export async function getPriceBySymbol(symbol) {
  const tokenId = TOKEN_IDS[symbol.toUpperCase()];
  if (!tokenId) {
    console.warn(`Unknown token symbol: ${symbol}`);
    return null;
  }
  return fetchPrice(tokenId);
}

// Fetch historical prices (for charts)
export async function fetchHistoricalPrices(tokenId, period = '1W') {
  const periodSeconds = {
    '1D': 86400,
    '1W': 604800,
    '1M': 2592000,
    '3M': 7776000,
    '1Y': 31536000,
  };

  const seconds = periodSeconds[period] || periodSeconds['1W'];
  const timestamp = Math.floor(Date.now() / 1000) - seconds;

  try {
    const response = await fetch(
      `${DEFILLAMA_API}/chart/${tokenId}?start=${timestamp}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch historical prices: ${response.status}`);
    }

    const data = await response.json();
    return data.coins?.[tokenId]?.prices || [];
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return [];
  }
}

// Calculate position value with live price
export async function calculateLiveValue(token0Amount, token1Amount, token0Id, token1Id) {
  const prices = await fetchPrices([token0Id, token1Id].filter(Boolean));

  let value = 0;
  if (token0Id && prices[token0Id]) {
    value += token0Amount * prices[token0Id];
  }
  if (token1Id && prices[token1Id]) {
    value += token1Amount * prices[token1Id];
  }

  return value;
}

// Clear price cache (useful for forcing refresh)
export function clearPriceCache() {
  priceCache.clear();
}

// Get all cached prices (for debugging)
export function getCachedPrices() {
  const cached = {};
  priceCache.forEach((value, key) => {
    cached[key] = {
      price: value.price,
      age: Math.floor((Date.now() - value.timestamp) / 1000) + 's',
    };
  });
  return cached;
}
