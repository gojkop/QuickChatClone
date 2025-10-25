import React from 'react';
import { User, Calendar, CheckCircle, MessageSquare } from 'lucide-react';
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
        relative p-3 sm:p-4 border rounded-xl transition-all duration-300 cursor-pointer group
        ${isActive 
          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-primary ring-2 ring-indigo-200 scale-[1.02]' 
          : isSelected
          ? 'border-indigo-300 bg-indigo-50 shadow-sm'
          : isAnswered
          ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5'
        }
      `}
      onClick={onClick}
    >
      {/* Selection Checkbox - Touch optimized */}
      <div className="absolute top-3 left-3 z-10 touch-target">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(question.id);
          }}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
        />
      </div>

      {/* Main Content */}
      <div className="ml-7 sm:ml-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {question.video_url && (
                <MessageSquare size={14} className="text-indigo-600 flex-shrink-0 icon-container" />
              )}
              <h3 className={`text-sm font-semibold line-clamp-2 ${isAnswered ? 'text-gray-600' : 'text-gray-900'}`}>
                {question.question_text || 'Untitled Question'}
              </h3>
            </div>
          </div>

          {/* Price - Gradient background */}
          <div className={`
            flex-shrink-0 px-2.5 py-1 rounded-lg font-bold text-sm shadow-sm
            ${isAnswered 
              ? 'bg-gray-100 text-gray-500' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
            }
          `}>
            {formatCurrency(question.price_cents)}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <PriorityBadge question={question} />
          {!isAnswered && <SLAIndicator question={question} showLabel={false} compact={true} />}
          {isAnswered && (
            <span className="badge-premium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
              <CheckCircle size={12} className="icon-container" />
              <span className="font-bold">Answered</span>
            </span>
          )}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {question.user_name && (
            <span className="flex items-center gap-1 truncate">
              <User size={12} className="flex-shrink-0 icon-container" />
              <span className="truncate">{question.user_name}</span>
            </span>
          )}
          <span className="flex items-center gap-1 flex-shrink-0">
            <Calendar size={12} className="icon-container" />
            {getRelativeTime(question.created_at)}
          </span>
        </div>
      </div>

      {/* Hover effect overlay */}
      {!isAnswered && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
      )}
    </div>
  );
}

export default QuestionCard;