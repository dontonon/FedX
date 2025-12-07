import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatNumber, getHealthStatus, getHealthColor, formatCurrency } from '../lib/utils';

export default function HealthFactorCard({ healthFactor, totalCollateral, totalDebt }) {
  const status = getHealthStatus(healthFactor || Infinity);
  const color = getHealthColor(healthFactor || Infinity);

  const getStatusIcon = () => {
    switch (status) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6" style={{ color }} />;
      case 'warning':
        return <Shield className="w-6 h-6" style={{ color }} />;
      default:
        return <CheckCircle className="w-6 h-6" style={{ color }} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'danger':
        return 'High Risk - Consider adding collateral';
      case 'warning':
        return 'Moderate - Monitor closely';
      default:
        return 'Healthy - Well collateralized';
    }
  };

  const getGlowClass = () => {
    switch (status) {
      case 'danger':
        return 'card-glow-red gradient-red border-accent-red/30';
      case 'warning':
        return 'card-glow-yellow gradient-yellow border-accent-yellow/30';
      default:
        return 'card-glow-green gradient-green border-accent-green/30';
    }
  };

  // If no debt, show a simple "No Debt" state
  if (!totalDebt || totalDebt === 0) {
    return (
      <div className="bg-bg-secondary rounded-xl border border-accent-green/30 p-6 card-glow-green gradient-green">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent-green" />
            <span className="text-text-secondary text-sm font-medium">Health Factor</span>
          </div>
        </div>
        <div className="font-mono text-3xl font-bold text-accent-green mb-2">
          No Debt
        </div>
        <p className="text-text-tertiary text-sm">
          No borrowed positions - fully collateralized
        </p>
      </div>
    );
  }

  // Calculate liquidation price info
  const liquidationBuffer = healthFactor ? ((healthFactor - 1) * 100) : 0;

  return (
    <div className={`bg-bg-secondary rounded-xl border p-6 ${getGlowClass()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-text-secondary text-sm font-medium">Health Factor</span>
        </div>
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="font-mono text-4xl font-bold mb-2" style={{ color }}>
        {healthFactor ? formatNumber(healthFactor, 2) : '---'}
      </div>

      <p className="text-text-tertiary text-sm mb-4">{getStatusText()}</p>

      {/* Collateral / Debt breakdown */}
      <div className="space-y-3 pt-4 border-t border-border-primary">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Collateral</span>
          <span className="font-mono text-text-primary">{formatCurrency(totalCollateral)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Debt</span>
          <span className="font-mono text-accent-red">{formatCurrency(totalDebt)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Buffer to Liquidation</span>
          <span className="font-mono" style={{ color }}>
            {formatNumber(liquidationBuffer, 1)}%
          </span>
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-tertiary mb-1">
          <span>1.0 (Liquidation)</span>
          <span>1.2</span>
          <span>1.5+</span>
        </div>
        <div className="relative h-2 bg-bg-tertiary rounded-full overflow-hidden">
          {/* Danger zone */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-accent-red/30" />
          {/* Warning zone */}
          <div className="absolute inset-y-0 left-1/3 w-1/3 bg-accent-yellow/30" />
          {/* Safe zone */}
          <div className="absolute inset-y-0 left-2/3 w-1/3 bg-accent-green/30" />
          {/* Current position marker */}
          {healthFactor && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-bg-primary"
              style={{
                backgroundColor: color,
                left: `${Math.min(100, Math.max(0, ((healthFactor - 1) / 0.5) * 33.33))}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
