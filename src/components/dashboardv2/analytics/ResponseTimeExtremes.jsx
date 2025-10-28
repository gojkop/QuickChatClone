// src/components/dashboardv2/analytics/ResponseTimeExtremes.jsx
import React, { useMemo } from 'react';
import { Zap, TurtleIcon as Turtle } from 'lucide-react';

/**
 * ResponseTimeExtremes - Shows fastest and slowest response times
 */
function ResponseTimeExtremes({ questions = [] }) {
  const stats = useMemo(() => {
    const answered = questions.filter(q => q.answered_at && q.created_at);

    if (answered.length === 0) {
      return { fastest: 0, slowest: 0 };
    }

    // Calculate all response times
    const times = answered.map(q => {
      const created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      const answeredAt = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
      return (answeredAt - created) / 3600; // hours
    });

    return {
      fastest: Math.min(...times),
      slowest: Math.max(...times)
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
        <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg">
          <Zap size={18} className="text-orange-600" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-bold text-gray-900">Response Time Range</h3>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {/* Fastest */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-green-600" strokeWidth={2.5} />
            <p className="text-xs font-semibold text-gray-700">Fastest Response</p>
          </div>
          <p className="text-3xl font-black text-green-600">
            {formatTime(stats.fastest)}
          </p>
        </div>

        {/* Slowest */}
        <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3.5 h-3.5 rounded-full bg-orange-600" />
            <p className="text-xs font-semibold text-gray-700">Slowest Response</p>
          </div>
          <p className="text-3xl font-black text-orange-600">
            {formatTime(stats.slowest)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResponseTimeExtremes;
