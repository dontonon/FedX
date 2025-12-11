import { useState } from 'react';
import { Info, X, Target, Brain, Zap, TrendingUp } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-bg-secondary border border-border-primary rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary sticky top-0 bg-bg-secondary z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-white text-lg">FX</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">About FedX</h2>
              <p className="text-text-tertiary text-sm">DeFi Intelligence Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Philosophy */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent-purple" />
              The Philosophy
            </h3>
            <div className="bg-bg-tertiary/50 rounded-lg p-4 space-y-3 text-text-secondary text-sm">
              <p>
                DeFi curation exists on a spectrum: <span className="text-accent-yellow">purely algorithmic</span> (hard-coded
                rate curves, fixed rebalancing rules) or <span className="text-accent-blue">purely human</span> (risk committees,
                active managers). Emerging <span className="text-accent-purple">agentic curators</span> represent a third
                regime—AI agents autonomously managing vaults and risk policy.
              </p>
              <p>
                <span className="text-accent-green font-medium">FedX represents a fourth approach:</span> human-coordinated,
                AI-augmented portfolio management. You make the strategic decisions. The system amplifies your capacity
                to track, analyze, and execute.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-bg-secondary rounded-lg p-3">
                  <p className="text-text-tertiary text-xs uppercase mb-1">You Decide</p>
                  <p className="text-text-primary text-sm">LP ranges, exposure, risk tolerance</p>
                </div>
                <div className="bg-bg-secondary rounded-lg p-3">
                  <p className="text-text-tertiary text-xs uppercase mb-1">System Provides</p>
                  <p className="text-text-primary text-sm">Visibility, tracking, execution tools</p>
                </div>
              </div>
            </div>
          </section>

          {/* The Goal */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-green" />
              The Goal
            </h3>
            <div className="bg-gradient-to-r from-accent-green/10 to-transparent rounded-lg p-4 border border-accent-green/20">
              <p className="text-2xl font-mono font-bold text-accent-green mb-1">$635/month</p>
              <p className="text-text-secondary text-sm">
                Passive DeFi income target for financial independence. This is the north star metric—every
                position, every decision, moves toward this goal.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-yellow" />
              How It Works
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-blue font-mono text-sm">1</span>
                </div>
                <div>
                  <p className="text-text-primary font-medium">Track Positions</p>
                  <p className="text-text-tertiary text-sm">Add LP positions, collateral, stakes. Paste links or enter manually.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-blue font-mono text-sm">2</span>
                </div>
                <div>
                  <p className="text-text-primary font-medium">Monitor Health</p>
                  <p className="text-text-tertiary text-sm">Health factor alerts, goal coverage, exposure breakdown.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-blue font-mono text-sm">3</span>
                </div>
                <div>
                  <p className="text-text-primary font-medium">Monthly Snapshots</p>
                  <p className="text-text-tertiary text-sm">Track progress over time. See what's working, adjust what isn't.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-green font-mono text-sm">4</span>
                </div>
                <div>
                  <p className="text-text-primary font-medium">Reach FI</p>
                  <p className="text-text-tertiary text-sm">$635/month in sustainable DeFi yield = financial independence.</p>
                </div>
              </div>
            </div>
          </section>

          {/* The Stack */}
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-blue" />
              Supported Protocols
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Uniswap V3/V4', 'Aave V3', 'Morpho', 'Curve', 'Velodrome', 'Aerodrome', 'Camelot', 'GMX'].map(protocol => (
                <span key={protocol} className="px-3 py-1 bg-bg-tertiary rounded-full text-text-secondary text-sm">
                  {protocol}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Arbitrum', 'Optimism', 'Base', 'Ethereum', 'Polygon', 'zkSync'].map(chain => (
                <span key={chain} className="px-3 py-1 bg-bg-tertiary rounded-full text-text-tertiary text-xs">
                  {chain}
                </span>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="pt-4 border-t border-border-primary text-center">
            <p className="text-text-muted text-xs">
              Built for personal use. Human decisions, AI-augmented execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small info button component to trigger the modal
export function AboutButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
      title="About FedX"
    >
      <Info className="w-5 h-5 text-text-tertiary hover:text-text-secondary" />
    </button>
  );
}
