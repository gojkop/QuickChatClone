import React, { useMemo } from 'react';

const formatCurrency = (cents) => {
  const amount = (cents || 0) / 100;
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const ThisMonthDetail = ({ allQuestions = [] }) => {
  const data = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter this month's answered questions
    const thisMonthQuestions = allQuestions.filter(q => {
      if (!q.answered_at || q.answered_at === 0) return false;
      const answeredDate = new Date(q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000);
      return answeredDate.getMonth() === currentMonth && answeredDate.getFullYear() === currentYear;
    });

    // Filter last month's for comparison
    const lastMonthQuestions = allQuestions.filter(q => {
      if (!q.answered_at || q.answered_at === 0) return false;
      const answeredDate = new Date(q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000);
      return answeredDate.getMonth() === lastMonth && answeredDate.getFullYear() === lastMonthYear;
    });

    // Calculate totals
    const thisMonthTotal = thisMonthQuestions.reduce((sum, q) => sum + (q.price_cents || 0), 0);
    const lastMonthTotal = lastMonthQuestions.reduce((sum, q) => sum + (q.price_cents || 0), 0);
    const growth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0;

    // Daily breakdown (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayQuestions = thisMonthQuestions.filter(q => {
        const qDate = new Date(q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000);
        return qDate.toDateString() === date.toDateString();
      });
      const dayTotal = dayQuestions.reduce((sum, q) => sum + (q.price_cents || 0), 0);
      dailyData.push({
        date,
        total: dayTotal,
        count: dayQuestions.length,
        label: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }

    // Top questions
    const topQuestions = [...thisMonthQuestions]
      .sort((a, b) => (b.price_cents || 0) - (a.price_cents || 0))
      .slice(0, 3);

    return {
      thisMonthTotal,
      lastMonthTotal,
      growth,
      questionCount: thisMonthQuestions.length,
      dailyData,
      topQuestions,
      maxDailyTotal: Math.max(...dailyData.map(d => d.total), 1)
    };
  }, [allQuestions]);

  return (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Questions</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{data.questionCount}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium text-gray-600">vs Last Month</span>
          </div>
          <div className={`text-2xl font-black ${parseFloat(data.growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(data.growth) >= 0 ? '+' : ''}{data.growth}%
          </div>
        </div>
      </div>

      {/* Last 7 Days Chart */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Last 7 Days
        </h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-end justify-between gap-2 h-32">
            {data.dailyData.map((day, index) => {
              const heightPercent = data.maxDailyTotal > 0 ? (day.total / data.maxDailyTotal) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end flex-1">
                    {day.total > 0 && (
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        {formatCurrency(day.total)}
                      </div>
                    )}
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t transition-all hover:from-indigo-600 hover:to-purple-600"
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-500">{day.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Questions */}
      {data.topQuestions.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Top Earnings
          </h4>
          <div className="space-y-2">
            {data.topQuestions.map((q, index) => (
              <div
                key={q.id}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {q.question_text || 'Question'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-black text-gray-900 ml-2">
                  {formatCurrency(q.price_cents)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.questionCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">No questions answered this month yet</p>
        </div>
      )}
    </div>
  );
};

export default ThisMonthDetail;