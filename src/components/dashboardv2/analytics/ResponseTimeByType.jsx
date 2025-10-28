// src/components/dashboardv2/analytics/ResponseTimeByType.jsx
import React, { useMemo } from 'react';
import { Clock, Zap, Star } from 'lucide-react';

/**
 * ResponseTimeByType - Shows average response time split by question type
 */
function ResponseTimeByType({ questions = [] }) {
  const stats = useMemo(() => {
    const answered = questions.filter(q => q.answered_at && q.created_at);

    // Split by question type
    const quickQuestions = answered.filter(q =>
      q.question_tier === 'tier1' || !q.question_tier
    );
    const deepDiveQuestions = answered.filter(q =>
      q.question_tier === 'tier2' || q.question_tier === 'deep_dive'
    );

    // Calculate average response time for each type
    const calculateAvg = (questions) => {
      if (questions.length === 0) return 0;

      const times = questions.map(q => {
        const created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
        const answered = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
        return (answered - created) / 3600; // hours
      });

      return times.reduce((sum, t) => sum + t, 0) / times.length;
    };

    return {
      quick: {
        avg: calculateAvg(quickQuestions),
        count: quickQuestions.length
      },
      deepDive: {
        avg: calculateAvg(deepDiveQuestions),
        count: deepDiveQuestions.length
      }
    };
  }, [questions]);

  const formatTime = (hours) => {
    if (hours === 0) return '—';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-lg">
          <Clock size={18} className="text-indigo-600" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Avg Response by Type</h3>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {/* Quick Consult */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap size={16} className="text-blue-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Quick Consult</p>
              <p className="text-xs text-gray-600">{stats.quick.count} questions</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-blue-600">
              {formatTime(stats.quick.avg)}
            </p>
          </div>
        </div>

        {/* Deep Dive */}
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star size={16} className="text-purple-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Deep Dive</p>
              <p className="text-xs text-gray-600">{stats.deepDive.count} questions</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-purple-600">
              {formatTime(stats.deepDive.avg)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResponseTimeByType;
