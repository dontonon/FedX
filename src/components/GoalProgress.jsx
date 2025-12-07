import { Target, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '../lib/utils';
import { GOALS } from '../lib/constants';

export default function GoalProgress({ monthlyFees, goalAmount = GOALS.monthlyIncome }) {
  const coverage = (monthlyFees / goalAmount) * 100;
  const remaining = Math.max(0, goalAmount - monthlyFees);

  const getStatusColor = () => {
    if (coverage >= 100) return 'accent-green';
    if (coverage >= 75) return 'accent-blue';
    if (coverage >= 50) return 'accent-yellow';
    return 'accent-red';
  };

  const statusColor = getStatusColor();

  const getStatusMessage = () => {
    if (coverage >= 100) return 'Goal achieved!';
    if (coverage >= 75) return 'Almost there!';
    if (coverage >= 50) return 'Halfway there';
    return 'Keep building';
  };

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className={`w-5 h-5 text-${statusColor}`} />
          <h3 className="text-text-primary font-medium">Financial Independence Goal</h3>
        </div>
        <span className="text-text-tertiary text-sm">{getStatusMessage()}</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-bg-tertiary rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, coverage)}%`,
            backgroundColor: `var(--color-${statusColor})`,
          }}
        />
        {/* Milestone markers */}
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-px bg-bg-primary"
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-text-tertiary text-xs uppercase mb-1">Current</p>
          <p className={`font-mono text-lg font-semibold text-${statusColor}`}>
            {formatCurrency(monthlyFees)}
          </p>
          <p className="text-text-tertiary text-xs">/month</p>
        </div>
        <div className="text-center">
          <p className="text-text-tertiary text-xs uppercase mb-1">Coverage</p>
          <p className={`font-mono text-lg font-semibold text-${statusColor}`}>
            {formatPercent(coverage, 1)}
          </p>
          <p className="text-text-tertiary text-xs">of goal</p>
        </div>
        <div className="text-right">
          <p className="text-text-tertiary text-xs uppercase mb-1">Target</p>
          <p className="font-mono text-lg font-semibold text-text-primary">
            {formatCurrency(goalAmount)}
          </p>
          <p className="text-text-tertiary text-xs">/month</p>
        </div>
      </div>

      {/* Remaining */}
      {remaining > 0 && (
        <div className="mt-4 pt-4 border-t border-border-primary">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Remaining to goal</span>
            <span className="font-mono text-text-primary">{formatCurrency(remaining)}/mo</span>
          </div>
          <p className="text-text-tertiary text-xs mt-1">
            At current rates, need ~{formatCurrency(remaining * 12 / 0.15)} more in positions (assuming 15% avg APR)
          </p>
        </div>
      )}
    </div>
  );
}
