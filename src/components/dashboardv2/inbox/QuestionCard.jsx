import React from 'react';
import { User, Calendar, CheckCircle } from 'lucide-react';
import SLAIndicator from './SLAIndicator';
import PriorityBadge from './PriorityBadge';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function QuestionCard({ 
  question, 
  isSelected, 
  isActive = false,
  onSelect, 
  onClick 
}) {
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
        relative p-3 border rounded-lg transition-all cursor-pointer
        ${isActive 
          ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200' 
          : isSelected
          ? 'border-indigo-300 bg-indigo-50'
          : isAnswered
          ? 'border-gray-200 bg-white hover:border-gray-300'
          : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm'
        }
      `}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
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
      <div className="ml-7">
        {/* Title & Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`text-sm font-semibold line-clamp-2 flex-1 ${isAnswered ? 'text-gray-600' : 'text-gray-900'}`}>
            {question.question_text || 'Untitled Question'}
          </h3>
          <span className={`text-base font-bold flex-shrink-0 ${isAnswered ? 'text-gray-500' : 'text-green-600'}`}>
            {formatCurrency(question.price_cents)}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <PriorityBadge question={question} />
          {!isAnswered && <SLAIndicator question={question} showLabel={false} />}
          {isAnswered && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-semibold">
              <CheckCircle size={12} />
              Answered
            </span>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {question.user_name && (
            <span className="flex items-center gap-1 truncate">
              <User size={12} className="flex-shrink-0" />
              <span className="truncate">{question.user_name}</span>
            </span>
          )}
          <span className="flex items-center gap-1 flex-shrink-0">
            <Calendar size={12} />
            {getRelativeTime(question.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;