import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Link, AlertCircle, Check, Clipboard, Zap, Edit3 } from 'lucide-react';
import { CHAINS, PROTOCOLS, POSITION_TYPES, EXPOSURE_TYPES } from '../lib/constants';
import { fetchUniswapV3Position } from '../lib/blockchain';
import { parseDefiLink, canAutoFetch } from '../lib/linkParser';

export default function AddPositionModal({ isOpen, onClose, onSave, editPosition }) {
  const [formData, setFormData] = useState(getInitialFormData());
  const [linkInput, setLinkInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedData, setFetchedData] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fetchedRef = useRef(false);

  function getInitialFormData() {
    return {
      name: '',
      protocol: 'uniswap-v3',
      chain: 'arbitrum',
      type: 'liquidity',
      exposure: '',
      value: '',
      debt: '',
      apr: '',
      monthlyFees: '',
      nftId: '',
      token0: '',
      token1: '',
    };
  }

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editPosition) {
        setFormData({
          name: editPosition.name || '',
          protocol: editPosition.protocol || 'uniswap-v3',
          chain: editPosition.chain || 'arbitrum',
          type: editPosition.type || 'liquidity',
          exposure: editPosition.exposure || '',
          value: editPosition.value?.toString() || '',
          debt: editPosition.debt?.toString() || '',
          apr: editPosition.apr?.toString() || '',
          monthlyFees: editPosition.monthlyFees?.toString() || '',
          nftId: editPosition.nftId || '',
          token0: editPosition.token0 || '',
          token1: editPosition.token1 || '',
        });
        setShowAdvanced(true);
      } else {
        setFormData(getInitialFormData());
        setShowAdvanced(false);
      }
      setLinkInput('');
      setError(null);
      setFetchedData(null);
      fetchedRef.current = false;
    }
  }, [isOpen, editPosition]);

  // Auto-fetch when valid link is detected
  useEffect(() => {
    if (linkInput.length < 10 || fetchedRef.current || editPosition) return;

    const parsed = parseDefiLink(linkInput);
    if (parsed && canAutoFetch(parsed)) {
      fetchedRef.current = true;
      autoFetchPosition(parsed);
    }
  }, [linkInput, editPosition]);

  // Auto-calculate monthly fees when value or APR changes
  useEffect(() => {
    const value = parseFloat(formData.value) || 0;
    const apr = parseFloat(formData.apr) || 0;
    if (value > 0 && apr > 0 && !formData.monthlyFees) {
      const monthly = (value * (apr / 100)) / 12;
      setFormData(prev => ({ ...prev, monthlyFees: monthly.toFixed(2) }));
    }
  }, [formData.value, formData.apr]);

  const autoFetchPosition = async (parsed) => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await fetchUniswapV3Position(parsed.chain, parsed.nftId);

      // Store full fetched data for display
      setFetchedData(position);

      // Auto-populate form
      setFormData(prev => ({
        ...prev,
        name: `${position.token0.symbol}/${position.token1.symbol} ${position.fee}%`,
        token0: position.token0.symbol,
        token1: position.token1.symbol,
        protocol: position.protocol,
        chain: parsed.chain,
        exposure: `${position.token0.symbol}/${position.token1.symbol}`,
        value: position.totalValueUSD.toFixed(2),
        nftId: parsed.nftId,
        type: 'liquidity',
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch position data');
      fetchedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLinkInput(text);
      fetchedRef.current = false; // Allow re-fetch
    } catch (err) {
      setError('Could not read clipboard');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Recalculate monthly if value or APR changed
    if (field === 'value' || field === 'apr') {
      const v = field === 'value' ? parseFloat(value) : parseFloat(formData.value);
      const a = field === 'apr' ? parseFloat(value) : parseFloat(formData.apr);
      if (v > 0 && a > 0) {
        const monthly = (v * (a / 100)) / 12;
        setFormData(prev => ({ ...prev, monthlyFees: monthly.toFixed(2) }));
      }
    }

    setError(null);
  };

  const handleQuickAdd = () => {
    if (!fetchedData) return;

    const position = {
      ...formData,
      value: parseFloat(formData.value) || 0,
      debt: parseFloat(formData.debt) || 0,
      apr: parseFloat(formData.apr) || 0,
      monthlyFees: parseFloat(formData.monthlyFees) || 0,
    };

    onSave(position);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Position name is required');
      return;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError('Value must be greater than 0');
      return;
    }

    const position = {
      ...formData,
      value: parseFloat(formData.value) || 0,
      debt: parseFloat(formData.debt) || 0,
      apr: parseFloat(formData.apr) || 0,
      monthlyFees: parseFloat(formData.monthlyFees) || 0,
    };

    if (editPosition) {
      position.id = editPosition.id;
    }

    onSave(position);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-bg-secondary border border-border-primary rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary sticky top-0 bg-bg-secondary z-10">
          <h2 className="text-lg font-semibold text-text-primary">
            {editPosition ? 'Edit Position' : 'Add Position'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-tertiary rounded transition-colors">
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* QUICK ADD: Paste Link */}
          {!editPosition && !fetchedData && (
            <div className="bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 rounded-xl p-5 border border-accent-blue/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent-yellow" />
                <span className="font-semibold text-text-primary">Quick Add</span>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Paste a Uniswap position link to auto-fetch all data
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://app.uniswap.org/positions/v3/..."
                  value={linkInput}
                  onChange={(e) => {
                    setLinkInput(e.target.value);
                    fetchedRef.current = false;
                  }}
                  className="flex-1 px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-blue placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-4 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors flex items-center gap-2"
                >
                  <Clipboard className="w-4 h-4" />
                  Paste
                </button>
              </div>

              {isLoading && (
                <div className="mt-4 flex items-center gap-3 text-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin text-accent-blue" />
                  <span>Fetching position data from chain...</span>
                </div>
              )}

              <p className="text-xs text-text-muted mt-3">
                Supports: Uniswap V3/V4 links, Arbiscan NFT links
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-accent-red flex-shrink-0" />
              <span className="text-sm text-accent-red">{error}</span>
            </div>
          )}

          {/* FETCHED DATA DISPLAY */}
          {fetchedData && !editPosition && (
            <div className="bg-bg-tertiary rounded-xl border border-border-primary overflow-hidden">
              {/* Position Header */}
              <div className="p-4 border-b border-border-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">{formData.name}</h3>
                    <p className="text-sm text-text-tertiary">{formData.chain} · NFT #{formData.nftId}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    fetchedData.inRange
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-accent-yellow/20 text-accent-yellow'
                  }`}>
                    {fetchedData.inRange ? 'In Range' : 'Out of Range'}
                  </div>
                </div>
              </div>

              {/* Token Breakdown */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center">
                      <span className="text-xs font-mono text-accent-blue">{fetchedData.token0.symbol.slice(0, 2)}</span>
                    </div>
                    <span className="text-text-secondary">{fetchedData.token0.symbol}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-text-primary">{fetchedData.token0.amount.toFixed(4)}</p>
                    <p className="text-xs text-text-tertiary">${fetchedData.token0.valueUSD.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center">
                      <span className="text-xs font-mono text-accent-green">{fetchedData.token1.symbol.slice(0, 2)}</span>
                    </div>
                    <span className="text-text-secondary">{fetchedData.token1.symbol}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-text-primary">{fetchedData.token1.amount.toFixed(4)}</p>
                    <p className="text-xs text-text-tertiary">${fetchedData.token1.valueUSD.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-secondary flex justify-between items-center">
                  <span className="text-text-secondary font-medium">Total Value</span>
                  <span className="font-mono text-xl text-accent-green">${fetchedData.totalValueUSD.toFixed(2)}</span>
                </div>
              </div>

              {/* APR Input - The only thing we need manually */}
              <div className="p-4 bg-bg-elevated border-t border-border-secondary">
                <label className="block text-sm text-text-secondary mb-2">
                  APR (%) — <span className="text-text-muted">enter manually or leave at 0</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.apr}
                    onChange={(e) => handleChange('apr', e.target.value)}
                    placeholder="e.g., 25.5"
                    className="flex-1 px-4 py-3 bg-bg-primary border border-border-primary rounded-lg text-text-primary font-mono text-lg focus:outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    className="px-6 py-3 bg-accent-green text-white rounded-lg font-semibold hover:bg-accent-green/80 transition-colors"
                  >
                    Add Position
                  </button>
                </div>
                {formData.apr && parseFloat(formData.apr) > 0 && (
                  <p className="mt-2 text-sm text-text-tertiary">
                    Est. monthly: ${formData.monthlyFees}/mo
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Manual Entry Toggle (when no fetched data) */}
          {!fetchedData && !editPosition && (
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {showAdvanced ? 'Hide manual entry' : 'Or enter manually'}
            </button>
          )}

          {/* Full Form (for manual entry or editing) */}
          {(showAdvanced || editPosition) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Position Name */}
              <div>
                <label className="block text-sm text-text-secondary mb-1">Position Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., ETH/USDC 0.05%"
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
                />
              </div>

              {/* Protocol & Chain */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Protocol</label>
                  <select
                    value={formData.protocol}
                    onChange={(e) => handleChange('protocol', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
                  >
                    {PROTOCOLS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Chain</label>
                  <select
                    value={formData.chain}
                    onChange={(e) => handleChange('chain', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
                  >
                    {CHAINS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type & Exposure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
                  >
                    {POSITION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Exposure</label>
                  <input
                    type="text"
                    value={formData.exposure}
                    onChange={(e) => handleChange('exposure', e.target.value)}
                    placeholder="e.g., ETH/USDC"
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              {/* Value & Debt */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Value (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => handleChange('value', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary font-mono focus:outline-none focus:border-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Debt (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.debt}
                    onChange={(e) => handleChange('debt', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary font-mono focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              {/* APR & Monthly Fees */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">APR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.apr}
                    onChange={(e) => handleChange('apr', e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary font-mono focus:outline-none focus:border-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1">Monthly Fees (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyFees}
                    onChange={(e) => handleChange('monthlyFees', e.target.value)}
                    placeholder="Auto-calculated"
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary font-mono focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              {/* NFT ID */}
              <div>
                <label className="block text-sm text-text-secondary mb-1">NFT ID (optional)</label>
                <input
                  type="text"
                  value={formData.nftId}
                  onChange={(e) => handleChange('nftId', e.target.value)}
                  placeholder="For Uniswap V3 positions"
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary font-mono focus:outline-none focus:border-accent-blue"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg font-medium hover:bg-bg-elevated transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors"
                >
                  {editPosition ? 'Save Changes' : 'Add Position'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
