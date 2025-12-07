import { useState, useEffect } from 'react';
import { X, Loader2, Zap, AlertCircle } from 'lucide-react';
import { CHAINS, PROTOCOLS, POSITION_TYPES, EXPOSURE_TYPES } from '../lib/constants';
import { fetchUniswapV3Position } from '../lib/blockchain';

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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchMode, setFetchMode] = useState(false);

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
    } else {
      // Reset form for new position
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
    }
    setError(null);
  }, [editPosition, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFetchFromChain = async () => {
    if (!formData.nftId || !formData.chain) {
      setError('Please enter NFT ID and select a chain');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await fetchUniswapV3Position(formData.chain, formData.nftId);

      setFormData(prev => ({
        ...prev,
        name: `${position.token0.symbol}/${position.token1.symbol} ${position.fee}%`,
        token0: position.token0.symbol,
        token1: position.token1.symbol,
        protocol: position.protocol,
      }));

      setFetchMode(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch position from chain');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
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

    // If editing, include the ID
    if (editPosition) {
      position.id = editPosition.id;
    }

    onSave(position);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-bg-secondary border border-border-primary rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary sticky top-0 bg-bg-secondary z-10">
          <h2 className="text-lg font-semibold text-text-primary">
            {editPosition ? 'Edit Position' : 'Add Position'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
          >
            <X className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Fetch from chain toggle */}
          {!editPosition && (formData.protocol === 'uniswap-v3' || formData.protocol === 'uniswap-v4') && (
            <div className="bg-bg-tertiary rounded-lg p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fetchMode}
                  onChange={(e) => setFetchMode(e.target.checked)}
                  className="w-4 h-4 rounded border-border-primary bg-bg-secondary text-accent-blue focus:ring-accent-blue"
                />
                <Zap className="w-4 h-4 text-accent-yellow" />
                <span className="text-sm text-text-secondary">Fetch from blockchain by NFT ID</span>
              </label>

              {fetchMode && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="NFT ID (e.g., 103138)"
                    value={formData.nftId}
                    onChange={(e) => handleChange('nftId', e.target.value)}
                    className="flex-1 px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={handleFetchFromChain}
                    disabled={isLoading}
                    className="px-4 py-2 bg-accent-blue text-white rounded-lg text-sm font-medium hover:bg-accent-blue/80 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Fetch
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-accent-red flex-shrink-0" />
              <span className="text-sm text-accent-red">{error}</span>
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

          {/* Tokens (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Token 0</label>
              <input
                type="text"
                value={formData.token0}
                onChange={(e) => handleChange('token0', e.target.value)}
                placeholder="e.g., ETH"
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Token 1</label>
              <input
                type="text"
                value={formData.token1}
                onChange={(e) => handleChange('token1', e.target.value)}
                placeholder="e.g., USDC"
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          {/* NFT ID (for Uniswap) */}
          {(formData.protocol === 'uniswap-v3' || formData.protocol === 'uniswap-v4') && !fetchMode && (
            <div>
              <label className="block text-sm text-text-secondary mb-1">NFT ID</label>
              <input
                type="text"
                value={formData.nftId}
                onChange={(e) => handleChange('nftId', e.target.value)}
                placeholder="e.g., 103138"
                className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-blue"
              />
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
