import React from 'react';
import { MessageSquare, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import SLAIndicator from './SLAIndicator';
import PriorityBadge from './PriorityBadge';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function QuestionTable({ 
  questions, 
  selectedQuestions = [],
  activeQuestionId,
  onSelectQuestion,
  onQuestionClick,
  onSelectAll
}) {
  const getRelativeTime = (timestamp) => {
    const now = Date.now() / 1000;
    const createdAt = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
    const diff = now - createdAt;
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const isAnswered = (q) => q.status === 'closed' || q.status === 'answered' || q.answered_at;

  const getQuestionTitle = (question) => {
    if (question.question_text) return question.question_text;
    if (question.video_url) return 'Video Question';
    if (question.question_details) {
      const firstLine = question.question_details.split('\n')[0];
      return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
    }
    return `Question from ${question.user_name || 'user'}`;
  };

  const allSelected = questions.length > 0 && selectedQuestions.length === questions.length;
  const someSelected = selectedQuestions.length > 0 && !allSelected;

  return (
    <div className="flex flex-col h-full">
      {/* Table Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-[40px_minmax(200px,1fr)_140px_100px_80px] gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <div className="flex items-center justify-center">
            <input 
              type="checkbox" 
              checked={allSelected}
              ref={input => {
                if (input) {
                  input.indeterminate = someSelected;
                }
              }}
              onChange={() => onSelectAll && onSelectAll()}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
          <div>Question</div>
          <div>User</div>
          <div className="text-right">Price</div>
          <div className="text-right">Time</div>
        </div>
      </div>

      {/* Table Body - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {questions.map((question) => {
          const answered = isAnswered(question);
          const isActive = question.id === activeQuestionId;
          const isSelected = selectedQuestions.includes(question.id);

          return (
            <div
              key={question.id}
              onClick={() => onQuestionClick(question)}
              className={`
                grid grid-cols-[40px_minmax(200px,1fr)_140px_100px_80px] gap-3 px-4 py-3
                border-b border-gray-200 cursor-pointer
                transition-all duration-150
                hover:bg-indigo-50/50
                ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-600 pl-[14px]' : ''}
                ${isSelected && !isActive ? 'bg-blue-50/50' : ''}
                ${answered ? 'opacity-60' : ''}
              `}
            >
              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelectQuestion(question.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Question Text + Badges */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {question.video_url && (
                    <MessageSquare size={14} className="text-indigo-600 flex-shrink-0" />
                  )}
                  <span className={`
                    text-sm truncate
                    ${answered ? 'text-gray-600' : 'text-gray-900 font-medium'}
                  `}>
                    {getQuestionTitle(question)}
                  </span>
                </div>
                
                {/* Inline badges */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <PriorityBadge question={question} />
                  
                  {answered && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-700">
                      <CheckCircle size={12} />
                      <span className="text-xs font-semibold">Done</span>
                    </div>
                  )}
                  
                  {!answered && question.sla_hours_snapshot && (
                    <SLAIndicator question={question} compact={true} showLabel={false} />
                  )}
                </div>
              </div>

              {/* User */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                <User size={12} className="flex-shrink-0 text-gray-400" />
                <span className="truncate">{question.user_name || 'Anonymous'}</span>
              </div>

              {/* Price */}
              <div className={`
                text-right text-sm font-bold
                ${answered ? 'text-gray-500' : 'text-green-700'}
              `}>
                {formatCurrency(question.price_cents)}
              </div>

              {/* Time */}
              <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                <Clock size={12} className="text-gray-400" />
                <span>{getRelativeTime(question.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionTable;