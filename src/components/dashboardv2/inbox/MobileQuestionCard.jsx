import React from 'react';
import { User, Clock, CheckCircle, MessageSquare, ChevronRight, Mail, Video, Mic } from 'lucide-react';
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
    // Try both field formats (old dashboard uses 'title', new uses 'question_text')
    const titleText = question.title || question.question_text;
    
    if (titleText?.trim()) {
      return titleText;
    }
    
    // Priority 2: First line of text/question_details
    const detailsText = question.text || question.question_details;
    if (detailsText?.trim()) {
      const firstLine = detailsText.split('\n')[0].trim();
      return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
    }
    
    // Priority 3: Based on media type
    const hasVideo = question.recording_segments?.some(s => 
      s.metadata?.mode === 'video' || s.metadata?.mode === 'screen' || s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = question.recording_segments?.some(s => s.metadata?.mode === 'audio');
    
    if (hasVideo) return 'Video Question';
    if (hasAudio) return 'Audio Question';
    
    // Last resort
    return 'Question';
  };

  const getMediaIcon = () => {
    if (!question.recording_segments || question.recording_segments.length === 0) {
      return null;
    }
    
    const hasVideo = question.recording_segments.some(s => 
      s.metadata?.mode === 'video' || s.metadata?.mode === 'screen' || s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = question.recording_segments.some(s => s.metadata?.mode === 'audio');
    
    if (hasVideo) return <Video size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />;
    if (hasAudio) return <Mic size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />;
    return <MessageSquare size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />;
  };

  const getAskerName = (question) => {
    return question.user_name || question.name || 'Anonymous';
  };

  const getAskerEmail = (question) => {
    return question.user_email || question.email || '';
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
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(question.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
          style={{ touchAction: 'auto' }}
        />
        
        <div className="flex-1 min-w-0 pr-6">
          {/* Question Title + Q-ID */}
          <div className="flex items-start gap-1.5 mb-2">
            {getMediaIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <h3 className={`text-sm font-medium flex-1 min-w-0 ${isAnswered ? 'text-gray-600' : 'text-gray-900'}`}>
                  {getQuestionTitle(question)}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">Q-{question.id}</span>
              </div>
            </div>
          </div>
          
          {/* Asker Info - Name + Email */}
          <div className="flex flex-col gap-0.5 mb-2 text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <User size={11} className="flex-shrink-0 text-gray-400" />
              <span className="font-medium truncate">{getAskerName(question)}</span>
            </div>
            {getAskerEmail(question) && (
              <div className="flex items-center gap-1 text-gray-500 ml-[15px]">
                <Mail size={10} className="flex-shrink-0" />
                <span className="truncate text-[11px]">{getAskerEmail(question)}</span>
              </div>
            )}
          </div>
          
          {/* Bottom Row: Price, Time, Badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Price */}
              <div className={`text-sm font-bold ${isAnswered ? 'text-gray-500' : 'text-green-700'}`}>
                {formatCurrency(question.price_cents)}
              </div>
              
              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={11} />
                <span>{getRelativeTime(question.created_at)}</span>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <PriorityBadge question={question} />
              {!isAnswered && question.sla_hours_snapshot && question.sla_hours_snapshot > 0 && (
                <SLAIndicator question={question} showLabel={false} compact={true} />
              )}
              {isAnswered && (
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                  <CheckCircle size={10} />
                  <span className="text-[10px] font-semibold">Done</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chevron indicator */}
      <ChevronRight 
        size={16} 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

export default MobileQuestionCard;