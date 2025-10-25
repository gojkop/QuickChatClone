import React from 'react';
import MetricCard from './MetricCard';
import { DollarSign, Clock, Star, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDuration } from '@/utils/dashboardv2/metricsCalculator';

function MetricsGrid({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        label="This Month"
        value={formatCurrency(metrics.thisMonthRevenue * 100)}
        icon={DollarSign}
        trend={metrics.revenueChange}
        color="green"
      />
      
      <MetricCard
        label="Avg Response"
        value={formatDuration(metrics.avgResponseTime)}
        icon={Clock}
        trend={-12.5}
        trendSuffix="%"
        trendInverse={true}
        color="indigo"
      />
      
      <MetricCard
        label="Rating"
        value={`${metrics.avgRating.toFixed(1)} ⭐`}
        icon={Star}
        trend={5.2}
        trendSuffix="%"
        color="purple"
      />
      
      <MetricCard
        label="Pending"
        value={metrics.pendingCount}
        icon={AlertCircle}
        color="orange"
      />
    </div>
  );
}

export default MetricsGrid;