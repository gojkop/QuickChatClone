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
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Questions</h2>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
          <p className="font-semibold text-gray-700 mb-1 text-sm">No pending questions</p>
          <p className="text-xs">You're all caught up! 🎉</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Recent Questions</h2>
        <span className="text-xs text-gray-500 font-medium">
          {recentQuestions.length} pending
        </span>
      </div>
      
      <div className="space-y-2">
        {recentQuestions.map((question) => (
          <div
            key={question.id}
            className="group relative p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            onMouseEnter={() => setHoveredQuestion(question.id)}
            onMouseLeave={() => setHoveredQuestion(null)}
            onClick={() => navigate(`/dashboard/inbox#question-${question.id}`)}
          >
            <div className="flex items-start gap-2.5">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getAvatarColor(question.user_name)} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                {getInitials(question.user_name)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-xs">
                      {question.user_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-700 line-clamp-1 mt-0.5">
                      {question.question_text || 'Untitled Question'}
                    </p>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                    {formatCurrency(question.price_cents)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Clock size={11} />
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

            {/* Quick Actions (show on hover) */}
            {hoveredQuestion === question.id && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 animate-fadeInScale">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/inbox#question-${question.id}`);
                  }}
                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-lg transition-colors"
                  title="View details"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/inbox#question-${question.id}`);
                  }}
                  className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg transition-colors"
                  title="Answer now"
                >
                  <MessageCircle size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dashboard/inbox')}
        className="mt-3 w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
      >
        View All Questions →
      </button>
    </div>
  );
}

export default RecentActivity;