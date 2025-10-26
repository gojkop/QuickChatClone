// src/components/dashboardv2/metrics/MetricCard.jsx
import React, { useState } from 'react';
import MetricTrend from './MetricTrend';
import { Sparklines, SparklinesLine } from 'react-sparklines';

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend = null, 
  trendSuffix = '%',
  trendInverse = false,
  color = 'indigo',
  loading = false,
  sparklineData = null,
  goal = null,
  period = 'vs last month'
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const colorClasses = {
    indigo: { 
      icon: 'text-indigo-600 bg-gradient-to-br from-indigo-50 to-indigo-100',
      sparkline: '#6366f1',
      progress: 'bg-indigo-500'
    },
    green: { 
      icon: 'text-green-600 bg-gradient-to-br from-green-50 to-green-100',
      sparkline: '#10b981',
      progress: 'bg-green-500'
    },
    orange: { 
      icon: 'text-orange-600 bg-gradient-to-br from-orange-50 to-orange-100',
      sparkline: '#f59e0b',
      progress: 'bg-orange-500'
    },
    purple: { 
      icon: 'text-purple-600 bg-gradient-to-br from-purple-50 to-purple-100',
      sparkline: '#a855f7',
      progress: 'bg-purple-500'
    },
    blue: { 
      icon: 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100',
      sparkline: '#3b82f6',
      progress: 'bg-blue-500'
    },
  };

  // Count-up animation hook
  const useCountUp = (end, duration = 1000) => {
    const [count, setCount] = React.useState(0);
    
    React.useEffect(() => {
      let startTime;
      let animationFrame;
      
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        setCount(Math.floor(easeOutQuart * end));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);
    
    return count;
  };

  // Extract numeric value for animation
  const getNumericValue = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const match = val.match(/[\d,]+/);
      return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
    }
    return 0;
  };

  const numericValue = getNumericValue(value);
  const animatedValue = useCountUp(numericValue, 1200);
  
  // Format the animated value back to original format
  const formatValue = (val) => {
    if (typeof value === 'string') {
      return value.replace(/[\d,]+/, val.toLocaleString());
    }
    return val;
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 skeleton rounded"></div>
          <div className="w-10 h-10 skeleton rounded-lg"></div>
        </div>
        <div className="h-8 w-24 skeleton rounded mb-2"></div>
        <div className="h-4 w-16 skeleton rounded"></div>
      </div>
    );
  }

  const progressPercent = goal ? Math.min((numericValue / goal) * 100, 100) : 0;

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-5 transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="text-sm font-medium text-gray-600">
            {label}
          </div>
          {Icon && (
            <div className={`p-2.5 rounded-xl shadow-sm ${colorClasses[color].icon} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
              <Icon size={20} className="icon-container" />
            </div>
          )}
        </div>
        
        <div className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
          {formatValue(animatedValue)}
        </div>

        {/* Sparkline Chart */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mb-2 -mx-1 h-8">
            <Sparklines data={sparklineData} width={100} height={32}>
              <SparklinesLine 
                color={colorClasses[color].sparkline} 
                style={{ 
                  strokeWidth: 2, 
                  fill: 'none',
                  stroke: colorClasses[color].sparkline
                }} 
              />
            </Sparklines>
          </div>
        )}

        {/* Trend Indicator */}
        {trend !== null && (
          <MetricTrend value={trend} suffix={trendSuffix} inverse={trendInverse} period={period} />
        )}

        {/* Progress Bar (if goal is set) */}
        {goal && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span>Goal Progress</span>
              <span className="font-semibold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colorClasses[color].progress} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg animate-fadeInScale z-20">
            Click for details
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;