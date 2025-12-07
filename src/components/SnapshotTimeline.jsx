import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency, formatDate, formatPercent } from '../lib/utils';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-bg-elevated border border-border-primary rounded-lg p-3 shadow-xl">
      <p className="text-text-tertiary text-xs mb-2">{formatDate(data.createdAt)}</p>
      <div className="space-y-1">
        <p className="text-text-primary text-sm">
          Net Worth: <span className="font-mono">{formatCurrency(data.netWorth)}</span>
        </p>
        <p className="text-accent-green text-sm">
          Monthly: <span className="font-mono">{formatCurrency(data.monthlyFees)}</span>
        </p>
        <p className="text-text-secondary text-sm">
          Positions: <span className="font-mono">{data.positions}</span>
        </p>
      </div>
    </div>
  );
};

export default function SnapshotTimeline({ snapshots, className = '' }) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className={`bg-bg-secondary rounded-xl border border-border-primary p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-text-tertiary" />
          <h3 className="text-text-primary font-medium">Portfolio Timeline</h3>
        </div>
        <div className="h-40 flex items-center justify-center text-text-tertiary">
          <p className="text-sm">No snapshots yet. Click "Snapshot" to save your current state.</p>
        </div>
      </div>
    );
  }

  // Calculate change from first to last snapshot
  const firstSnapshot = snapshots[0];
  const lastSnapshot = snapshots[snapshots.length - 1];
  const netWorthChange = lastSnapshot.netWorth - firstSnapshot.netWorth;
  const netWorthChangePercent = firstSnapshot.netWorth > 0
    ? ((netWorthChange / firstSnapshot.netWorth) * 100)
    : 0;

  const isPositive = netWorthChange >= 0;

  // Format data for chart
  const chartData = snapshots.map(s => ({
    ...s,
    date: new Date(s.createdAt).getTime(),
  }));

  return (
    <div className={`bg-bg-secondary rounded-xl border border-border-primary p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-text-tertiary" />
          <h3 className="text-text-primary font-medium">Portfolio Timeline</h3>
        </div>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-accent-green" />
          ) : (
            <TrendingDown className="w-4 h-4 text-accent-red" />
          )}
          <span className={`text-sm font-mono ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
            {isPositive ? '+' : ''}{formatCurrency(netWorthChange)} ({formatPercent(netWorthChangePercent)})
          </span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d672" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d672" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#2a2e38' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#00d672"
              strokeWidth={2}
              fill="url(#netWorthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent snapshots list */}
      <div className="mt-4 pt-4 border-t border-border-primary">
        <p className="text-text-tertiary text-xs mb-2">Recent Snapshots ({snapshots.length} total)</p>
        <div className="space-y-2 max-h-24 overflow-y-auto">
          {snapshots.slice(-5).reverse().map((snapshot) => (
            <div key={snapshot.id} className="flex items-center justify-between text-sm">
              <span className="text-text-tertiary">
                {formatDate(snapshot.createdAt)}
              </span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-text-primary">{formatCurrency(snapshot.netWorth)}</span>
                <span className="font-mono text-accent-green">{formatCurrency(snapshot.monthlyFees)}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
