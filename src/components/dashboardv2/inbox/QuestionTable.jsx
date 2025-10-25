import React from 'react';
import { MessageSquare, User, Clock, CheckCircle, Video, Mic } from 'lucide-react';
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
    // Priority 1: question_text (title field)
    if (question.question_text?.trim()) {
      return question.question_text;
    }
    
    // Priority 2: First line of question_details
    if (question.question_details?.trim()) {
      const firstLine = question.question_details.split('\n')[0].trim();
      return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
    }
    
    // Priority 3: Based on media type
    const hasVideo = question.recording_segments?.some(s => 
      s.metadata?.mode === 'video' || s.metadata?.mode === 'screen' || s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = question.recording_segments?.some(s => s.metadata?.mode === 'audio');
    
    if (hasVideo) return 'Video Question';
    if (hasAudio) return 'Audio Question';
    
    // Last resort: Show Q-ID only (will be displayed separately)
    return 'Question';
  };

  const getMediaIcon = (question) => {
    if (!question.recording_segments || question.recording_segments.length === 0) {
      return null;
    }
    
    const hasVideo = question.recording_segments.some(s => 
      s.metadata?.mode === 'video' || s.metadata?.mode === 'screen' || s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = question.recording_segments.some(s => s.metadata?.mode === 'audio');
    
    if (hasVideo) return <Video size={13} className="text-indigo-600 flex-shrink-0" />;
    if (hasAudio) return <Mic size={13} className="text-indigo-600 flex-shrink-0" />;
    return <MessageSquare size={13} className="text-indigo-600 flex-shrink-0" />;
  };

  const allSelected = questions.length > 0 && selectedQuestions.length === questions.length;
  const someSelected = selectedQuestions.length > 0 && !allSelected;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Table Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-[32px_1fr_180px_90px_70px] gap-2 px-3 py-2.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
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
              className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
          <div>Question</div>
          <div>Asker</div>
          <div className="text-right">Price</div>
          <div className="text-right">Time</div>
        </div>
      </div>

      {/* Table Body - Scrollable */}
      <div className="flex-1 overflow-y-auto w-full">
        {questions.map((question) => {
          const answered = isAnswered(question);
          const isActive = question.id === activeQuestionId;
          const isSelected = selectedQuestions.includes(question.id);
          const title = getQuestionTitle(question);
          const mediaIcon = getMediaIcon(question);

          return (
            <div
              key={question.id}
              onClick={() => onQuestionClick(question)}
              className={`
                grid grid-cols-[32px_1fr_180px_90px_70px] gap-2 px-3 py-2.5
                border-b border-gray-200 cursor-pointer
                transition-all duration-150
                hover:bg-indigo-50/50
                ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-600 pl-[10px]' : ''}
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
                  className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Question Title + Q-ID + Badges */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {mediaIcon}
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className={`
                      text-[13px] leading-tight truncate
                      ${answered ? 'text-gray-600' : 'text-gray-900 font-medium'}
                    `}>
                      {title}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                      Q-{question.id}
                    </span>
                  </div>
                </div>
                
                {/* Inline badges */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <PriorityBadge question={question} />
                  
                  {answered && (
                    <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                      <CheckCircle size={10} />
                      <span className="text-[10px] font-semibold">Done</span>
                    </div>
                  )}
                  
                  {!answered && question.sla_hours_snapshot && question.sla_hours_snapshot > 0 && (
                    <SLAIndicator question={question} compact={true} showLabel={false} />
                  )}
                </div>
              </div>

              {/* Asker - Name + Email */}
              <div className="flex flex-col justify-center text-[11px] min-w-0" title={question.user_email || ''}>
                <div className="flex items-center gap-1 truncate">
                  <User size={10} className="flex-shrink-0 text-gray-400" />
                  <span className="truncate font-medium text-gray-700">
                    {question.user_name || 'Anonymous'}
                  </span>
                </div>
                {question.user_email && question.user_email.trim() && (
                  <span className="truncate text-gray-500 ml-[14px]">
                    {question.user_email}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className={`
                flex items-center justify-end text-[13px] font-bold
                ${answered ? 'text-gray-500' : 'text-green-700'}
              `}>
                {formatCurrency(question.price_cents)}
              </div>

              {/* Time */}
              <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500">
                <Clock size={11} className="text-gray-400" />
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