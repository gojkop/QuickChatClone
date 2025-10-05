import React from 'react';

const formatCurrency = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const StatCard = ({ label, value, subtitle, trend, icon, stars }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon && (
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <div className="text-3xl font-black text-gray-900">{value}</div>
      </div>
      
      {subtitle && (
        <div className="text-sm text-gray-500">{subtitle}</div>
      )}
      
      {trend && (
        <div className={`inline-flex items-center gap-1 text-sm font-semibold mt-2 ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < Math.floor(stars) ? 'text-yellow-400' : 'text-gray-300'}`}
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

const StatsSection = ({ stats }) => {
  // Mock data - will be replaced with real data from props
  const thisMonthEarnings = stats?.thisMonthEarnings || 280000; // in cents
  const allTimeEarnings = stats?.allTimeEarnings || 1560000; // in cents
  const totalAnswered = stats?.totalAnswered || 127;
  const avgResponseTime = stats?.avgResponseTime || 8.5; // in hours
  const targetResponseTime = stats?.targetResponseTime || 24; // in hours
  const avgRating = stats?.avgRating || 4.8;
  const monthlyGrowth = stats?.monthlyGrowth || 12; // percentage

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Performance</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* This Month Earnings */}
        <StatCard
          label="This Month"
          value={formatCurrency(thisMonthEarnings)}
          trend={{
            value: `+${monthlyGrowth}%`,
            isPositive: monthlyGrowth > 0
          }}
          icon={
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* All Time Earnings */}
        <StatCard
          label="All Time"
          value={formatCurrency(allTimeEarnings)}
          subtitle={`${totalAnswered} answered`}
          icon={
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />

        {/* Avg Response Time */}
        <StatCard
          label="Avg Response"
          value={`${avgResponseTime}h`}
          subtitle={`Target: ${targetResponseTime}h`}
          icon={
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Avg Rating */}
        <StatCard
          label="Avg Rating"
          value={avgRating.toFixed(1)}
          stars={avgRating}
          icon={
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
      </div>
    </div>
  );
};

export default StatsSection;