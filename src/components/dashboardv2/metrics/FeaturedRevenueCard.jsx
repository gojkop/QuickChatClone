// src/components/dashboardv2/metrics/FeaturedRevenueCard.jsx
import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

/**
 * FeaturedRevenueCard - Large hero card showing main revenue metric
 * Takes up 2x2 space in the Bento Grid
 */
function FeaturedRevenueCard({ metrics }) {
  // Generate sparkline data (replace with real data later)
  const generateSparklineData = () => {
    const baseValue = 50;
    const data = [];
    for (let i = 0; i < 20; i++) {
      const variation = Math.random() * 20 - 10;
      const trendEffect = (metrics.revenueChange || 0) * i * 0.3;
      data.push(Math.max(0, baseValue + variation + trendEffect));
    }
    return data;
  };

  const sparklineData = generateSparklineData();
  const isPositive = metrics.revenueChange >= 0;
  const goal = 5000;
  const progressPercent = Math.min((metrics.thisMonthRevenue / goal) * 100, 100);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Revenue This Month</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              {formatCurrency(metrics.thisMonthRevenue * 100)}
            </h2>
            <div className={`flex items-center gap-1 text-sm font-bold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{isPositive ? '+' : ''}{metrics.revenueChange}%</span>
            </div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm">
          <DollarSign size={24} className="text-green-600" strokeWidth={2.5} />
        </div>
      </div>

      {/* Large Sparkline Chart */}
      <div className="flex-1 mb-3 min-h-[80px]">
        <Sparklines 
          data={sparklineData} 
          width={400} 
          height={80}
          margin={4}
          min={Math.min(...sparklineData) * 0.95}
          max={Math.max(...sparklineData) * 1.05}
        >
          <SparklinesLine 
            color="#10b981"
            style={{ 
              strokeWidth: 2,
              fill: 'url(#gradient)',
              stroke: '#10b981'
            }} 
          />
          <SparklinesSpots 
            size={2}
            style={{ fill: '#10b981' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </Sparklines>
      </div>

      {/* Progress to Goal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Progress to ${goal.toLocaleString()} goal</span>
          <span className="font-bold text-gray-900">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-600 mb-0.5">Average/Question</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency((metrics.thisMonthRevenue * 100) / Math.max(metrics.answeredCount, 1))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-0.5">vs Last Month</p>
          <p className="text-lg font-bold text-gray-900">
            {isPositive ? '+' : ''}{formatCurrency((metrics.thisMonthRevenue * metrics.revenueChange / 100) * 100)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeaturedRevenueCard;