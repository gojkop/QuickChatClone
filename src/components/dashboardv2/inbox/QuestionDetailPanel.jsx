import React, { useState } from 'react';
import { X, Play, Download, FileText, Image as ImageIcon, Clock, User, Calendar, MoreVertical, MessageSquare, Mail, Video, Mic } from 'lucide-react';
import SLAIndicator from './SLAIndicator';
import PriorityBadge from './PriorityBadge';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function QuestionDetailPanel({ question, onClose, onAnswer, isMobile = false }) {
  const [showActions, setShowActions] = useState(false);

  // Helper to get media segments
  const getMediaSegments = () => {
    return question?.recording_segments || question?.media_asset || [];
  };

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

  const mediaSegments = getMediaSegments();
  const attachments = getAttachments();

  // Helper to get Cloudflare Stream video ID
  const getStreamVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)\//);
    return match ? match[1] : null;
  };

  // Helper to get customer code
  const getCustomerCode = (url) => {
    if (!url) return null;
    const match = url.match(/https:\/\/(customer-[a-zA-Z0-9]+)\.cloudflarestream\.com/);
    return match ? match[1] : null;
  };

  const CUSTOMER_CODE_OVERRIDE = 'customer-o9wvts8h9krvlboh';

  // Helper to get question title (try both field formats)
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
      return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
    }
    
    // Priority 3: Based on media type
    const hasVideo = mediaSegments.some(s => 
      s.metadata?.mode === 'video' || s.metadata?.mode === 'screen' || s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = mediaSegments.some(s => s.metadata?.mode === 'audio');
    
    if (hasVideo) return 'Video Question';
    if (hasAudio) return 'Audio Question';
    
    // Last resort: Question ID
    return `Question #${question.id}`;
  };

  // Helper to get question details text
  const getQuestionDetails = (question) => {
    return question.text || question.question_details || '';
  };

  // Helper to get asker info
  const getAskerName = (question) => {
    return question.user_name || question.name || 'Anonymous';
  };

  const getAskerEmail = (question) => {
    return question.user_email || question.email || '';
  };

  if (!question) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 bg-gray-50">
        <MessageSquare size={64} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-700">Select a question to view details</p>
        <p className="text-sm text-gray-500 mt-1">Choose from the list on the left</p>
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
  
  const questionTitle = getQuestionTitle(question);
  const questionDetails = getQuestionDetails(question);
  const askerName = getAskerName(question);
  const askerEmail = getAskerEmail(question);

  return (
    <div className={`
      h-full flex flex-col bg-white w-full
      ${isMobile ? 'fixed inset-0 z-50' : ''}
    `}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isMobile && (
                <button
                  onClick={onClose}
                  className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              )}
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 line-clamp-2 flex-1">
                {questionTitle}
              </h2>
              <span className="text-sm text-gray-400 font-mono flex-shrink-0">Q-{question.id}</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge question={question} />
              {!isAnswered && question.sla_hours_snapshot && question.sla_hours_snapshot > 0 && (
                <SLAIndicator question={question} showLabel={true} />
              )}
              {isAnswered && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">
                  ✓ Answered
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="text-right">
              <div className={`text-2xl lg:text-3xl font-black ${isAnswered ? 'text-gray-500' : 'text-green-600'}`}>
                {formatCurrency(question.price_cents)}
              </div>
            </div>
            
            {!isMobile && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close detail"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6">
          
          {/* Question Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Question Details</h3>
            <div className="grid grid-cols-1 gap-2.5 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={15} className="text-gray-400 flex-shrink-0" />
                <span className="font-medium min-w-[70px]">Asker:</span>
                <span className="font-semibold">{askerName}</span>
              </div>

              {askerEmail && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium min-w-[70px]">Email:</span>
                  <a 
                    href={`mailto:${askerEmail}`}
                    className="text-indigo-600 hover:text-indigo-700 hover:underline truncate"
                  >
                    {askerEmail}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                <span className="font-medium min-w-[70px]">Asked:</span>
                <span>{formatDate(question.created_at)}</span>
                <span className="text-gray-500 text-xs">({getRelativeTime(question.created_at)})</span>
              </div>

              {question.sla_hours_snapshot && question.sla_hours_snapshot > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium min-w-[70px]">SLA:</span>
                  <span>{question.sla_hours_snapshot}h response time</span>
                  {!isAnswered && (
                    <span className="text-orange-600 font-medium text-xs">
                      (expires {formatDate(question.created_at + question.sla_hours_snapshot * 3600)})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Written Context/Details */}
          {questionDetails && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Question Text</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {questionDetails}
                </p>
              </div>
            </div>
          )}

          {/* Media Segments (Videos/Audio/Screen Recordings) */}
          {mediaSegments && mediaSegments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Video size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Media Recordings ({mediaSegments.length})
                </h3>
              </div>
              <div className="space-y-3">
                {mediaSegments
                  .sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0))
                  .map((segment, index) => {
                    const isVideo = segment.metadata?.mode === 'video' ||
                                    segment.metadata?.mode === 'screen' ||
                                    segment.metadata?.mode === 'screen-camera' ||
                                    segment.url?.includes('cloudflarestream.com');
                    const isAudio = segment.metadata?.mode === 'audio' ||
                                    segment.url?.includes('.webm') ||
                                    !isVideo;

                    const videoId = isVideo ? getStreamVideoId(segment.url) : null;
                    const extractedCustomerCode = isVideo ? getCustomerCode(segment.url) : null;
                    const customerCode = CUSTOMER_CODE_OVERRIDE || extractedCustomerCode;
                    
                    const modeLabel = segment.metadata?.mode === 'screen' ? 'Screen Recording' :
                                     segment.metadata?.mode === 'screen-camera' ? 'Screen + Camera' :
                                     isVideo ? 'Video' : 'Audio';

                    return (
                      <div key={segment.id || index} className="bg-gray-900 rounded-lg overflow-hidden">
                        {mediaSegments.length > 1 && (
                          <div className="px-4 py-2.5 bg-gray-800 flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-300">
                              Part {index + 1} - {modeLabel}
                            </span>
                            {(segment.duration_sec || segment.duration) && (segment.duration_sec > 0 || segment.duration > 0) && (
                              <span className="text-xs text-gray-400">
                                {isVideo ? '🎥' : '🎤'} {segment.duration_sec || segment.duration}s
                              </span>
                            )}
                          </div>
                        )}

                        {isVideo && videoId && customerCode ? (
                          <div className="w-full aspect-video bg-black">
                            <iframe
                              src={`https://${customerCode}.cloudflarestream.com/${videoId}/iframe`}
                              style={{ border: 'none', width: '100%', height: '100%' }}
                              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                              allowFullScreen={true}
                              title={`Video segment ${index + 1}`}
                            />
                          </div>
                        ) : isAudio && segment.url ? (
                          <div className="p-4 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2 mb-2 text-gray-300">
                              <Mic size={16} />
                              <span className="text-sm font-medium">{modeLabel}</span>
                            </div>
                            <audio controls className="w-full max-w-md" preload="metadata">
                              <source src={segment.url} type="audio/webm" />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* File Attachments */}
          {attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  File Attachments ({attachments.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={20} className="text-gray-900" />
                      </a>
                    </div>
                    {attachment.name && (
                      <div className="px-2 py-1 text-xs text-gray-600 truncate bg-white border-t border-gray-200">
                        {attachment.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer (if answered) */}
          {isAnswered && question.answer_text && question.answer_text.trim() && (
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
      <div className="flex-shrink-0 p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
        {!isAnswered ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onAnswer}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
            >
              <Play size={20} />
              <span>Answer This Question</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="More actions"
              >
                <MoreVertical size={20} />
              </button>

              {showActions && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors rounded-t-lg">
                      Hide Question
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors text-red-600 rounded-b-lg">
                      Decline & Refund
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-600" />
              <span>This question has been answered</span>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
              View Public Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionDetailPanel;
