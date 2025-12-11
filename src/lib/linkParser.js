// Parse DeFi links to extract position data

// Uniswap URL patterns:
// NEW: https://app.uniswap.org/positions/v3/arbitrum/5127705
// https://app.uniswap.org/pools/123456?chain=arbitrum
// https://app.uniswap.org/pool/123456?chain=arbitrum
// https://app.uniswap.org/#/pool/123456 (old format)

const chainMap = {
  'arbitrum': 'arbitrum',
  'arbitrum_one': 'arbitrum',
  'optimism': 'optimism',
  'base': 'base',
  'polygon': 'polygon',
  'mainnet': 'ethereum',
  'ethereum': 'ethereum',
  'zksync': 'zksync',
  'linea': 'linea',
};

export function parseUniswapUrl(url) {
  try {
    const parsed = new URL(url);

    // Check if it's a Uniswap URL
    if (!parsed.hostname.includes('uniswap.org')) {
      return null;
    }

    // NEW FORMAT: /positions/v3/{chain}/{nftId}
    // Example: https://app.uniswap.org/positions/v3/arbitrum/5127705
    const newFormatMatch = parsed.pathname.match(/\/positions\/v([34])\/([^/]+)\/(\d+)/);
    if (newFormatMatch) {
      const version = newFormatMatch[1];
      const chainRaw = newFormatMatch[2];
      const nftId = newFormatMatch[3];
      const chain = chainMap[chainRaw.toLowerCase()] || chainRaw.toLowerCase();

      return {
        type: 'uniswap',
        nftId,
        chain,
        protocol: `uniswap-v${version}`,
        version: parseInt(version),
      };
    }

    // OLD FORMAT: /pools/{nftId}?chain={chain}
    const pathMatch = parsed.pathname.match(/\/pools?\/(\d+)/);
    if (pathMatch) {
      const nftId = pathMatch[1];
      let chain = parsed.searchParams.get('chain') || 'ethereum';
      chain = chainMap[chain.toLowerCase()] || chain.toLowerCase();

      return {
        type: 'uniswap',
        nftId,
        chain,
        protocol: 'uniswap-v3',
        version: 3,
      };
    }

    // HASH FORMAT (legacy): /#/pool/{nftId}
    const hashMatch = parsed.hash.match(/\/pools?\/(\d+)/);
    if (hashMatch) {
      const nftId = hashMatch[1];
      let chain = parsed.searchParams.get('chain') || 'ethereum';
      chain = chainMap[chain.toLowerCase()] || chain.toLowerCase();

      return {
        type: 'uniswap',
        nftId,
        chain,
        protocol: 'uniswap-v3',
        version: 3,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Block explorer URL patterns:
// https://arbiscan.io/address/0x...
// https://arbiscan.io/token/0x...?a=0x...
// https://arbiscan.io/nft/0xc36442b4a4522e871399cd717abdd847ab11fe88/5127705 (NFT view)
// https://etherscan.io/address/0x...
// https://optimistic.etherscan.io/address/0x...
// https://basescan.org/address/0x...

// Known Uniswap V3 Position Manager addresses
const POSITION_MANAGERS = {
  '0xc36442b4a4522e871399cd717abdd847ab11fe88': 'uniswap-v3', // Ethereum, Arbitrum, Optimism, Polygon
  '0x03a520b32c04bf3beef7beb72e919cf822ed34f1': 'uniswap-v3', // Base
};

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

    // NFT VIEW: /nft/{contractAddress}/{tokenId}
    // Example: https://arbiscan.io/nft/0xc36442b4a4522e871399cd717abdd847ab11fe88/5127705
    const nftMatch = parsed.pathname.match(/\/nft\/(0x[a-fA-F0-9]{40})\/(\d+)/i);
    if (nftMatch) {
      const contractAddress = nftMatch[1].toLowerCase();
      const tokenId = nftMatch[2];
      const protocol = POSITION_MANAGERS[contractAddress];

      if (protocol) {
        return {
          type: 'explorer-nft',
          chain,
          nftId: tokenId,
          contractAddress,
          protocol,
        };
      }
    }

    // Address view
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

// Check if we can auto-fetch from this link
export function canAutoFetch(parsed) {
  if (!parsed) return false;

  // Can fetch if we have an NFT ID and it's a supported protocol
  if (parsed.type === 'uniswap' && parsed.nftId) return true;
  if (parsed.type === 'explorer-nft' && parsed.nftId && parsed.protocol) return true;

  return false;
}
