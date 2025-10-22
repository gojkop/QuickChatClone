import React, { useMemo } from 'react';

const ResponseTimeDetail = ({ allQuestions = [], targetResponseTime = 24 }) => {
  const data = useMemo(() => {
    // Filter answered questions with valid timestamps
    const answeredQuestions = allQuestions.filter(q =>
      q.answered_at && q.answered_at > 0 && q.created_at && q.created_at > 0
    );

    if (answeredQuestions.length === 0) {
      return {
        avgResponseTime: 0,
        totalQuestions: 0,
        distribution: [],
        fastest: null,
        slowest: null,
        withinSLA: 0,
        slaPercentage: 0
      };
    }

    // Calculate response times
    const responseTimes = answeredQuestions.map(q => {
      const createdAt = q.created_at > 4102444800 ? q.created_at : q.created_at * 1000;
      const answeredAt = q.answered_at > 4102444800 ? q.answered_at : q.answered_at * 1000;
      const hours = (answeredAt - createdAt) / (1000 * 60 * 60);
      return { question: q, hours };
    });

    // Calculate average
    const totalHours = responseTimes.reduce((sum, rt) => sum + rt.hours, 0);
    const avgResponseTime = totalHours / responseTimes.length;

    // Find fastest and slowest
    const sortedByTime = [...responseTimes].sort((a, b) => a.hours - b.hours);
    const fastest = sortedByTime[0];
    const slowest = sortedByTime[sortedByTime.length - 1];

    // Calculate SLA compliance
    const withinSLA = responseTimes.filter(rt => rt.hours <= targetResponseTime).length;
    const slaPercentage = (withinSLA / responseTimes.length) * 100;

    // Create distribution (6 buckets)
    const maxHours = Math.max(...responseTimes.map(rt => rt.hours));
    const bucketSize = Math.ceil(maxHours / 6);
    const buckets = Array(6).fill(0).map((_, i) => ({
      label: i === 5 ? `${i * bucketSize}+` : `${i * bucketSize}-${(i + 1) * bucketSize}h`,
      min: i * bucketSize,
      max: i === 5 ? Infinity : (i + 1) * bucketSize,
      count: 0
    }));

    responseTimes.forEach(rt => {
      const bucketIndex = Math.min(Math.floor(rt.hours / bucketSize), 5);
      buckets[bucketIndex].count += 1;
    });

    const maxBucketCount = Math.max(...buckets.map(b => b.count), 1);

    return {
      avgResponseTime,
      totalQuestions: answeredQuestions.length,
      distribution: buckets.map(b => ({
        ...b,
        heightPercent: (b.count / maxBucketCount) * 100
      })),
      fastest,
      slowest,
      withinSLA,
      slaPercentage
    };
  }, [allQuestions, targetResponseTime]);

  const formatTime = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  return (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Average</span>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {data.avgResponseTime > 0 ? formatTime(data.avgResponseTime) : '—'}
          </div>
        </div>

        <div className={`rounded-lg p-4 ${
          data.slaPercentage >= 80
            ? 'bg-gradient-to-br from-green-50 to-emerald-50'
            : data.slaPercentage >= 60
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50'
            : 'bg-gradient-to-br from-red-50 to-pink-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-4 h-4 ${
              data.slaPercentage >= 80 ? 'text-green-600' : data.slaPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Within {targetResponseTime}h</span>
          </div>
          <div className={`text-2xl font-black ${
            data.slaPercentage >= 80 ? 'text-green-600' : data.slaPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {data.slaPercentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Distribution */}
      {data.distribution.length > 0 && data.totalQuestions > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Response Time Distribution
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end justify-between gap-2 h-32">
              {data.distribution.map((bucket, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end flex-1">
                    {bucket.count > 0 && (
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        {bucket.count}
                      </div>
                    )}
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t transition-all hover:from-cyan-600 hover:to-blue-600"
                      style={{ height: `${Math.max(bucket.heightPercent, 4)}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-500 text-center leading-tight">
                    {bucket.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Records */}
      {data.fastest && data.slowest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fastest */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-gray-900">Fastest Response</h4>
            </div>
            <div className="text-2xl font-black text-green-600 mb-2">
              {formatTime(data.fastest.hours)}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {data.fastest.question.question_text || 'Question'}
            </div>
          </div>

          {/* Slowest */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-gray-900">Slowest Response</h4>
            </div>
            <div className="text-2xl font-black text-orange-600 mb-2">
              {formatTime(data.slowest.hours)}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {data.slowest.question.question_text || 'Question'}
            </div>
          </div>
        </div>
      )}

      {/* SLA Compliance Details */}
      {data.totalQuestions > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Target Compliance
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Within Target</div>
              <div className="text-xl font-black text-green-600">{data.withinSLA}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Beyond Target</div>
              <div className="text-xl font-black text-red-600">{data.totalQuestions - data.withinSLA}</div>
            </div>
          </div>
        </div>
      )}

      {data.totalQuestions === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">No response time data available</p>
        </div>
      )}
    </div>
  );
};

export default ResponseTimeDetail;