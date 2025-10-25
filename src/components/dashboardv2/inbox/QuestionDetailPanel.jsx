import React, { useState } from 'react';
import { X, Play, Download, FileText, Image as ImageIcon, Clock, User, Calendar, MoreVertical, MessageSquare, Mail } from 'lucide-react';
import SLAIndicator from './SLAIndicator';
import PriorityBadge from './PriorityBadge';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function QuestionDetailPanel({ question, onClose, onAnswer, isMobile = false }) {
  const [showActions, setShowActions] = useState(false);

  // Helper to safely get attachments array
  const getAttachments = () => {
    if (!question?.attachments) return [];
    if (Array.isArray(question.attachments)) return question.attachments;
    // If it's a string (JSON), try to parse it
    if (typeof question.attachments === 'string') {
      try {
        const parsed = JSON.parse(question.attachments);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const attachments = getAttachments();

  // Helper to get question title
  const getQuestionTitle = (question) => {
    // Priority 1: question_text
    if (question.question_text?.trim()) {
      return question.question_text;
    }
    
    // Priority 2: First line of question_details
    if (question.question_details?.trim()) {
      const firstLine = question.question_details.split('\n')[0].trim();
      return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
    }
    
    // Priority 3: Just show it's a video question
    if (question.video_url) {
      return 'Video Question';
    }
    
    // Last resort: Question ID
    return `Question #${question.id}`;
  };

  if (!question) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Select a question to view details</p>
        </div>
      </div>
    );
  }

  const getRelativeTime = (timestamp) => {
    const now = Date.now() / 1000;
    const createdAt = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
    const diff = now - createdAt;
    
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const formatDate = (timestamp) => {
    const date = new Date((timestamp > 4102444800 ? timestamp / 1000 : timestamp) * 1000);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAnswered = question.status === 'closed' || question.status === 'answered' || question.answered_at;

  return (
    <div className={`
      h-full flex flex-col bg-white w-full
      ${isMobile ? 'fixed inset-0 z-50' : ''}
    `}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isMobile && (
                <button
                  onClick={onClose}
                  className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                {getQuestionTitle(question)}
              </h2>
            </div>
            
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

          <div className="flex-shrink-0 flex items-center gap-3">
            <span className="text-2xl font-black text-green-600">
              {formatCurrency(question.price_cents)}
            </span>
            
            {!isMobile && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close detail"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Video Question */}
          {question.video_url && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Play size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Video Question</h3>
                {question.video_duration && (
                  <span className="text-xs text-gray-500">({Math.floor(question.video_duration / 60)}:{String(question.video_duration % 60).padStart(2, '0')})</span>
                )}
              </div>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video 
                  src={question.video_url} 
                  controls 
                  className="w-full h-full"
                  poster={question.video_thumbnail_url}
                >
                  Your browser does not support video playback.
                </video>
              </div>
            </div>
          )}

          {/* Written Context */}
          {question.question_details && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Written Context</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {question.question_details}
                </p>
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Attachments ({attachments.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="relative group border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors"
                  >
                    {attachment.type?.startsWith('image/') ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name || `Attachment ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <FileText size={32} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-lg"
                        download
                      >
                        <Download size={20} className="text-gray-900" />
                      </a>
                    </div>
                    {attachment.name && (
                      <div className="px-2 py-1 text-xs text-gray-600 truncate bg-white">
                        {attachment.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Metadata */}
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={16} className="text-gray-400" />
                <span className="font-medium">Asker:</span>
                <span className="font-semibold">{question.user_name || 'Anonymous'}</span>
              </div>

              {question.user_email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="font-medium">Email:</span>
                  <span className="text-indigo-600">{question.user_email}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-medium">Asked:</span>
                <span>{formatDate(question.created_at)}</span>
                <span className="text-gray-500">({getRelativeTime(question.created_at)})</span>
              </div>

              {question.sla_hours_snapshot && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span className="font-medium">SLA:</span>
                  <span>{question.sla_hours_snapshot}h</span>
                  {!isAnswered && (
                    <span className="text-gray-500">
                      (expires {formatDate(question.created_at + question.sla_hours_snapshot * 3600)})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Answer (if answered) */}
          {isAnswered && question.answer_text && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={16} className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">Your Answer</h3>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                  {question.answer_text}
                </p>
                {question.answered_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Answered {getRelativeTime(question.answered_at)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        {!isAnswered ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onAnswer}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Play size={20} />
              Answer This Question
            </button>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MoreVertical size={20} />
              </button>

              {showActions && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors">
                    Hide Question
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors text-red-600">
                    Decline & Refund
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              ✓ This question has been answered
            </span>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              View Public Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionDetailPanel;