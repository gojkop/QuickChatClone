import React, { useMemo } from 'react';
import { Star, MessageSquare } from 'lucide-react';

function RecentFeedback({ ratings = [], maxItems = 5 }) {
  const recentFeedback = useMemo(() => {
    const ratingsArray = Array.isArray(ratings) ? ratings : [];

    // Get feedback with text
    return ratingsArray
      .filter(r => r && r.feedback_text && r.feedback_text.trim().length > 0)
      .sort((a, b) => {
        const aTime = a.feedback_at || a.created_at || 0;
        const bTime = b.feedback_at || b.created_at || 0;
        return bTime - aTime;
      })
      .slice(0, maxItems);
  }, [ratings, maxItems]);

  if (recentFeedback.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={20} className="text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Recent Feedback</h3>
        </div>
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <MessageSquare size={48} className="text-gray-300 mb-3" />
          <p className="text-sm font-medium">No feedback comments yet</p>
          <p className="text-xs text-gray-400 mt-1">Customer feedback will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Recent Feedback</h3>
        </div>
        <span className="text-sm text-gray-500">{recentFeedback.length} recent</span>
      </div>

      <div className="space-y-3">
        {recentFeedback.map((feedback, index) => {
          const timestamp = feedback.feedback_at || feedback.created_at || 0;
          const date = new Date(timestamp > 4102444800 ? timestamp : timestamp * 1000);

          return (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i < (feedback.rating || 0)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300 fill-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-gray-900">
                    {feedback.rating ? feedback.rating.toFixed(1) : '—'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">
                "{feedback.feedback_text}"
              </p>

              {feedback.question_text && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 line-clamp-1">
                    <span className="font-medium">Question:</span> {feedback.question_text}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {recentFeedback.length >= maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Showing {maxItems} most recent feedback comments
          </p>
        </div>
      )}
    </div>
  );
}

export default RecentFeedback;
