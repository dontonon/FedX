import { useState } from 'react';
import { Plus, DollarSign, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import usePortfolioStore from '../stores/portfolio';
import { formatCurrency, formatPercent } from '../lib/utils';

import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import HealthFactorCard from '../components/HealthFactorCard';
import GoalProgress from '../components/GoalProgress';
import PositionTable from '../components/PositionTable';
import AllocationChart from '../components/AllocationChart';
import AddPositionModal from '../components/AddPositionModal';
import SnapshotTimeline from '../components/SnapshotTimeline';
import AboutModal from '../components/AboutModal';

export default function Dashboard() {
  const {
    positions,
    snapshots,
    settings,
    getMetrics,
    getChainAllocation,
    getExposureAllocation,
    addPosition,
    updatePosition,
    deletePosition,
    duplicatePosition,
    saveSnapshot,
  } = usePortfolioStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const metrics = getMetrics();
  const chainAllocation = getChainAllocation();
  const exposureAllocation = getExposureAllocation();

  const handleSavePosition = (positionData) => {
    if (editingPosition) {
      updatePosition(editingPosition.id, positionData);
    } else {
      addPosition(positionData);
    }
    setEditingPosition(null);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setIsModalOpen(true);
  };

  const handleDeletePosition = (id) => {
    if (confirm('Are you sure you want to delete this position?')) {
      deletePosition(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPosition(null);
  };

  const handleSnapshot = () => {
    saveSnapshot();
    alert('Snapshot saved!');
  };

  // Determine health factor variant
  const getHealthVariant = () => {
    if (!metrics.healthFactor) return 'success';
    if (metrics.healthFactor < 1.2) return 'danger';
    if (metrics.healthFactor < 1.5) return 'warning';
    return 'success';
  };

  // Determine goal variant
  const getGoalVariant = () => {
    if (metrics.goalCoverage >= 100) return 'success';
    if (metrics.goalCoverage >= 75) return 'info';
    if (metrics.goalCoverage >= 50) return 'warning';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header onSnapshot={handleSnapshot} onAbout={() => setIsAboutOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Goal Coverage"
            value={formatPercent(metrics.goalCoverage, 1)}
            subtitle={`${formatCurrency(metrics.monthlyFees)} / $${settings.goalAmount || 635}`}
            icon={Target}
            variant={getGoalVariant()}
            size="large"
          />
          <MetricCard
            title="Net Worth"
            value={formatCurrency(metrics.netWorth)}
            subtitle={`${positions.length} positions`}
            icon={Wallet}
            variant="default"
            size="large"
          />
          <MetricCard
            title="Monthly Fees"
            value={formatCurrency(metrics.monthlyFees)}
            subtitle="Passive income"
            icon={DollarSign}
            variant="success"
            size="large"
          />
          <MetricCard
            title="Avg APR"
            value={formatPercent(metrics.avgApr)}
            subtitle="Weighted average"
            icon={TrendingUp}
            variant={metrics.avgApr > 15 ? 'success' : 'default'}
            size="large"
          />
        </div>

        {/* Goal Progress + Health Factor Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <GoalProgress
            monthlyFees={metrics.monthlyFees}
            goalAmount={settings.goalAmount || 635}
          />
          <HealthFactorCard
            healthFactor={metrics.healthFactor}
            totalCollateral={metrics.totalCollateral}
            totalDebt={metrics.totalDebt}
          />
        </div>

        {/* Allocation Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <AllocationChart
            data={chainAllocation}
            title="Chain Distribution"
            type="chain"
          />
          <AllocationChart
            data={exposureAllocation}
            title="Exposure Breakdown"
            type="exposure"
          />
        </div>

        {/* Snapshot Timeline */}
        <div className="mb-6">
          <SnapshotTimeline snapshots={snapshots} />
        </div>

        {/* Positions Table Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Positions</h2>
              <p className="text-text-tertiary text-sm">
                {positions.length} active positions
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Position
            </button>
          </div>

          <PositionTable
            positions={positions}
            onEdit={handleEditPosition}
            onDelete={handleDeletePosition}
            onDuplicate={duplicatePosition}
            onUpdateField={updatePosition}
          />
        </div>

        {/* Summary Stats Footer */}
        <div className="bg-bg-secondary rounded-xl border border-border-primary p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-text-tertiary text-xs uppercase mb-1">Total Value</p>
              <p className="font-mono text-lg text-text-primary">{formatCurrency(metrics.totalValue)}</p>
            </div>
            <div>
              <p className="text-text-tertiary text-xs uppercase mb-1">Total Debt</p>
              <p className="font-mono text-lg text-accent-red">{formatCurrency(metrics.totalDebt)}</p>
            </div>
            <div>
              <p className="text-text-tertiary text-xs uppercase mb-1">Annual Income Est.</p>
              <p className="font-mono text-lg text-accent-green">{formatCurrency(metrics.monthlyFees * 12)}</p>
            </div>
            <div>
              <p className="text-text-tertiary text-xs uppercase mb-1">Yield on Net Worth</p>
              <p className="font-mono text-lg text-text-primary">
                {metrics.netWorth > 0 ? formatPercent((metrics.monthlyFees * 12 / metrics.netWorth) * 100) : '0%'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Position Modal */}
      <AddPositionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePosition}
        editPosition={editingPosition}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

// Target icon component (inline since we're using it)
function Target({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
