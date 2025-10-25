import React from 'react';
import { User, Clock, CheckCircle, MessageSquare, ChevronRight } from 'lucide-react';
import SLAIndicator from './SLAIndicator';
import PriorityBadge from './PriorityBadge';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function MobileQuestionCard({ 
  question, 
  isSelected, 
  isActive,
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

  const getQuestionTitle = (question) => {
    if (question.question_text) return question.question_text;
    if (question.video_url) return 'Video Question';
    if (question.question_details) {
      const firstLine = question.question_details.split('\n')[0];
      return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
    }
    return `Question from ${question.user_name || 'user'}`;
  };

  const isAnswered = question.status === 'closed' || question.status === 'answered' || question.answered_at;

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 border-b border-gray-200 active:bg-gray-50
        transition-colors duration-150
        ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-600 pl-3' : ''}
        ${isSelected && !isActive ? 'bg-blue-50' : 'bg-white'}
        ${isAnswered ? 'opacity-60' : ''}
      `}
    >
      {/* Top Row: Checkbox + Question Text */}
      <div className="flex items-start gap-3 mb-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(question.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-start gap-2 mb-2">
            {question.video_url && (
              <MessageSquare size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            )}
            <h3 className={`text-sm font-medium line-clamp-2 ${isAnswered ? 'text-gray-600' : 'text-gray-900'}`}>
              {getQuestionTitle(question)}
            </h3>
          </div>
          
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <PriorityBadge question={question} />
            {!isAnswered && <SLAIndicator question={question} showLabel={false} compact={true} />}
            {isAnswered && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-700">
                <CheckCircle size={12} />
                <span className="text-xs font-semibold">Done</span>
              </span>
            )}
          </div>
          
          {/* Bottom Row: User + Time + Price */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-gray-500 min-w-0">
              <span className="flex items-center gap-1 truncate">
                <User size={12} className="flex-shrink-0" />
                <span className="truncate">{question.user_name || 'Anonymous'}</span>
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Clock size={12} />
                {getRelativeTime(question.created_at)}
              </span>
            </div>
            <div className={`text-sm font-bold flex-shrink-0 ${isAnswered ? 'text-gray-500' : 'text-green-700'}`}>
              {formatCurrency(question.price_cents)}
            </div>
          </div>
        </div>
      </div>

      {/* Chevron indicator */}
      <ChevronRight 
        size={18} 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

export default MobileQuestionCard;