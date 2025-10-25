import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function RecentActivity({ questions = [] }) {
  const navigate = useNavigate();

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

  if (recentQuestions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Questions</h2>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No pending questions</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Questions</h2>
      
      <div className="space-y-3">
        {recentQuestions.map((question) => (
          <div
            key={question.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => navigate(`/dashboard/inbox#question-${question.id}`)}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {question.question_text || 'Untitled Question'}
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {getRelativeTime(question.created_at)}
                  </span>
                  {question.user_name && (
                    <span>from {question.user_name}</span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-sm font-semibold">
                  {formatCurrency(question.price_cents)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dashboard/inbox')}
        className="mt-4 w-full py-2.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
      >
        View All Questions →
      </button>
    </div>
  );
}

export default RecentActivity;