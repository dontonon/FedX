import { ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency, formatDate, formatPercent } from '../lib/utils';
import { Clock, TrendingUp, TrendingDown, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
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
        {data.goalCoverage && (
          <p className="text-accent-blue text-sm">
            Goal: <span className="font-mono">{formatPercent(data.goalCoverage)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

// Delta indicator component
function DeltaIndicator({ current, previous, format = formatCurrency, suffix = '' }) {
  if (!previous) return null;

  const delta = current - previous;
  const percentChange = previous > 0 ? (delta / previous) * 100 : 0;

  if (Math.abs(delta) < 0.01) {
    return (
      <span className="flex items-center gap-1 text-text-tertiary text-xs">
        <Minus className="w-3 h-3" />
        <span>0%</span>
      </span>
    );
  }

  const isPositive = delta > 0;

  return (
    <span className={`flex items-center gap-1 text-xs ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
      {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      <span>{isPositive ? '+' : ''}{format(delta)}{suffix}</span>
      <span className="text-text-muted">({formatPercent(Math.abs(percentChange))})</span>
    </span>
  );
}

export default function SnapshotTimeline({ snapshots, className = '' }) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className={`bg-bg-secondary rounded-xl border border-border-primary p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-text-tertiary" />
          <h3 className="text-text-primary font-medium">Monthly Tracking</h3>
        </div>
        <div className="h-40 flex flex-col items-center justify-center text-text-tertiary">
          <Clock className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No snapshots yet</p>
          <p className="text-xs mt-1">Click "Snapshot" to save your current portfolio state</p>
        </div>
      </div>
    );
  }

  // Get latest and previous snapshot for comparison
  const latestSnapshot = snapshots[snapshots.length - 1];
  const previousSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  // Calculate overall change from first to last
  const firstSnapshot = snapshots[0];
  const netWorthChange = latestSnapshot.netWorth - firstSnapshot.netWorth;
  const netWorthChangePercent = firstSnapshot.netWorth > 0
    ? ((netWorthChange / firstSnapshot.netWorth) * 100)
    : 0;
  const isPositive = netWorthChange >= 0;

  // Format data for chart
  const chartData = snapshots.map(s => ({
    ...s,
    date: new Date(s.createdAt).getTime(),
  }));

  // Get month label for latest snapshot
  const latestMonth = new Date(latestSnapshot.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={`bg-bg-secondary rounded-xl border border-border-primary p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-text-tertiary" />
          <h3 className="text-text-primary font-medium">Monthly Tracking</h3>
        </div>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-accent-green" />
          ) : (
            <TrendingDown className="w-4 h-4 text-accent-red" />
          )}
          <span className={`text-sm font-mono ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
            {isPositive ? '+' : ''}{formatCurrency(netWorthChange)}
          </span>
          <span className="text-text-tertiary text-xs">all time</span>
        </div>
      </div>

      {/* Current vs Previous Month Comparison */}
      {previousSnapshot && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-bg-tertiary/50 rounded-lg">
          <div>
            <p className="text-text-tertiary text-xs mb-1">Net Worth</p>
            <p className="font-mono text-text-primary">{formatCurrency(latestSnapshot.netWorth)}</p>
            <DeltaIndicator
              current={latestSnapshot.netWorth}
              previous={previousSnapshot.netWorth}
            />
          </div>
          <div>
            <p className="text-text-tertiary text-xs mb-1">Monthly Fees</p>
            <p className="font-mono text-accent-green">{formatCurrency(latestSnapshot.monthlyFees)}</p>
            <DeltaIndicator
              current={latestSnapshot.monthlyFees}
              previous={previousSnapshot.monthlyFees}
            />
          </div>
          <div>
            <p className="text-text-tertiary text-xs mb-1">Goal Coverage</p>
            <p className="font-mono text-accent-blue">{formatPercent(latestSnapshot.goalCoverage || 0)}</p>
            <DeltaIndicator
              current={latestSnapshot.goalCoverage || 0}
              previous={previousSnapshot.goalCoverage || 0}
              format={(v) => formatPercent(Math.abs(v))}
              suffix=""
            />
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-40">
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
              tickFormatter={(ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short' })}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#2a2e38' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
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

      {/* Snapshot History */}
      <div className="mt-4 pt-4 border-t border-border-primary">
        <div className="flex items-center justify-between mb-2">
          <p className="text-text-tertiary text-xs">Snapshot History ({snapshots.length} total)</p>
          <p className="text-text-muted text-xs">Latest: {latestMonth}</p>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {snapshots.slice().reverse().map((snapshot, idx) => {
            const prevSnap = snapshots[snapshots.length - 1 - idx - 1];
            const monthLabel = new Date(snapshot.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={snapshot.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-text-tertiary w-20">{monthLabel}</span>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="font-mono text-text-primary">{formatCurrency(snapshot.netWorth)}</span>
                    {prevSnap && (
                      <span className={`ml-2 text-xs ${snapshot.netWorth >= prevSnap.netWorth ? 'text-accent-green' : 'text-accent-red'}`}>
                        {snapshot.netWorth >= prevSnap.netWorth ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  <div className="text-right w-24">
                    <span className="font-mono text-accent-green">{formatCurrency(snapshot.monthlyFees)}</span>
                    <span className="text-text-muted">/mo</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
