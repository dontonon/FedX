import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatPercent } from '../lib/utils';
import { CHART_COLORS, CHAINS, EXPOSURE_TYPES } from '../lib/constants';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-bg-elevated border border-border-primary rounded-lg p-3 shadow-xl">
      <p className="text-text-primary font-medium">{data.name}</p>
      <p className="text-text-secondary text-sm">
        {formatCurrency(data.value)} ({formatPercent(data.percentage)})
      </p>
    </div>
  );
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-4 justify-center">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-secondary text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AllocationChart({
  data,
  title,
  type = 'default', // default, chain, exposure
  className = '',
}) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-bg-secondary rounded-xl border border-border-primary p-6 ${className}`}>
        <h3 className="text-text-primary font-medium mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-text-tertiary">
          No data available
        </div>
      </div>
    );
  }

  // Get colors based on type
  const getColor = (name, index) => {
    if (type === 'chain') {
      const chain = CHAINS.find(c => c.value === name || c.label === name);
      return chain?.color || CHART_COLORS[index % CHART_COLORS.length];
    }
    if (type === 'exposure') {
      const exposure = EXPOSURE_TYPES.find(e => e.value === name || e.label === name);
      return exposure?.color || CHART_COLORS[index % CHART_COLORS.length];
    }
    return CHART_COLORS[index % CHART_COLORS.length];
  };

  const chartData = data.map((item, index) => ({
    ...item,
    color: getColor(item.name, index),
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`bg-bg-secondary rounded-xl border border-border-primary p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary font-medium">{title}</h3>
        <span className="text-text-tertiary text-sm font-mono">{formatCurrency(total)}</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend as list */}
      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-text-secondary truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-text-tertiary font-mono text-xs">
                {formatPercent(item.percentage)}
              </span>
              <span className="text-text-primary font-mono">
                {formatCurrency(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
