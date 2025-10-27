// src/components/dashboardv2/inbox/QuestionDetailPanel.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download, FileText, Image as ImageIcon, Clock, User, Calendar, MessageSquare, Mail, Video, Mic, CheckCircle, Link, Loader, X } from 'lucide-react';
import SLAIndicator from './SLAIndicator';
import PriorityBadge from './PriorityBadge';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';
import { copyQuestionLink } from '@/utils/clipboard';
import apiClient from '@/api';

function QuestionDetailPanel({
  question,
  onClose,
  onAnswer,
  onCopyLink,
  onTogglePin,
  isPinned,
  isMobile = false,
  hideCloseButton = false,
  onAcceptOffer,
  onDeclineOffer
}) {
  const [showActions, setShowActions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [answerMediaAssets, setAnswerMediaAssets] = useState([]);

  // Fetch media assets when question changes
  useEffect(() => {
    if (!question || !question.id) {
      setMediaAssets([]);
      return;
    }

    // If question already has recording_segments, use those (already enriched)
    if (question.recording_segments !== undefined) {
      // Even if empty array, it means we already tried to fetch and failed
      console.log(`✨ Using pre-enriched recording_segments for question ${question.id} (${question.recording_segments.length} segments)`);
      setMediaAssets(Array.isArray(question.recording_segments) ? question.recording_segments : []);
      return;
    }

    // If question has media_asset array, use that
    if (question.media_asset && Array.isArray(question.media_asset) && question.media_asset.length > 0) {
      console.log(`📦 Using media_asset array for question ${question.id}`);
      setMediaAssets(question.media_asset);
      return;
    }

    // Only fetch from API if media_asset_id exists and we haven't enriched yet
    if (question.media_asset_id && question.media_asset_id > 0) {
      console.log(`🔄 Need to fetch media_asset ${question.media_asset_id} for question ${question.id}`);
      fetchMediaAssets();
    } else {
      console.log(`❌ No media_asset_id for question ${question.id}`);
      setMediaAssets([]);
    }
  }, [question?.id, question?.media_asset_id]);

  // Fetch answer data when question is answered
  useEffect(() => {
    if (!question || !question.id) {
      setAnswerData(null);
      return;
    }

    const isAnswered = question.status === 'closed' || question.status === 'answered' || question.answered_at;

    if (isAnswered) {
      fetchAnswerData();
    } else {
      setAnswerData(null);
    }
  }, [question?.id, question?.status, question?.answered_at]);

  const fetchMediaAssets = async () => {
    setLoadingMedia(true);
    try {
      console.log(`🎬 Fetching media_asset ${question.media_asset_id} for question ${question.id}`);

      // Fetch media_asset by ID (FK-only architecture)
      const response = await apiClient.get(`/media_asset/${question.media_asset_id}`);
      const mediaAsset = response.data;

      if (!mediaAsset) {
        console.warn(`⚠️ Media_asset ${question.media_asset_id} returned empty data`);
        setMediaAssets([]);
        return;
      }

      console.log(`✅ Successfully fetched media_asset ${question.media_asset_id}:`, mediaAsset);

      // Parse metadata if it's a string
      let metadata = mediaAsset.metadata;
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          console.error('Failed to parse media_asset metadata:', e);
          metadata = null;
        }
      }

      // Transform media_asset into recording_segments format
      let recordingSegments = [];
      if (metadata?.type === 'multi-segment' && metadata?.segments) {
        // Multi-segment media
        recordingSegments = metadata.segments.map(seg => ({
          id: seg.uid,
          url: seg.playback_url,
          duration_sec: seg.duration,
          segment_index: seg.segment_index,
          metadata: { mode: seg.mode },
          provider: 'cloudflare_stream',
          asset_id: seg.uid
        }));
      } else {
        // Single media file (legacy format)
        recordingSegments = [{
          id: mediaAsset.id,
          url: mediaAsset.url,
          duration_sec: mediaAsset.duration_sec,
          segment_index: 0,
          metadata: metadata,
          provider: mediaAsset.provider,
          asset_id: mediaAsset.asset_id
        }];
      }

      setMediaAssets(recordingSegments);
    } catch (error) {
      console.error('Failed to fetch media assets:', error);
      setMediaAssets([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  const fetchAnswerData = async () => {
    setLoadingAnswer(true);
    try {
      console.log(`📝 Fetching answer data for question ${question.id}`);

      const response = await apiClient.get(`/answer?question_id=${question.id}`);
      const data = response.data;

      if (data && data.answer) {
        console.log(`✅ Successfully fetched answer for question ${question.id}:`, data.answer);
        setAnswerData(data.answer);

        // Process answer media_asset if present
        if (data.media_asset) {
          console.log(`🎬 Processing answer media_asset:`, data.media_asset);

          const mediaAsset = data.media_asset;

          // Parse metadata if it's a string
          let metadata = mediaAsset.metadata;
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata);
            } catch (e) {
              console.error('Failed to parse answer media_asset metadata:', e);
              metadata = null;
            }
          }

          // Transform media_asset into recording_segments format
          let recordingSegments = [];
          if (metadata?.type === 'multi-segment' && metadata?.segments) {
            // Multi-segment media
            recordingSegments = metadata.segments.map(seg => ({
              id: seg.uid,
              url: seg.playback_url,
              duration_sec: seg.duration,
              segment_index: seg.segment_index,
              metadata: { mode: seg.mode },
              provider: 'cloudflare_stream',
              asset_id: seg.uid
            }));
          } else {
            // Single media file (legacy format)
            recordingSegments = [{
              id: mediaAsset.id,
              url: mediaAsset.url,
              duration_sec: mediaAsset.duration_sec,
              segment_index: 0,
              metadata: metadata,
              provider: mediaAsset.provider,
              asset_id: mediaAsset.asset_id
            }];
          }

          console.log(`✅ Transformed answer media into ${recordingSegments.length} segments`);
          setAnswerMediaAssets(recordingSegments);
        } else {
          console.log(`❌ No media_asset in answer response`);
          setAnswerMediaAssets([]);
        }
      } else {
        console.warn(`⚠️ No answer data found for question ${question.id}`);
        setAnswerData(null);
        setAnswerMediaAssets([]);
      }
    } catch (error) {
      console.error('Failed to fetch answer data:', error);
      setAnswerData(null);
      setAnswerMediaAssets([]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Helper to get media segments
  const getMediaSegments = () => {
    return mediaAssets;
  };

  // Helper to safely get attachments array
  const getAttachments = () => {
    if (!question?.attachments) return [];
    if (Array.isArray(question.attachments)) return question.attachments;
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

  // Helper to safely get answer attachments array
  const getAnswerAttachments = () => {
    if (!answerData?.attachments) return [];
    if (Array.isArray(answerData.attachments)) return answerData.attachments;
    if (typeof answerData.attachments === 'string') {
      try {
        const parsed = JSON.parse(answerData.attachments);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const mediaSegments = getMediaSegments();
  const attachments = getAttachments();
  const answerAttachments = getAnswerAttachments();

  const getStreamVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/cloudflarestream\.com\/([a-zA-Z0-9]+)\//);
    return match ? match[1] : null;
  };

  const getCustomerCode = (url) => {
    if (!url) return null;
    const match = url.match(/https:\/\/(customer-[a-zA-Z0-9]+)\.cloudflarestream\.com/);
    return match ? match[1] : null;
  };

  const CUSTOMER_CODE_OVERRIDE = 'customer-o9wvts8h9krvlboh';

  const getQuestionTitle = (question) => {
    const titleText = question.title || question.question_text;
    
    if (titleText?.trim()) {
      return titleText;
    }
    
    const detailsText = question.text || question.question_details;
    if (detailsText?.trim()) {
      const firstLine = detailsText.split('\n')[0].trim();
      return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
    }
    
    const hasVideo = mediaSegments.some(s => 
      s.metadata?.mode === 'video' || s.metadata?.mode === 'screen' || s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = mediaSegments.some(s => s.metadata?.mode === 'audio');
    
    if (hasVideo) return 'Video Question';
    if (hasAudio) return 'Audio Question';
    
    return `Question`;
  };

  const getQuestionDetails = (question) => {
    return question.text || question.question_details || '';
  };

  const getAskerName = (question) => {
    return question.user_name || question.name || question.payer_name || 'Anonymous';
  };

  const getAskerEmail = (question) => {
    return question.user_email || question.email || question.payer_email || '';
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
    if (!timestamp) return '';
    const now = Date.now() / 1000;
    const createdAt = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
    const diff = now - createdAt;
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
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
  const isPendingOffer = question.is_pending_offer || question.status === 'pending_offer';
  
  const questionTitle = getQuestionTitle(question);
  const questionDetails = getQuestionDetails(question);
  const askerName = getAskerName(question);
  const askerEmail = getAskerEmail(question);

  return (
    <div className={`
      h-full flex flex-col bg-white w-full overflow-hidden
      ${isMobile ? 'fixed inset-0 z-50' : ''}
    `}>
      {/* Header */}
      <div className={`flex-shrink-0 border-b border-gray-200 bg-white ${isMobile ? 'pt-16' : ''}`}>
        <div className="p-3 lg:p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Left: Back Arrow + Title */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to list"
              >
                <ArrowLeft size={18} />
              </button>
              
              <h2 className="flex-1 text-base lg:text-lg font-bold text-gray-900 line-clamp-2 break-words">
                {questionTitle}
              </h2>
            </div>

            {/* Right: Price only */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`text-lg lg:text-xl font-black whitespace-nowrap ${isAnswered ? 'text-gray-500' : 'text-green-600'}`}>
                {formatCurrency(question.price_cents)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Q-ID + Badges */}
        <div className="px-3 lg:px-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-mono">
              Q-{question.id}
            </span>
            <PriorityBadge question={question} />
            {!isAnswered && question.sla_hours_snapshot && question.sla_hours_snapshot > 0 && (
              <SLAIndicator question={question} showLabel={true} />
            )}
            {isAnswered && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">
                ✓ Answered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-3 lg:p-4 space-y-4">
          
          {/* Question Metadata */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Question Details</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={14} className="text-gray-400 flex-shrink-0" />
                <span className="font-medium min-w-[60px] flex-shrink-0">Asker:</span>
                <span className="font-semibold truncate">{askerName}</span>
              </div>

              {askerEmail && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium min-w-[60px] flex-shrink-0">Email:</span>
                  <a 
                    href={`mailto:${askerEmail}`}
                    className="text-indigo-600 hover:text-indigo-700 hover:underline truncate"
                  >
                    {askerEmail}
                  </a>
                </div>
              )}

              {question.created_at && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Calendar size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium min-w-[60px] flex-shrink-0">Asked:</span>
                  <div className="flex flex-col">
                    <span>{formatDate(question.created_at)}</span>
                    <span className="text-gray-500 text-xs">({getRelativeTime(question.created_at)})</span>
                  </div>
                </div>
              )}

              {question.sla_hours_snapshot && question.sla_hours_snapshot > 0 && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Clock size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium min-w-[60px] flex-shrink-0">SLA:</span>
                  <div className="flex flex-col">
                    <span>{question.sla_hours_snapshot}h response time</span>
                    {!isAnswered && question.created_at && (
                      <span className="text-orange-600 font-medium text-xs">
                        Expires {formatDate(question.created_at + question.sla_hours_snapshot * 3600)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Written Context/Details */}
          {questionDetails && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={15} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">Question Text</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {questionDetails}
                </p>
              </div>
            </div>
          )}

          {/* Media Loading Indicator */}
          {loadingMedia && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-sm text-gray-600">Loading media...</span>
            </div>
          )}

          {/* Media Segments */}
          {!loadingMedia && mediaSegments && mediaSegments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Video size={15} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Media Recordings ({mediaSegments.length})
                </h3>
              </div>
              <div className="space-y-3">
                {mediaSegments
                  .sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0))
                  .map((segment, index) => {
                    const metadata = typeof segment.metadata === 'string' 
                      ? JSON.parse(segment.metadata) 
                      : segment.metadata || {};
                    
                    const isVideo = metadata.mode === 'video' ||
                                    metadata.mode === 'screen' ||
                                    metadata.mode === 'screen-camera' ||
                                    segment.provider === 'cloudflare_stream' ||
                                    segment.url?.includes('cloudflarestream.com');
                    const isAudio = metadata.mode === 'audio' || !isVideo;

                    const videoId = isVideo ? (segment.asset_id || getStreamVideoId(segment.url)) : null;
                    const extractedCustomerCode = isVideo ? getCustomerCode(segment.url) : null;
                    const customerCode = CUSTOMER_CODE_OVERRIDE || extractedCustomerCode;
                    
                    const modeLabel = metadata.mode === 'screen' ? 'Screen Recording' :
                                     metadata.mode === 'screen-camera' ? 'Screen + Camera' :
                                     isVideo ? 'Video' : 'Audio';
                    
                    const duration = segment.duration_sec || segment.duration || 0;

                    return (
                      <div key={segment.id || index} className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="px-3 py-2 bg-gray-800 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-300">
                            {mediaSegments.length > 1 ? `Part ${index + 1} - ${modeLabel}` : modeLabel}
                          </span>
                          {duration > 0 && (
                            <span className="text-xs text-gray-400">
                              {isVideo ? '🎥' : '🎤'} {Math.floor(duration)}s
                            </span>
                          )}
                        </div>

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
                          <div className="p-3 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2 mb-2 text-gray-300">
                              <Mic size={15} />
                              <span className="text-sm font-medium">{modeLabel}</span>
                            </div>
                            <audio controls className="w-full max-w-md" preload="metadata">
                              <source src={segment.url} type="audio/webm" />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-400 text-sm">
                            Media preview unavailable
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Question File Attachments */}
          {attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={15} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Question Attachments ({attachments.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="relative group border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors"
                  >
                    {attachment.type?.startsWith('image/') ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name || `Attachment ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                        <FileText size={28} className="text-gray-400" />
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
                        <Download size={18} className="text-gray-900" />
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
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={15} className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">Your Answer</h3>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap text-sm break-words">
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

          {/* Answer Media Segments */}
          {isAnswered && answerMediaAssets && answerMediaAssets.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Video size={15} className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Answer Media Recordings ({answerMediaAssets.length})
                </h3>
              </div>
              <div className="space-y-3">
                {answerMediaAssets
                  .sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0))
                  .map((segment, index) => {
                    const metadata = typeof segment.metadata === 'string'
                      ? JSON.parse(segment.metadata)
                      : segment.metadata || {};

                    const isVideo = metadata.mode === 'video' ||
                                    metadata.mode === 'screen' ||
                                    metadata.mode === 'screen-camera' ||
                                    segment.provider === 'cloudflare_stream' ||
                                    segment.url?.includes('cloudflarestream.com');
                    const isAudio = metadata.mode === 'audio' || !isVideo;

                    const videoId = isVideo ? (segment.asset_id || getStreamVideoId(segment.url)) : null;
                    const extractedCustomerCode = isVideo ? getCustomerCode(segment.url) : null;
                    const customerCode = CUSTOMER_CODE_OVERRIDE || extractedCustomerCode;

                    const modeLabel = metadata.mode === 'screen' ? 'Screen Recording' :
                                     metadata.mode === 'screen-camera' ? 'Screen + Camera' :
                                     isVideo ? 'Video' : 'Audio';

                    const duration = segment.duration_sec || segment.duration || 0;

                    return (
                      <div key={segment.id || index} className="bg-gray-900 rounded-lg overflow-hidden border-2 border-green-500">
                        <div className="px-3 py-2 bg-green-800 flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            {answerMediaAssets.length > 1 ? `Part ${index + 1} - ${modeLabel}` : modeLabel}
                          </span>
                          {duration > 0 && (
                            <span className="text-xs text-green-200">
                              {isVideo ? '🎥' : '🎤'} {Math.floor(duration)}s
                            </span>
                          )}
                        </div>

                        {isVideo && videoId && customerCode ? (
                          <div className="w-full aspect-video bg-black">
                            <iframe
                              src={`https://${customerCode}.cloudflarestream.com/${videoId}/iframe`}
                              style={{ border: 'none', width: '100%', height: '100%' }}
                              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                              allowFullScreen={true}
                              title={`Answer video segment ${index + 1}`}
                            />
                          </div>
                        ) : isAudio && segment.url ? (
                          <div className="p-3 flex flex-col items-center justify-center bg-green-900">
                            <div className="flex items-center gap-2 mb-2 text-green-200">
                              <Mic size={15} />
                              <span className="text-sm font-medium">{modeLabel}</span>
                            </div>
                            <audio controls className="w-full max-w-md" preload="metadata">
                              <source src={segment.url} type="audio/webm" />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-400 text-sm">
                            Media preview unavailable
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Answer File Attachments */}
          {isAnswered && answerAttachments.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={15} className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Answer Attachments ({answerAttachments.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {answerAttachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="relative group border border-green-200 rounded-lg overflow-hidden hover:border-green-400 transition-colors"
                  >
                    {attachment.type?.startsWith('image/') ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name || `Answer Attachment ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 bg-green-50 flex items-center justify-center">
                        <FileText size={28} className="text-green-400" />
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
                        <Download size={18} className="text-gray-900" />
                      </a>
                    </div>
                    {attachment.name && (
                      <div className="px-2 py-1 text-xs text-gray-600 truncate bg-white border-t border-green-200">
                        {attachment.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom padding for mobile */}
          <div className="h-20 lg:h-4"></div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-3 lg:p-4 border-t border-gray-200 bg-gray-50">
        {isPendingOffer ? (
          <div className="flex flex-col gap-2">
            {/* Pending Offer Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-purple-700 font-bold text-sm">🎯 Deep Dive Offer</span>
              </div>
              <p className="text-xs text-purple-600">
                Accept this offer to start answering. The SLA timer will begin immediately.
              </p>
              {question.asker_message && (
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Message from asker:</p>
                  <p className="text-xs text-gray-700 italic">"{question.asker_message}"</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onAcceptOffer && onAcceptOffer(question)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
              >
                <CheckCircle size={18} />
                <span>Accept Offer</span>
              </button>

              <button
                onClick={() => onDeclineOffer && onDeclineOffer(question)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                <X size={18} />
                <span>Decline Offer</span>
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={() => {
                copyQuestionLink(question.id).then(() => {
                  setCopySuccess(true);
                  if (onCopyLink) onCopyLink();
                  setTimeout(() => setCopySuccess(false), 2000);
                });
              }}
              className="w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Link size={14} />
              <span>{copySuccess ? 'Copied!' : 'Copy Question Link'}</span>
            </button>
          </div>
        ) : !isAnswered ? (
          <div className="flex flex-col gap-2">
            {/* Primary action: Answer */}
            <button
              onClick={onAnswer}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
            >
              <Play size={18} />
              <span>Answer This Question</span>
            </button>

            {/* Secondary action: Copy link */}
            <button
              onClick={() => {
                copyQuestionLink(question.id).then(() => {
                  setCopySuccess(true);
                  if (onCopyLink) onCopyLink();
                  setTimeout(() => setCopySuccess(false), 2000);
                });
              }}
              className="w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Link size={14} />
              <span>{copySuccess ? 'Copied!' : 'Copy Question Link'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle size={15} className="text-green-600" />
              <span>This question has been answered</span>
            </div>
            <button
              onClick={() => {
                copyQuestionLink(question.id).then(() => {
                  setCopySuccess(true);
                  if (onCopyLink) onCopyLink();
                  setTimeout(() => setCopySuccess(false), 2000);
                });
              }}
              className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Link size={14} />
              <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionDetailPanel;