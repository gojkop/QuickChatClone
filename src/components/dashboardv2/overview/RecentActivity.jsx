// src/components/dashboardv2/overview/RecentActivity.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, Eye, MessageCircle, Star, Zap, User } from 'lucide-react';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function RecentActivity({ questions = [] }) {
  const navigate = useNavigate();
  const [hoveredQuestion, setHoveredQuestion] = useState(null);

  const recentQuestions = questions
    .filter(q => q.status === 'paid' && !q.answered_at)
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 5);

  const getTimeLeft = (question) => {
    if (!question.sla_hours_snapshot || question.sla_hours_snapshot <= 0) {
      return null;
    }

    const now = Date.now() / 1000;
    const createdAtSeconds = question.created_at > 4102444800
      ? question.created_at / 1000
      : question.created_at;

    const elapsed = now - createdAtSeconds;
    const slaSeconds = question.sla_hours_snapshot * 3600;
    const remaining = slaSeconds - elapsed;

    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return { text: `${days}d ${remainingHours}h`, hours };
    }
    if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, hours };
    }
    return { text: `${minutes}m`, hours: 0 };
  };

  const getTimeUrgencyColor = (hours) => {
    if (hours < 6) return 'text-red-600';
    if (hours < 12) return 'text-orange-600';
    return 'text-blue-600';
  };

  const isDeepDive = (question) => {
    return question.question_tier === 'deep_dive';
  };

  if (recentQuestions.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900">Recent Questions</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center mb-3">
            <MessageSquare className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-gray-700 mb-2 text-sm">
            Your inbox is ready
          </p>
          <p className="text-xs text-gray-600 mb-4 max-w-[200px]">
            Complete your profile to start receiving questions
          </p>
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
          >
            Complete Profile →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900">Recent Questions</h2>
        <span className="text-xs text-gray-500 font-medium">
          {recentQuestions.length} pending
        </span>
      </div>
      
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {recentQuestions.map((question) => {
          const questionIsDeepDive = isDeepDive(question);
          const timeLeft = getTimeLeft(question);

          return (
            <div
              key={question.id}
              className={`
                group relative p-2 border border-l-[3px] rounded-lg hover:shadow-md transition-all cursor-pointer
                ${questionIsDeepDive ? 'border-l-purple-400 hover:border-purple-300' : 'border-l-transparent hover:border-indigo-300'}
                border-gray-200
              `}
              onMouseEnter={() => setHoveredQuestion(question.id)}
              onMouseLeave={() => setHoveredQuestion(null)}
              onClick={() => navigate(`/dashboard/inbox#question-${question.id}`)}
            >
              <div className="flex items-start gap-2">
                {/* Type Icon */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${
                  questionIsDeepDive
                    ? 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700'
                    : 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700'
                }`}>
                  {questionIsDeepDive ? <Star size={14} /> : <Zap size={14} />}
                </div>

                {/* Content - COMPACT */}
                <div className="flex-1 min-w-0">
                  {/* Type Badge + Question Title */}
                  <div className="flex items-start gap-1.5 mb-0.5">
                    {questionIsDeepDive ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200 rounded text-[10px] font-bold flex-shrink-0">
                        <Star size={8} />
                        <span>Deep Dive</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold flex-shrink-0">
                        <Zap size={8} />
                        <span>Quick</span>
                      </span>
                    )}
                    <p className="text-xs text-gray-700 line-clamp-1 flex-1 min-w-0">
                      {question.question_text || 'Untitled Question'}
                    </p>
                  </div>

                  {/* Name + Email */}
                  <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-1">
                    <User size={10} className="text-gray-400 flex-shrink-0" />
                    {question.user_name && (
                      <span className="font-medium truncate">{question.user_name}</span>
                    )}
                    {question.user_email && (
                      <>
                        <span className="text-gray-400">·</span>
                        <a
                          href={`mailto:${question.user_email}`}
                          className="text-indigo-600 hover:text-indigo-700 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {question.user_email}
                        </a>
                      </>
                    )}
                  </div>

                  {/* Price + Time Left */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 font-bold border border-green-200">
                      {formatCurrency(question.price_cents)}
                    </span>
                    {timeLeft && (
                      <span className={`flex items-center gap-0.5 font-semibold ${getTimeUrgencyColor(timeLeft.hours)}`}>
                        <Clock size={10} />
                        {timeLeft.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions - COMPACT */}
              {hoveredQuestion === question.id && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 animate-fadeInScale">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/inbox#question-${question.id}`);
                    }}
                    className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-lg transition-colors"
                    title="View details"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/inbox#question-${question.id}/answer`);
                    }}
                    className="p-1 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg transition-colors"
                    title="Answer now"
                  >
                    <MessageCircle size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/dashboard/inbox')}
        className="mt-2 w-full py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
      >
        View All Questions →
      </button>
    </div>
  );
}

export default RecentActivity;