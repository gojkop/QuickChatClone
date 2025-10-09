import React, { useMemo } from 'react';

const formatCurrency = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const StatCard = ({ label, value, subtitle, trend, icon, stars }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition flex-shrink-0 w-[160px] sm:w-auto">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        {icon && (
          <div className="w-6 h-6 bg-indigo-50 rounded flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-1">
        <div className="text-xl sm:text-2xl font-black text-gray-900">{value}</div>
      </div>
      
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
      
      {trend && (
        <div className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {trend.isPositive ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            )}
          </svg>
          {trend.value}
        </div>
      )}
      
      {stars && (
        <div className="flex items-center gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(stars) ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}
    </div>
  );
};

const StatsSection = ({ allQuestions = [] }) => {
  // Memoize stats calculation - only recalculate when questions change
  const stats = useMemo(() => {
    // Ensure we have an array to work with
    const questions = Array.isArray(allQuestions) ? allQuestions : [];
    
    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter answered questions
    const answeredQuestions = questions.filter(q => q.answered_at && q.answered_at > 0);
    
    // Calculate this month's earnings
    const thisMonthEarnings = answeredQuestions
      .filter(q => {
        const answeredDate = new Date(q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000);
        return answeredDate.getMonth() === currentMonth && answeredDate.getFullYear() === currentYear;
      })
      .reduce((sum, q) => sum + (q.price_cents || 0), 0);
    
    // Calculate last month's earnings for growth calculation
    const lastMonthEarnings = answeredQuestions
      .filter(q => {
        const answeredDate = new Date(q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000);
        return answeredDate.getMonth() === lastMonth && answeredDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum, q) => sum + (q.price_cents || 0), 0);
    
    // Calculate monthly growth percentage
    const monthlyGrowth = lastMonthEarnings > 0 
      ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
      : thisMonthEarnings > 0 ? 100 : 0;
    
    // Calculate all-time earnings
    const allTimeEarnings = answeredQuestions.reduce((sum, q) => sum + (q.price_cents || 0), 0);
    
    // Total answered count
    const totalAnswered = answeredQuestions.length;
    
    // Calculate average response time in hours
    let avgResponseTime = 0;
    if (answeredQuestions.length > 0) {
      const totalResponseTime = answeredQuestions.reduce((sum, q) => {
        const createdAt = q.created_at > 4102444800 ? q.created_at : q.created_at * 1000;
        const answeredAt = q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000;
        const responseTimeHours = (answeredAt - createdAt) / (1000 * 60 * 60); // Convert ms to hours
        return sum + responseTimeHours;
      }, 0);
      avgResponseTime = totalResponseTime / answeredQuestions.length;
    }
    
    // Get target response time from most recent question's SLA (or default to 24)
    const targetResponseTime = questions.length > 0 && questions[0]?.sla_hours_snapshot 
      ? questions[0].sla_hours_snapshot 
      : 24;
    
    // Calculate average rating (placeholder - would need rating data from questions)
    // For now, we'll use a default or calculate from question data if available
    const avgRating = 4.8; // Default until we have real rating data
    
    return {
      thisMonthEarnings,
      allTimeEarnings,
      totalAnswered,
      avgResponseTime,
      targetResponseTime,
      avgRating,
      monthlyGrowth
    };
  }, [allQuestions]);

  const statsData = [
    {
      label: "This Month",
      value: formatCurrency(stats.thisMonthEarnings),
      trend: {
        value: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%`,
        isPositive: stats.monthlyGrowth >= 0
      },
      icon: (
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: "All Time",
      value: formatCurrency(stats.allTimeEarnings),
      subtitle: `${stats.totalAnswered} answered`,
      icon: (
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    {
      label: "Avg Response",
      value: stats.totalAnswered > 0 ? `${stats.avgResponseTime.toFixed(1)}h` : '—',
      subtitle: `Target: ${stats.targetResponseTime}h`,
      icon: (
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: "Avg Rating",
      value: stats.avgRating.toFixed(1),
      stars: stats.avgRating,
      icon: (
        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-gray-900">Performance</h3>
      
      {/* Mobile: Horizontal scroll */}
      <div 
        className="lg:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Desktop: 2x2 grid */}
      <div className="hidden lg:grid grid-cols-2 gap-3">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default StatsSection;