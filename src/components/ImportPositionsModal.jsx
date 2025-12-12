import { useState } from 'react';
import { useAccount } from 'wagmi';
import { X, Loader2, CheckCircle, Search, ChevronRight } from 'lucide-react';
import { fetchAllUniswapV3Positions, convertUniswapPositionToAppFormat } from '../lib/blockchain';
import { formatCurrency } from '../lib/utils';

export default function ImportPositionsModal({ isOpen, onClose, onImportPositions }) {
  const { address: connectedAddress, isConnected } = useAccount();
  const [step, setStep] = useState(1); // 1: setup, 2: select positions, 3: done
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChains, setSelectedChains] = useState(['arbitrum', 'optimism', 'base']);
  const [fetching, setFetching] = useState(false);
  const [progress, setProgress] = useState(null);
  const [foundPositions, setFoundPositions] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState(new Set());
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

  const togglePosition = (index) => {
    setSelectedPositions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPositions.size === foundPositions.length) {
      setSelectedPositions(new Set());
    } else {
      setSelectedPositions(new Set(foundPositions.map((_, i) => i)));
    }
  };

  const handleSearch = async () => {
    const targetAddress = walletAddress || connectedAddress;

    if (!targetAddress) {
      alert('Please connect your wallet or enter a wallet address');
      return;
    }

    if (selectedChains.length === 0) {
      alert('Please select at least one chain');
      return;
    }

    setFetching(true);
    setProgress({ current: 0, total: selectedChains.length });
    setFoundPositions([]);

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
          targetAddress,
          (posProgress) => {
            setProgress(prev => ({
              ...prev,
              positionProgress: posProgress,
            }));
          }
        );

        const converted = positions.map((p) => ({
          ...convertUniswapPositionToAppFormat(p),
          _rawData: p, // Keep raw data for debugging
        }));

        allPositions.push(...converted);
      } catch (error) {
        console.error(`Error fetching from ${chainId}:`, error);
        errors.push({ chain: chainId, error: error.message });
      }
    }

    setFoundPositions(allPositions);
    setSelectedPositions(new Set(allPositions.map((_, i) => i))); // Select all by default
    setFetching(false);

    if (allPositions.length > 0) {
      setStep(2);
    } else {
      alert(`No Uniswap V3 positions found.\n\nErrors: ${errors.length > 0 ? errors.map(e => `${e.chain}: ${e.error}`).join('\n') : 'None'}`);
    }
  };

  const handleImport = () => {
    const positionsToImport = foundPositions.filter((_, i) => selectedPositions.has(i));

    if (positionsToImport.length === 0) {
      alert('Please select at least one position to import');
      return;
    }

    onImportPositions(positionsToImport);
    setResults({
      imported: positionsToImport.length,
      total: foundPositions.length,
    });
    setStep(3);
  };

  const handleClose = () => {
    if (!fetching) {
      setStep(1);
      setWalletAddress('');
      setFoundPositions([]);
      setSelectedPositions(new Set());
      setResults(null);
      setProgress(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-elevated rounded-xl border border-border-primary shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Import Uniswap V3 Positions</h2>
            <p className="text-xs text-text-tertiary mt-1">
              Step {step} of 3: {step === 1 ? 'Setup' : step === 2 ? 'Select Positions' : 'Complete'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={fetching}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Step 1: Setup */}
          {step === 1 && (
            <>
              {/* Wallet Address Input */}
              <div className="mb-4">
                <label className="block text-text-tertiary text-sm mb-2">
                  Wallet Address {isConnected && '(optional - leave empty to use connected wallet)'}
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={connectedAddress || '0x...'}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent-blue"
                />
                {isConnected && !walletAddress && (
                  <p className="text-xs text-text-tertiary mt-1">
                    Using connected wallet: {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
                  </p>
                )}
              </div>

              {/* Chain Selection */}
              <div className="mb-4">
                <label className="block text-text-tertiary text-sm mb-2">
                  Select Chains to Search
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
                        disabled={fetching}
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
              {fetching && progress && (
                <div className="mb-4 p-3 bg-bg-secondary border border-border-primary rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
                    <span className="text-text-secondary text-sm">
                      Searching {progress.chainName}... ({progress.current}/{progress.total})
                    </span>
                  </div>
                  {progress.positionProgress && (
                    <div className="text-text-tertiary text-xs">
                      Fetching position {progress.positionProgress.current}/{progress.positionProgress.total}
                    </div>
                  )}
                </div>
              )}

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={fetching || selectedChains.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search for Positions
                  </>
                )}
              </button>

              {/* Info Note */}
              <div className="mt-4 p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                <p className="text-accent-blue text-xs">
                  <strong>Note:</strong> Currently supports Uniswap V3 only. V4 and other protocols coming soon.
                </p>
              </div>
            </>
          )}

          {/* Step 2: Select Positions */}
          {step === 2 && (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-text-secondary text-sm">
                    Found <strong>{foundPositions.length}</strong> position{foundPositions.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={toggleSelectAll}
                    className="text-accent-blue text-sm hover:underline"
                  >
                    {selectedPositions.size === foundPositions.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {foundPositions.map((position, index) => (
                    <label
                      key={index}
                      className="flex items-start gap-3 px-3 py-3 bg-bg-secondary border border-border-primary rounded-lg cursor-pointer hover:bg-bg-tertiary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPositions.has(index)}
                        onChange={() => togglePosition(index)}
                        className="w-4 h-4 mt-1 rounded border-border-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-text-primary">{position.name}</span>
                          <span className="text-xs text-text-tertiary capitalize">{position.chain}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-text-secondary">
                            Value: <span className="font-mono text-text-primary">{formatCurrency(position.value)}</span>
                          </span>
                          <span className="text-text-secondary">
                            Exposure: <span className="text-text-primary">{position.exposure}</span>
                          </span>
                          {position.nftId && (
                            <span className="text-text-tertiary">
                              NFT #{position.nftId}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg font-medium hover:bg-bg-elevated transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedPositions.size === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {selectedPositions.size} Position{selectedPositions.size !== 1 ? 's' : ''}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Step 3: Done */}
          {step === 3 && results && (
            <div className="py-4">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-accent-green" />
              </div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-text-primary mb-1">
                  Import Complete!
                </h3>
                <p className="text-text-secondary">
                  Successfully imported <strong>{results.imported}</strong> out of {results.total} position{results.total !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
