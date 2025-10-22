import React, { useMemo } from 'react';

const formatCurrency = (cents) => {
  const amount = (cents || 0) / 100;
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const AllTimeDetail = ({ allQuestions = [] }) => {
  const data = useMemo(() => {
    // Filter only answered questions
    const answeredQuestions = allQuestions.filter(q => q.answered_at && q.answered_at > 0);

    // Calculate total earnings
    const totalEarnings = answeredQuestions.reduce((sum, q) => sum + (q.price_cents || 0), 0);
    const totalCount = answeredQuestions.length;

    // Group by month
    const monthlyData = {};
    answeredQuestions.forEach(q => {
      const date = new Date(q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0, date };
      }
      monthlyData[monthKey].total += q.price_cents || 0;
      monthlyData[monthKey].count += 1;
    });

    // Sort and get last 6 months
    const sortedMonths = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);

    const monthlyChartData = sortedMonths.map(([key, value]) => ({
      key,
      label: value.date.toLocaleDateString('en-US', { month: 'short' }),
      total: value.total,
      count: value.count
    }));

    const maxMonthlyTotal = Math.max(...monthlyChartData.map(m => m.total), 1);

    // Find best month
    const bestMonth = sortedMonths.reduce((best, current) =>
      current[1].total > (best?.[1]?.total || 0) ? current : best
    , null);

    // Calculate milestones
    const milestones = [];
    if (totalEarnings >= 100000) {
      milestones.push({
        label: 'First $1,000',
        icon: (
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        achieved: true
      });
    }
    if (totalEarnings >= 500000) {
      milestones.push({
        label: '$5,000 Earned',
        icon: (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        achieved: true
      });
    }
    if (totalEarnings >= 1000000) {
      milestones.push({
        label: '$10,000 Club',
        icon: (
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        ),
        achieved: true
      });
    }
    if (totalCount >= 50) {
      milestones.push({
        label: '50 Questions',
        icon: (
          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ),
        achieved: true
      });
    }
    if (totalCount >= 100) {
      milestones.push({
        label: '100 Questions',
        icon: (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        achieved: true
      });
    }

    // Add next milestone
    if (totalEarnings < 100000) {
      milestones.push({
        label: 'First $1,000',
        icon: (
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        achieved: false,
        progress: (totalEarnings / 100000) * 100
      });
    } else if (totalEarnings < 500000) {
      milestones.push({
        label: '$5,000 Earned',
        icon: (
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        achieved: false,
        progress: (totalEarnings / 500000) * 100
      });
    } else if (totalEarnings < 1000000) {
      milestones.push({
        label: '$10,000 Club',
        icon: (
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        ),
        achieved: false,
        progress: (totalEarnings / 1000000) * 100
      });
    }

    return {
      totalEarnings,
      totalCount,
      monthlyChartData,
      maxMonthlyTotal,
      bestMonth: bestMonth ? {
        total: bestMonth[1].total,
        count: bestMonth[1].count,
        label: bestMonth[1].date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      } : null,
      milestones
    };
  }, [allQuestions]);

  return (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Total Earned</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{formatCurrency(data.totalEarnings)}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Questions</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{data.totalCount}</div>
        </div>
      </div>

      {/* Monthly Trend */}
      {data.monthlyChartData.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Monthly Trend (Last 6 Months)
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end justify-between gap-2 h-32">
              {data.monthlyChartData.map((month, index) => {
                const heightPercent = (month.total / data.maxMonthlyTotal) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end flex-1">
                      {month.total > 0 && (
                        <div className="text-xs font-bold text-gray-700 mb-1">
                          {formatCurrency(month.total)}
                        </div>
                      )}
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t transition-all hover:from-blue-600 hover:to-indigo-600"
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-500">{month.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Best Month */}
      {data.bestMonth && (
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Best Month</h4>
              <p className="text-xs text-gray-600">{data.bestMonth.label}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Earned</div>
              <div className="text-xl font-black text-gray-900">{formatCurrency(data.bestMonth.total)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Questions</div>
              <div className="text-xl font-black text-gray-900">{data.bestMonth.count}</div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      {data.milestones.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Milestones
          </h4>
          <div className="space-y-2">
            {data.milestones.map((milestone, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 flex items-center gap-3 ${
                  milestone.achieved
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">{milestone.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${milestone.achieved ? 'text-green-900' : 'text-gray-700'}`}>
                    {milestone.label}
                  </div>
                  {!milestone.achieved && milestone.progress !== undefined && (
                    <div className="mt-1.5">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {milestone.achieved && (
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.totalCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">No questions answered yet</p>
        </div>
      )}
    </div>
  );
};

export default AllTimeDetail;