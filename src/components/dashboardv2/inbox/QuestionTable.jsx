import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, User, Clock, CheckCircle, Video, Mic, GripVertical } from 'lucide-react';
import SLAIndicator from './SLAIndicator';
import PriorityBadge from './PriorityBadge';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

// Column width configuration (in pixels)
const DEFAULT_COLUMN_WIDTHS = {
  checkbox: 40,
  question: 380,
  asker: 260,  // Increased for email display
  price: 100,
  time: 90,
};

// Throttle utility for better performance
const throttle = (fn, ms) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
};

function QuestionTable({ 
  questions, 
  selectedQuestions = [],
  activeQuestionId,
  onSelectQuestion,
  onQuestionClick,
  onSelectAll
}) {
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [resizing, setResizing] = useState(null);
  const tableRef = useRef(null);

  // Throttled resize handler for better performance
  const handleResize = useCallback(
    throttle((clientX) => {
      if (!resizing) return;
      
      const column = resizing.column;
      const startX = resizing.startX;
      const startWidth = resizing.startWidth;
      const diff = clientX - startX;
      const newWidth = Math.max(80, startWidth + diff);

      setColumnWidths(prev => ({
        ...prev,
        [column]: newWidth
      }));
    }, 16), // ~60fps
    [resizing]
  );

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      handleResize(e.clientX);
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, handleResize]);

  const startResize = (column, e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({
      column,
      startX: e.clientX,
      startWidth: columnWidths[column]
    });
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now() / 1000;
    const createdAt = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
    const diff = now - createdAt;
    
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const isAnswered = (q) => q.status === 'closed' || q.status === 'answered' || q.answered_at;

  const getQuestionTitle = (question) => {
    const titleText = question.title || question.question_text;
    
    if (titleText?.trim()) {
      return titleText;
    }
    
    const detailsText = question.text || question.question_details;
    if (detailsText?.trim()) {
      const firstLine = detailsText.split('\n')[0].trim();
      return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
    }
    
    const hasVideo = question.recording_segments?.some(s => 
      s.metadata?.mode === 'video' || s.metadata?.mode === 'screen' || s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = question.recording_segments?.some(s => s.metadata?.mode === 'audio');
    
    if (hasVideo) return 'Video Question';
    if (hasAudio) return 'Audio Question';
    
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

  const getAskerName = (question) => {
    return question.user_name || question.name || 'Anonymous';
  };

  const getAskerEmail = (question) => {
    return question.user_email || question.email || '';
  };

  const allSelected = questions.length > 0 && selectedQuestions.length === questions.length;
  const someSelected = selectedQuestions.length > 0 && !allSelected;

  // Calculate grid template columns
  const gridTemplateColumns = `${columnWidths.checkbox}px ${columnWidths.question}px ${columnWidths.asker}px ${columnWidths.price}px ${columnWidths.time}px`;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" ref={tableRef}>
      {/* 🟢 DEBUG BANNER - REMOVE AFTER VERIFICATION */}
      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 text-center">
        ✓ DEPLOYED v3.0 - QuestionTable FIXED (Email + Throttle + Resize + No zeros)
      </div>

      {/* Table Header - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
        <div 
          className="grid gap-2 px-3 py-2.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wide"
          style={{ gridTemplateColumns }}
        >
          {/* Checkbox Column */}
          <div className="flex items-center justify-center relative">
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

          {/* Question Column */}
          <div className="relative flex items-center pr-2">
            <span>Question</span>
            <button
              onMouseDown={(e) => startResize('question', e)}
              className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize flex items-center justify-center hover:bg-indigo-100 group transition-colors"
              title="Drag to resize column"
            >
              <GripVertical size={14} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>

          {/* Asker Column */}
          <div className="relative flex items-center pr-2">
            <span>Asker</span>
            <button
              onMouseDown={(e) => startResize('asker', e)}
              className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize flex items-center justify-center hover:bg-indigo-100 group transition-colors"
              title="Drag to resize column"
            >
              <GripVertical size={14} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>

          {/* Price Column */}
          <div className="relative flex items-center justify-end pr-2">
            <span>Price</span>
            <button
              onMouseDown={(e) => startResize('price', e)}
              className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize flex items-center justify-center hover:bg-indigo-100 group transition-colors"
              title="Drag to resize column"
            >
              <GripVertical size={14} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>

          {/* Time Column */}
          <div className="relative flex items-center justify-end pr-2">
            <span>Time</span>
            <button
              onMouseDown={(e) => startResize('time', e)}
              className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize flex items-center justify-center hover:bg-indigo-100 group transition-colors"
              title="Drag to resize column"
            >
              <GripVertical size={14} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>
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
          const askerName = getAskerName(question);
          const askerEmail = getAskerEmail(question);

          return (
            <div
              key={question.id}
              onClick={() => onQuestionClick(question)}
              className={`
                grid gap-2 px-3 py-2.5
                border-b border-gray-200 cursor-pointer
                transition-all duration-150
                hover:bg-indigo-50/50
                ${isActive ? 'bg-indigo-50 border-l-4 border-l-indigo-600 pl-[10px]' : ''}
                ${isSelected && !isActive ? 'bg-blue-50/50' : ''}
                ${answered ? 'opacity-60' : ''}
              `}
              style={{ gridTemplateColumns }}
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
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {mediaIcon}
                  <div className="flex items-baseline gap-1.5 min-w-0 flex-1">
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

              {/* Asker - Name + Email on separate lines */}
              <div className="flex flex-col justify-center text-[11px] min-w-0 overflow-hidden" title={`${askerName}${askerEmail ? `\n${askerEmail}` : ''}`}>
                <div className="flex items-center gap-1 truncate">
                  <User size={10} className="flex-shrink-0 text-gray-400" />
                  <span className="truncate font-medium text-gray-700">
                    {askerName}
                  </span>
                </div>
                {askerEmail && (
                  <span className="truncate text-gray-500 ml-[14px] text-[10px]">
                    {askerEmail}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className={`
                flex items-center justify-end text-[13px] font-bold overflow-hidden
                ${answered ? 'text-gray-500' : 'text-green-700'}
              `}>
                {formatCurrency(question.price_cents)}
              </div>

              {/* Time */}
              <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500 overflow-hidden">
                <Clock size={11} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{getRelativeTime(question.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resize Overlay */}
      {resizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize bg-indigo-500/5" />
      )}
    </div>
  );
}

export default QuestionTable;