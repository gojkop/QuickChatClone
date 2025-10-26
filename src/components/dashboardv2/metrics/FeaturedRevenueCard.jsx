// src/components/dashboardv2/metrics/FeaturedRevenueCard.jsx
import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function FeaturedRevenueCard({ metrics }) {
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
      {/* Header - MORE COMPACT */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-0.5">Revenue This Month</p>
          <div className="flex items-baseline gap-1.5">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {formatCurrency(metrics.thisMonthRevenue * 100)}
            </h2>
            <div className={`flex items-center gap-0.5 text-xs font-bold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isPositive ? '+' : ''}{metrics.revenueChange}%</span>
            </div>
          </div>
        </div>
        <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm">
          <DollarSign size={20} className="text-green-600" strokeWidth={2.5} />
        </div>
      </div>

      {/* Sparkline Chart - SMALLER */}
      <div className="flex-1 mb-2 min-h-[60px] max-h-[60px]">
        <Sparklines 
          data={sparklineData} 
          width={400} 
          height={60}
          margin={2}
          min={Math.min(...sparklineData) * 0.95}
          max={Math.max(...sparklineData) * 1.05}
        >
          <SparklinesLine 
            color="#10b981"
            style={{ 
              strokeWidth: 1.5,
              fill: 'url(#gradient)',
              stroke: '#10b981'
            }} 
          />
          <SparklinesSpots 
            size={1.5}
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

      {/* Progress to Goal - COMPACT */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Goal ${goal.toLocaleString()}</span>
          <span className="font-bold text-gray-900">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer Stats - COMPACT */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-600 mb-0.5">Avg/Question</p>
          <p className="text-base font-bold text-gray-900">
            {formatCurrency((metrics.thisMonthRevenue * 100) / Math.max(metrics.answeredCount, 1))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-0.5">vs Last Month</p>
          <p className="text-base font-bold text-gray-900">
            {isPositive ? '+' : ''}{formatCurrency((metrics.thisMonthRevenue * metrics.revenueChange / 100) * 100)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeaturedRevenueCard;