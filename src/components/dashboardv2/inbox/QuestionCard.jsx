import React from 'react';
import { MessageSquare, User, Calendar, MoreVertical } from 'lucide-react';
import SLAIndicator from './SLAIndicator';
import PriorityBadge from './PriorityBadge';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function QuestionCard({ question, isSelected, onSelect, onClick }) {
  const getRelativeTime = (timestamp) => {
    const now = Date.now() / 1000;
    const createdAt = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
    const diff = now - createdAt;
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const isAnswered = question.status === 'closed' || question.status === 'answered' || question.answered_at;

  return (
    <div
      className={`
        relative p-4 border rounded-lg transition-all cursor-pointer
        ${isSelected 
          ? 'border-indigo-300 bg-indigo-50 shadow-sm' 
          : isAnswered
          ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
        }
      `}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(question.id);
          }}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>

      {/* Main Content */}
      <div className="ml-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold mb-1 line-clamp-2 ${isAnswered ? 'text-gray-600' : 'text-gray-900'}`}>
              {question.question_text || 'Untitled Question'}
            </h3>
            
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge question={question} />
              {!isAnswered && <SLAIndicator question={question} showLabel={true} />}
              {isAnswered && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-semibold">
                  ✓ Answered
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className={`text-lg font-bold ${isAnswered ? 'text-gray-500' : 'text-green-600'}`}>
              {formatCurrency(question.price_cents)}
            </span>
          </div>
        </div>

        {/* Question Preview */}
        {question.question_details && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {question.question_details}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {question.user_name && (
              <span className="flex items-center gap-1">
                <User size={12} />
                {question.user_name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {getRelativeTime(question.created_at)}
            </span>
          </div>

          {/* More Actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle more actions
            }}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;