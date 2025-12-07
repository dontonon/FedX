# FedX - DeFi Intelligence Dashboard

A personal DeFi portfolio intelligence dashboard for tracking LP positions, health factors, and progress toward financial independence.

## Features

- **Goal Tracking**: Monitor progress toward monthly passive income target ($635/month default)
- **Health Factor Monitoring**: Color-coded alerts for lending positions (Aave, Morpho)
- **Portfolio Overview**: Net worth, monthly fees, average APR at a glance
- **Position Management**: Add, edit, delete, and duplicate positions
- **Allocation Charts**: Visualize exposure by chain and asset type
- **Snapshot System**: Save portfolio state for historical tracking
- **On-chain Fetching**: Fetch Uniswap V3 position data by NFT ID
- **Local Storage**: All data persists in browser localStorage
- **Export/Import**: Backup and restore your portfolio data

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **State**: Zustand with localStorage persistence
- **Blockchain**: Viem for on-chain reads
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── AddPositionModal.jsx
│   ├── AllocationChart.jsx
│   ├── GoalProgress.jsx
│   ├── Header.jsx
│   ├── HealthFactorCard.jsx
│   ├── MetricCard.jsx
│   ├── PositionTable.jsx
│   └── SnapshotTimeline.jsx
├── pages/
│   └── Dashboard.jsx    # Main dashboard page
├── stores/
│   └── portfolio.js     # Zustand store
├── lib/
│   ├── blockchain.js    # Viem utilities
│   ├── constants.js     # Design system constants
│   ├── prices.js        # DeFiLlama price fetching
│   ├── storage.js       # localStorage utilities
│   └── utils.js         # Helper functions
├── App.jsx
├── main.jsx
└── index.css            # Tailwind config + custom styles
```

## Supported Chains

Arbitrum, Optimism, Base, zkSync, Polygon, Ethereum, Linea, Manta, Sonic, Cosmos

## Supported Position Types

- Liquidity (LP positions)
- Collateral (Aave, Morpho deposits)
- Stake (single-sided staking)
- Vault (yield vaults)
- Farming (yield farming)
- Trading (spot holdings)

## Exposure Categories

ETH/USDC, ALT/USDC, ETH/BTC, ETH/ALT, Stable, ETH, BTC, ALT, Other

## Design System

Dark theme with terminal-meets-finance aesthetic:
- Background: Deep dark (#0a0b0d)
- Accent Green: #00d672 (positive/safe)
- Accent Red: #ff4757 (negative/danger)
- Accent Yellow: #ffc048 (warning)
- Accent Blue: #4da6ff (info/links)
- Fonts: Space Mono (display), Inter (body), JetBrains Mono (numbers)

## Future Roadmap

- [ ] Auto-fetch all Uniswap positions by wallet scan
- [ ] Aave/Morpho position auto-detection
- [ ] Impermanent Loss calculation
- [ ] Performance vs HODL comparison
- [ ] Supabase backend for multi-device sync
- [ ] Mobile responsive improvements
- [ ] Export to CSV/PDF

## License

MIT
