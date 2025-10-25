import React from 'react';
import { User, Clock, CheckCircle, MessageSquare, ChevronRight, Mail } from 'lucide-react';
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
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getQuestionTitle = (question) => {
    // Priority 1: question_text
    if (question.question_text?.trim()) {
      return question.question_text;
    }
    
    // Priority 2: First line of question_details
    if (question.question_details?.trim()) {
      const firstLine = question.question_details.split('\n')[0].trim();
      return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
    }
    
    // Priority 3: Just show it's a video question
    if (question.video_url) {
      return 'Video Question';
    }
    
    // Last resort: Question ID
    return `Question #${question.id}`;
  };

  const isAnswered = question.status === 'closed' || question.status === 'answered' || question.answered_at;

  return (
    <div
      onClick={onClick}
      className={`
        relative px-4 py-3 border-b border-gray-200 active:bg-gray-50
        transition-colors duration-150
        ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-600 pl-3' : ''}
        ${isSelected && !isActive ? 'bg-blue-50' : 'bg-white'}
        ${isAnswered ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox - Smaller and cleaner */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(question.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0 pr-6">
          {/* Question Title */}
          <div className="flex items-start gap-1.5 mb-1.5">
            {question.video_url && (
              <MessageSquare size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            )}
            <h3 className={`text-sm font-medium line-clamp-2 ${isAnswered ? 'text-gray-600' : 'text-gray-900'}`}>
              {getQuestionTitle(question)}
            </h3>
          </div>
          
          {/* Asker Info - Name + Email */}
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <User size={12} className="flex-shrink-0 text-gray-400" />
              <span className="truncate font-medium">{question.user_name || 'Anonymous'}</span>
            </div>
            {question.user_email && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Mail size={12} className="text-gray-400" />
                <span className="text-gray-500 truncate max-w-[120px]">{question.user_email}</span>
              </div>
            )}
          </div>
          
          {/* Bottom Row: Price, Time, Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Price */}
              <div className={`text-sm font-bold ${isAnswered ? 'text-gray-500' : 'text-green-700'}`}>
                {formatCurrency(question.price_cents)}
              </div>
              
              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                <span>{getRelativeTime(question.created_at)}</span>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <PriorityBadge question={question} />
              {!isAnswered && question.sla_hours_snapshot && (
                <SLAIndicator question={question} showLabel={false} compact={true} />
              )}
              {isAnswered && (
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                  <CheckCircle size={10} />
                  <span className="text-[10px] font-semibold">Done</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chevron indicator - Smaller */}
      <ChevronRight 
        size={16} 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

export default MobileQuestionCard;