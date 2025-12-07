import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon: Icon,
  variant = 'default', // default, success, warning, danger, info
  size = 'default', // default, large
  className = '',
}) {
  const variantClasses = {
    default: 'border-border-primary',
    success: 'border-accent-green/30 card-glow-green gradient-green',
    warning: 'border-accent-yellow/30 card-glow-yellow gradient-yellow',
    danger: 'border-accent-red/30 card-glow-red gradient-red',
    info: 'border-accent-blue/30 gradient-blue',
  };

  const valueColorClasses = {
    default: 'text-text-primary',
    success: 'text-accent-green',
    warning: 'text-accent-yellow',
    danger: 'text-accent-red',
    info: 'text-accent-blue',
  };

  const sizeClasses = {
    default: 'p-4',
    large: 'p-6',
  };

  const valueSizeClasses = {
    default: 'text-2xl',
    large: 'text-4xl',
  };

  const getTrendIcon = () => {
    if (!change && change !== 0) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-accent-green" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-accent-red" />;
    return <Minus className="w-4 h-4 text-text-tertiary" />;
  };

  const getChangeColor = () => {
    if (!change && change !== 0) return 'text-text-tertiary';
    if (change > 0) return 'text-accent-green';
    if (change < 0) return 'text-accent-red';
    return 'text-text-tertiary';
  };

  return (
    <div
      className={`
        bg-bg-secondary rounded-xl border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-text-secondary text-sm font-medium">{title}</span>
        {Icon && (
          <Icon className={`w-5 h-5 ${valueColorClasses[variant] || 'text-text-tertiary'}`} />
        )}
      </div>

      <div className={`font-mono font-semibold ${valueSizeClasses[size]} ${valueColorClasses[variant]}`}>
        {value}
      </div>

      {(subtitle || change !== undefined) && (
        <div className="flex items-center gap-2 mt-2">
          {subtitle && (
            <span className="text-text-tertiary text-sm">{subtitle}</span>
          )}
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
              {getTrendIcon()}
              <span>
                {change > 0 ? '+' : ''}{typeof change === 'number' ? change.toFixed(2) : change}%
              </span>
              {changeLabel && <span className="text-text-muted ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
