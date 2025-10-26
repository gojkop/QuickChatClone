// src/components/dashboardv2/overview/RecentActivity.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, Eye, MessageCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function RecentActivity({ questions = [] }) {
  const navigate = useNavigate();
  const [hoveredQuestion, setHoveredQuestion] = useState(null);

  const recentQuestions = questions
    .filter(q => q.status === 'paid' && !q.answered_at)
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 5);

  const getRelativeTime = (timestamp) => {
    const now = Date.now() / 1000;
    const createdAt = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
    const diff = now - createdAt;
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (recentQuestions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Questions</h2>
        <div className="text-center py-6 text-gray-500">
          <MessageSquare size={40} className="mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="font-semibold text-gray-700 mb-0.5 text-sm">No pending questions</p>
          <p className="text-xs">You're all caught up! 🎉</p>
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
        {recentQuestions.map((question) => (
          <div
            key={question.id}
            className="group relative p-2 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            onMouseEnter={() => setHoveredQuestion(question.id)}
            onMouseLeave={() => setHoveredQuestion(null)}
            onClick={() => navigate(`/dashboard/inbox#question-${question.id}`)}
          >
            <div className="flex items-start gap-2">
              {/* Avatar - SMALLER */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full ${getAvatarColor(question.user_name)} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                {getInitials(question.user_name)}
              </div>

              {/* Content - COMPACT */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-xs">
                      {question.user_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-700 line-clamp-1">
                      {question.question_text || 'Untitled Question'}
                    </p>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                    {formatCurrency(question.price_cents)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Clock size={10} />
                    {getRelativeTime(question.created_at)}
                  </span>
                  {question.tier && (
                    <>
                      <span>•</span>
                      <span className="font-medium capitalize">{question.tier}</span>
                    </>
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
                    navigate(`/dashboard/inbox#question-${question.id}`);
                  }}
                  className="p-1 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg transition-colors"
                  title="Answer now"
                >
                  <MessageCircle size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
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