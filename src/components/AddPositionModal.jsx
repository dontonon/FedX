import { useState, useEffect } from 'react';
import { X, Loader2, Link, AlertCircle, Check, Clipboard } from 'lucide-react';
import { CHAINS, PROTOCOLS, POSITION_TYPES, EXPOSURE_TYPES } from '../lib/constants';
import { fetchUniswapV3Position } from '../lib/blockchain';
import { parseDefiLink } from '../lib/linkParser';

export default function AddPositionModal({ isOpen, onClose, onSave, editPosition }) {
  const [formData, setFormData] = useState({
    name: '',
    protocol: 'uniswap-v3',
    chain: 'arbitrum',
    type: 'liquidity',
    exposure: 'ETH/USDC',
    value: '',
    debt: '',
    apr: '',
    monthlyFees: '',
    nftId: '',
    token0: '',
    token1: '',
  });

  const [linkInput, setLinkInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [parsedLink, setParsedLink] = useState(null);

  // Populate form when editing
  useEffect(() => {
    if (editPosition) {
      setFormData({
        name: editPosition.name || '',
        protocol: editPosition.protocol || 'uniswap-v3',
        chain: editPosition.chain || 'arbitrum',
        type: editPosition.type || 'liquidity',
        exposure: editPosition.exposure || 'ETH/USDC',
        value: editPosition.value?.toString() || '',
        debt: editPosition.debt?.toString() || '',
        apr: editPosition.apr?.toString() || '',
        monthlyFees: editPosition.monthlyFees?.toString() || '',
        nftId: editPosition.nftId || '',
        token0: editPosition.token0 || '',
        token1: editPosition.token1 || '',
      });
      setLinkInput('');
    } else {
      setFormData({
        name: '',
        protocol: 'uniswap-v3',
        chain: 'arbitrum',
        type: 'liquidity',
        exposure: 'ETH/USDC',
        value: '',
        debt: '',
        apr: '',
        monthlyFees: '',
        nftId: '',
        token0: '',
        token1: '',
      });
      setLinkInput('');
    }
    setError(null);
    setSuccess(null);
    setParsedLink(null);
  }, [editPosition, isOpen]);

  // Parse link as user types
  useEffect(() => {
    if (linkInput.length > 10) {
      const parsed = parseDefiLink(linkInput);
      setParsedLink(parsed);
      if (parsed) {
        setFormData(prev => ({
          ...prev,
          chain: parsed.chain || prev.chain,
          nftId: parsed.nftId || parsed.tokenId || prev.nftId,
          protocol: parsed.protocol || prev.protocol,
        }));
      }
    } else {
      setParsedLink(null);
    }
  }, [linkInput]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLinkInput(text);
    } catch (err) {
      setError('Could not read clipboard');
    }
  };

  const handleFetchFromChain = async () => {
    if (!formData.nftId || !formData.chain) {
      setError('Need NFT ID and chain to fetch');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const position = await fetchUniswapV3Position(formData.chain, formData.nftId);

      // Auto-populate all available data including USD value
      setFormData(prev => ({
        ...prev,
        name: `${position.token0.symbol}/${position.token1.symbol} ${position.fee}%`,
        token0: position.token0.symbol,
        token1: position.token1.symbol,
        protocol: position.protocol,
        exposure: `${position.token0.symbol}/${position.token1.symbol}`,
        value: position.totalValueUSD.toFixed(2),
      }));

      // Build detailed success message
      const rangeStatus = position.inRange ? '✓ In Range' : '⚠ Out of Range';
      const t0 = `${position.token0.amount.toFixed(4)} ${position.token0.symbol} ($${position.token0.valueUSD.toFixed(2)})`;
      const t1 = `${position.token1.amount.toFixed(4)} ${position.token1.symbol} ($${position.token1.valueUSD.toFixed(2)})`;

      setSuccess(`Fetched! ${rangeStatus}\n${t0}\n${t1}\nTotal: $${position.totalValueUSD.toFixed(2)} — Add APR manually`);
    } catch (err) {
      setError(err.message || 'Failed to fetch position');
    } finally {
      setIsLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Paste Link Section */}
          {!editPosition && (
            <div className="bg-bg-tertiary rounded-lg p-4 border border-border-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-accent-blue" />
                <span className="text-sm font-medium text-text-primary">Paste Position Link</span>
              </div>
              <p className="text-xs text-text-tertiary mb-3">
                Uniswap, Arbiscan, Etherscan, etc.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://app.uniswap.org/pools/123..."
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-blue"
                />
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg hover:bg-bg-elevated transition-colors"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-4 h-4 text-text-tertiary" />
                </button>
              </div>

              {/* Parsed link feedback */}
              {parsedLink && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-accent-green" />
                  <span className="text-accent-green">
                    Detected: {parsedLink.type === 'uniswap' ? 'Uniswap' : 'Explorer'} on {parsedLink.chain}
                    {parsedLink.nftId && ` (NFT #${parsedLink.nftId})`}
                  </span>
                </div>
              )}

              {/* Fetch button */}
              {parsedLink?.nftId && (
                <button
                  type="button"
                  onClick={handleFetchFromChain}
                  disabled={isLoading}
                  className="mt-3 w-full px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/80 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? 'Fetching...' : 'Fetch Position Data'}
                </button>
              )}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-accent-red flex-shrink-0" />
              <span className="text-sm text-accent-red">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-accent-green/10 border border-accent-green/30 rounded-lg">
              <Check className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
              <span className="text-sm text-accent-green whitespace-pre-line">{success}</span>
            </div>
          )}

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
              <select
                value={formData.exposure}
                onChange={(e) => handleChange('exposure', e.target.value)}
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
              >
                {EXPOSURE_TYPES.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
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
                placeholder="0.00"
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary font-mono focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          {/* NFT ID (for reference) */}
          {formData.nftId && (
            <div className="text-xs text-text-tertiary">
              NFT ID: {formData.nftId}
            </div>
          )}

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
      </div>
    </div>
  );
}
