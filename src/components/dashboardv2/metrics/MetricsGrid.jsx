// src/components/dashboardv2/metrics/MetricsGrid.jsx
import React from 'react';
import MetricCard from './MetricCard';
import { DollarSign, Clock, Star, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDuration } from '@/utils/dashboardv2/metricsCalculator';

function MetricsGrid({ metrics }) {
  // Generate mock sparkline data (replace with real data later)
  const generateSparkline = (trend) => {
    const baseValue = 50;
    const data = [];
    for (let i = 0; i < 12; i++) {
      const variation = Math.random() * 20 - 10;
      const trendEffect = (trend || 0) * i * 0.5;
      data.push(Math.max(0, baseValue + variation + trendEffect));
    }
    return data;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        label="This Month"
        value={formatCurrency(metrics.thisMonthRevenue * 100)}
        icon={DollarSign}
        trend={metrics.revenueChange}
        color="green"
        sparklineData={generateSparkline(metrics.revenueChange)}
        goal={5000}
        period="vs last month"
      />
      
      <MetricCard
        label="Avg Response"
        value={formatDuration(metrics.avgResponseTime)}
        icon={Clock}
        trend={-12.5}
        trendSuffix="%"
        trendInverse={true}
        color="indigo"
        sparklineData={generateSparkline(-12.5)}
        period="vs last month"
      />
      
      <MetricCard
        label="Rating"
        value={`${metrics.avgRating.toFixed(1)} ⭐`}
        icon={Star}
        trend={5.2}
        trendSuffix="%"
        color="purple"
        sparklineData={generateSparkline(5.2)}
        goal={5.0}
        period="vs last month"
      />
      
      <MetricCard
        label="Pending"
        value={metrics.pendingCount}
        icon={AlertCircle}
        color="orange"
        sparklineData={null}
        period="right now"
      />
    </div>
  );
}

export default MetricsGrid;