// Parse DeFi links to extract position data

// Uniswap URL patterns:
// https://app.uniswap.org/pools/123456?chain=arbitrum
// https://app.uniswap.org/pool/123456?chain=arbitrum
// https://app.uniswap.org/#/pool/123456 (old format)

export function parseUniswapUrl(url) {
  try {
    const parsed = new URL(url);

    // Check if it's a Uniswap URL
    if (!parsed.hostname.includes('uniswap.org')) {
      return null;
    }

    // Extract NFT ID from path
    const pathMatch = parsed.pathname.match(/\/pools?\/(\d+)/);
    if (!pathMatch) {
      // Try hash-based routing (old format)
      const hashMatch = parsed.hash.match(/\/pools?\/(\d+)/);
      if (!hashMatch) return null;
      pathMatch[1] = hashMatch[1];
    }

    const nftId = pathMatch?.[1];
    if (!nftId) return null;

    // Extract chain from query params
    let chain = parsed.searchParams.get('chain') || 'ethereum';

    // Normalize chain names
    const chainMap = {
      'arbitrum': 'arbitrum',
      'arbitrum_one': 'arbitrum',
      'optimism': 'optimism',
      'base': 'base',
      'polygon': 'polygon',
      'mainnet': 'ethereum',
      'ethereum': 'ethereum',
      'zksync': 'zksync',
    };

    chain = chainMap[chain.toLowerCase()] || chain.toLowerCase();

    return {
      type: 'uniswap',
      nftId,
      chain,
      protocol: 'uniswap-v3', // Could be v4, but v3 is more common
    };
  } catch {
    return null;
  }
}

// Block explorer URL patterns:
// https://arbiscan.io/address/0x...
// https://arbiscan.io/token/0x...?a=0x...
// https://etherscan.io/address/0x...
// https://optimistic.etherscan.io/address/0x...
// https://basescan.org/address/0x...

export function parseBlockExplorerUrl(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Determine chain from hostname
    let chain = null;
    if (hostname.includes('arbiscan')) chain = 'arbitrum';
    else if (hostname.includes('optimistic.etherscan')) chain = 'optimism';
    else if (hostname.includes('basescan')) chain = 'base';
    else if (hostname.includes('polygonscan')) chain = 'polygon';
    else if (hostname.includes('etherscan.io')) chain = 'ethereum';
    else if (hostname.includes('lineascan')) chain = 'linea';
    else if (hostname.includes('explorer.zksync')) chain = 'zksync';

    if (!chain) return null;

    // Extract address from path
    const addressMatch = parsed.pathname.match(/\/(address|token)\/?(0x[a-fA-F0-9]{40})/i);
    const address = addressMatch?.[2];

    // Check for position/token ID in query params
    const tokenId = parsed.searchParams.get('a') || parsed.hash.match(/#(\d+)/)?.[1];

    return {
      type: 'explorer',
      chain,
      address,
      tokenId,
    };
  } catch {
    return null;
  }
}

// Main parser - tries all formats
export function parseDefiLink(url) {
  if (!url || typeof url !== 'string') return null;

  url = url.trim();
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }

  // Try Uniswap first
  const uniswap = parseUniswapUrl(url);
  if (uniswap) return uniswap;

  // Try block explorers
  const explorer = parseBlockExplorerUrl(url);
  if (explorer) return explorer;

  return null;
}

// Validate and clean URL input
export function isValidDefiLink(url) {
  return parseDefiLink(url) !== null;
}
