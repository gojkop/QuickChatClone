// src/components/dashboardv2/inbox/QuestionPreview.jsx
// Hover preview card for questions

import React from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, FileText, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function QuestionPreview({ question, position }) {
  if (!question) return null;

  const getMediaIcon = () => {
    const segments = question.recording_segments || question.media_asset || [];
    const hasVideo = segments.some(s => 
      s.metadata?.mode === 'video' || s.metadata?.mode === 'screen' || s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = segments.some(s => s.metadata?.mode === 'audio');

    if (hasVideo) return <Video size={14} className="text-indigo-600" />;
    if (hasAudio) return <Mic size={14} className="text-indigo-600" />;
    return <FileText size={14} className="text-gray-400" />;
  };

  const getQuestionText = () => {
    const text = question.text || question.question_details || question.question_text || '';
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now() / 1000;
    const createdAt = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
    const diff = now - createdAt;
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 pointer-events-none"
      style={{
        left: position.x + 20,
        top: position.y,
        maxWidth: 'calc(100vw - 40px)'
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        {getMediaIcon()}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400 font-mono">Q-{question.id}</span>
            {question.sla_hours_snapshot > 0 && (
              <span className="text-xs text-orange-600 flex items-center gap-1">
                <Clock size={12} />
                {question.sla_hours_snapshot}h SLA
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {question.title || question.question_text || 'Question'}
          </h4>
        </div>
      </div>

      {/* Preview Text */}
      {getQuestionText() && (
        <p className="text-xs text-gray-600 line-clamp-3 mb-3">
          {getQuestionText()}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 flex items-center gap-1">
          {getRelativeTime(question.created_at)}
        </span>
        <span className="font-bold text-green-600 flex items-center gap-1">
          <DollarSign size={12} />
          {formatCurrency(question.price_cents)}
        </span>
      </div>
    </motion.div>
  );
}

export default QuestionPreview;