import { useState } from 'react';
import { Wallet, Settings, Download, Upload, RefreshCw, Camera } from 'lucide-react';
import { truncateAddress } from '../lib/utils';
import usePortfolioStore from '../stores/portfolio';

export default function Header({ onSnapshot }) {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, updateSettings, exportData, importData, resetToSampleData } = usePortfolioStore();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `fedx-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      importData(data);
      alert('Data imported successfully!');
    } catch {
      alert('Failed to import data. Please check the file format.');
    }
  };

  return (
    <header className="bg-bg-secondary border-b border-border-primary sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-white text-lg">FX</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-text-primary text-xl">FedX</h1>
              <p className="text-text-tertiary text-xs">DeFi Intelligence</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Snapshot button */}
            <button
              onClick={onSnapshot}
              className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-bg-elevated rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              title="Save Snapshot"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Snapshot</span>
            </button>

            {/* Wallet address */}
            {settings.walletAddress && (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-bg-tertiary rounded-lg">
                <Wallet className="w-4 h-4 text-accent-blue" />
                <span className="text-text-secondary text-sm font-mono">
                  {truncateAddress(settings.walletAddress)}
                </span>
              </div>
            )}

            {/* Settings dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-bg-tertiary hover:bg-bg-elevated rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSettings(false)}
                  />
                  <div className="absolute right-0 top-12 z-20 bg-bg-elevated border border-border-primary rounded-lg shadow-xl py-2 min-w-[200px]">
                    {/* Wallet Address Input */}
                    <div className="px-3 py-2 border-b border-border-primary">
                      <label className="block text-text-tertiary text-xs mb-1">Wallet Address</label>
                      <input
                        type="text"
                        value={settings.walletAddress || ''}
                        onChange={(e) => updateSettings({ walletAddress: e.target.value })}
                        placeholder="0x..."
                        className="w-full px-2 py-1 bg-bg-secondary border border-border-primary rounded text-text-primary text-sm font-mono focus:outline-none focus:border-accent-blue"
                      />
                    </div>

                    {/* Goal Amount Input */}
                    <div className="px-3 py-2 border-b border-border-primary">
                      <label className="block text-text-tertiary text-xs mb-1">Monthly Goal ($)</label>
                      <input
                        type="number"
                        value={settings.goalAmount || 635}
                        onChange={(e) => updateSettings({ goalAmount: parseFloat(e.target.value) || 635 })}
                        className="w-full px-2 py-1 bg-bg-secondary border border-border-primary rounded text-text-primary text-sm font-mono focus:outline-none focus:border-accent-blue"
                      />
                    </div>

                    {/* Export */}
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>

                    {/* Import */}
                    <label className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import Data
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>

                    <hr className="my-1 border-border-primary" />

                    {/* Reset to sample data */}
                    <button
                      onClick={() => {
                        if (confirm('Reset to sample data? This will replace your current positions.')) {
                          resetToSampleData();
                          setShowSettings(false);
                        }
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent-yellow hover:bg-accent-yellow/10"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset to Sample Data
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
