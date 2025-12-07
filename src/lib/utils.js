// Utility functions

import { HEALTH_THRESHOLDS, GOALS, CHAINS, EXPOSURE_TYPES, POSITION_TYPES } from './constants';

// Format currency
export function formatCurrency(value, decimals = 2) {
  if (value === null || value === undefined) return '$0.00';

  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }

  return `$${value.toFixed(decimals)}`;
}

// Format percentage
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
}

// Format number with commas
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Get health factor status
export function getHealthStatus(healthFactor) {
  if (healthFactor < HEALTH_THRESHOLDS.danger) return 'danger';
  if (healthFactor < HEALTH_THRESHOLDS.warning) return 'warning';
  return 'safe';
}

// Get health factor color
export function getHealthColor(healthFactor) {
  const status = getHealthStatus(healthFactor);
  switch (status) {
    case 'danger': return '#ff4757';
    case 'warning': return '#ffc048';
    case 'safe': return '#00d672';
    default: return '#64748b';
  }
}

// Calculate goal coverage percentage
export function calculateGoalCoverage(monthlyFees) {
  return (monthlyFees / GOALS.monthlyIncome) * 100;
}

// Get goal coverage status
export function getGoalStatus(coverage) {
  if (coverage >= 100) return 'complete';
  if (coverage >= 75) return 'close';
  if (coverage >= 50) return 'halfway';
  return 'starting';
}

// Aggregate positions by field
export function aggregateBy(positions, field, valueField = 'value') {
  const aggregated = {};

  positions.forEach(position => {
    const key = position[field];
    if (!aggregated[key]) {
      aggregated[key] = 0;
    }
    aggregated[key] += position[valueField] || 0;
  });

  return Object.entries(aggregated).map(([name, value]) => ({
    name,
    value,
    percentage: 0, // Will be calculated after
  }));
}

// Calculate percentages for aggregated data
export function calculatePercentages(data) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }));
}

// Get chain info by value
export function getChainInfo(chainValue) {
  return CHAINS.find(c => c.value === chainValue) || { label: chainValue, color: '#64748b' };
}

// Get exposure info by value
export function getExposureInfo(exposureValue) {
  return EXPOSURE_TYPES.find(e => e.value === exposureValue) || { label: exposureValue, color: '#64748b' };
}

// Get position type info by value
export function getPositionTypeInfo(typeValue) {
  return POSITION_TYPES.find(t => t.value === typeValue) || { label: typeValue, color: '#64748b' };
}

// Calculate portfolio metrics
export function calculatePortfolioMetrics(positions) {
  let totalValue = 0;
  let totalDebt = 0;
  let totalCollateral = 0;
  let totalMonthlyFees = 0;
  let weightedAprSum = 0;
  let totalAprWeight = 0;

  positions.forEach(position => {
    const value = position.value || 0;
    const debt = position.debt || 0;
    const monthlyFees = position.monthlyFees || 0;
    const apr = position.apr || 0;

    totalValue += value;
    totalDebt += debt;
    totalMonthlyFees += monthlyFees;

    if (position.type === 'collateral') {
      totalCollateral += value;
    }

    if (value > 0 && apr > 0) {
      weightedAprSum += apr * value;
      totalAprWeight += value;
    }
  });

  const netWorth = totalValue - totalDebt;
  const healthFactor = totalDebt > 0 ? totalCollateral / totalDebt : Infinity;
  const avgApr = totalAprWeight > 0 ? weightedAprSum / totalAprWeight : 0;
  const goalCoverage = calculateGoalCoverage(totalMonthlyFees);

  return {
    totalValue,
    totalDebt,
    totalCollateral,
    netWorth,
    healthFactor: healthFactor === Infinity ? null : healthFactor,
    monthlyFees: totalMonthlyFees,
    avgApr,
    goalCoverage,
  };
}

// Generate unique ID
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Truncate address
export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Validate Ethereum address
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Sort positions
export function sortPositions(positions, sortField, sortDirection) {
  return [...positions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle null/undefined
    if (aValue === null || aValue === undefined) aValue = 0;
    if (bValue === null || bValue === undefined) bValue = 0;

    // Handle string comparison
    if (typeof aValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Numeric comparison
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });
}

// Calculate position recommendation
export function getPositionRecommendation(position) {
  const { value, apr, monthlyFees, type } = position;

  // Low value positions with low returns
  if (value < 500 && apr < 5) {
    return { type: 'warning', text: 'Consider consolidating' };
  }

  // High value with very low APR
  if (value > 2000 && apr < 2) {
    return { type: 'warning', text: 'Low yield for size' };
  }

  // Great performing positions
  if (apr > 30 && monthlyFees > 50) {
    return { type: 'success', text: 'Top performer' };
  }

  // Collateral with high utilization risk
  if (type === 'collateral' && position.debt && position.value) {
    const ratio = position.value / position.debt;
    if (ratio < 1.5) {
      return { type: 'danger', text: 'High liquidation risk' };
    }
  }

  return null;
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Deep clone object
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Format date
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date);
}
