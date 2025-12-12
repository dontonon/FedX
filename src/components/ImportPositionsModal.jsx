import { useState } from 'react';
import { useAccount } from 'wagmi';
import { X, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchAllUniswapV3Positions, convertUniswapPositionToAppFormat } from '../lib/blockchain';

export default function ImportPositionsModal({ isOpen, onClose, onImportPositions }) {
  const { address, isConnected } = useAccount();
  const [selectedChains, setSelectedChains] = useState(['arbitrum']);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);

  const chains = [
    { id: 'arbitrum', name: 'Arbitrum', color: '#28A0F0' },
    { id: 'optimism', name: 'Optimism', color: '#FF0420' },
    { id: 'base', name: 'Base', color: '#0052FF' },
  ];

  const toggleChain = (chainId) => {
    setSelectedChains((prev) =>
      prev.includes(chainId)
        ? prev.filter((id) => id !== chainId)
        : [...prev, chainId]
    );
  };

  const handleImport = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (selectedChains.length === 0) {
      alert('Please select at least one chain');
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: selectedChains.length });
    setResults(null);

    const allPositions = [];
    const errors = [];

    for (let i = 0; i < selectedChains.length; i++) {
      const chainId = selectedChains[i];
      setProgress({
        current: i + 1,
        total: selectedChains.length,
        chainName: chains.find(c => c.id === chainId)?.name,
        chainId,
      });

      try {
        const positions = await fetchAllUniswapV3Positions(
          chainId,
          address,
          (posProgress) => {
            setProgress(prev => ({
              ...prev,
              positionProgress: posProgress,
            }));
          }
        );

        const converted = positions.map(convertUniswapPositionToAppFormat);
        allPositions.push(...converted);
      } catch (error) {
        console.error(`Error importing from ${chainId}:`, error);
        errors.push({ chain: chainId, error: error.message });
      }
    }

    setResults({
      imported: allPositions.length,
      errors: errors.length,
      positions: allPositions,
    });

    if (allPositions.length > 0) {
      onImportPositions(allPositions);
    }

    setImporting(false);
  };

  const handleClose = () => {
    if (!importing) {
      setResults(null);
      setProgress(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-elevated rounded-xl border border-border-primary shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <h2 className="text-lg font-semibold text-text-primary">Import Positions</h2>
          <button
            onClick={handleClose}
            disabled={importing}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-accent-yellow mx-auto mb-3" />
              <p className="text-text-secondary mb-2">Wallet not connected</p>
              <p className="text-text-tertiary text-sm">
                Please connect your wallet using the button in the header
              </p>
            </div>
          ) : results ? (
            <div className="py-4">
              <div className="flex items-center justify-center mb-4">
                {results.imported > 0 ? (
                  <CheckCircle className="w-12 h-12 text-accent-green" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-accent-yellow" />
                )}
              </div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-text-primary mb-1">
                  Import Complete
                </h3>
                <p className="text-text-secondary">
                  Found {results.imported} position{results.imported !== 1 ? 's' : ''}
                </p>
                {results.errors > 0 && (
                  <p className="text-accent-yellow text-sm mt-1">
                    {results.errors} chain{results.errors !== 1 ? 's' : ''} failed to load
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Wallet Info */}
              <div className="mb-4">
                <label className="block text-text-tertiary text-sm mb-2">
                  Connected Wallet
                </label>
                <div className="px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg font-mono text-sm text-text-primary">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>

              {/* Chain Selection */}
              <div className="mb-4">
                <label className="block text-text-tertiary text-sm mb-2">
                  Select Chains to Import
                </label>
                <div className="space-y-2">
                  {chains.map((chain) => (
                    <label
                      key={chain.id}
                      className="flex items-center gap-3 px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg cursor-pointer hover:bg-bg-tertiary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedChains.includes(chain.id)}
                        onChange={() => toggleChain(chain.id)}
                        disabled={importing}
                        className="w-4 h-4 rounded border-border-primary"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: chain.color }}
                        />
                        <span className="text-text-primary text-sm">{chain.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {importing && progress && (
                <div className="mb-4 p-3 bg-bg-secondary border border-border-primary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
                    <span className="text-text-secondary text-sm">
                      Importing from {progress.chainName}... ({progress.current}/{progress.total})
                    </span>
                  </div>
                  {progress.positionProgress && (
                    <div className="text-text-tertiary text-xs">
                      Fetching position {progress.positionProgress.current}/{progress.positionProgress.total}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  disabled={importing}
                  className="flex-1 px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg font-medium hover:bg-bg-elevated transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || selectedChains.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Import Positions
                    </>
                  )}
                </button>
              </div>

              {/* Info Note */}
              <div className="mt-4 p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                <p className="text-accent-blue text-xs">
                  This will fetch all Uniswap V3 liquidity positions from your wallet on the selected chains.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
