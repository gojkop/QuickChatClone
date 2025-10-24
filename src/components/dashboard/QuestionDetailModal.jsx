// src/components/dashboard/QuestionDetailModal.jsx
// FIXED: Answer Recorder scroll containment + compact mobile header

import React, { useState, useEffect } from 'react';
import apiClient from '@/api';
import JSZip from 'jszip';
import AnswerRecorder from './AnswerRecorder';
import AnswerReviewModal from './AnswerReviewModal';
import QuestionContextBanner from './QuestionContextBanner';
import ProgressStepper from '@/components/common/ProgressStepper';

const ANSWER_STEPS = [
  { 
    id: 1, 
    name: 'View Question', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    description: 'Review details' 
  },
  { 
    id: 2, 
    name: 'Answer', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    description: 'Record response' 
  },
  { 
    id: 3, 
    name: 'Review', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Submit answer' 
  }
];

function QuestionDetailModal({ isOpen, onClose, question, userId, onAnswerSubmitted, expertProfile }) {
  const [showAnswerRecorder, setShowAnswerRecorder] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAnswerSection, setShowAnswerSection] = useState(false);
  const [answerDetails, setAnswerDetails] = useState(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  const isDeclined = question?.pricing_status === 'offer_declined' || question?.status === 'declined';
  const isPending = question?.status === 'paid' && !question?.answered_at && !isDeclined;
  const isAnswered = question?.status === 'answered' || question?.status === 'closed' || !!question?.answered_at;

  useEffect(() => {
    if (isOpen && isAnswered && question?.id) {
      fetchAnswerDetails();
    } else {
      setAnswerDetails(null);
    }
    
    if (isOpen) {
      setCurrentStep(1);
      setShowAnswerRecorder(false);
      setShowReviewModal(false);
    }
  }, [isOpen, isAnswered, question?.id]);

  useEffect(() => {
    if (showReviewModal) {
      setCurrentStep(3);
    } else if (showAnswerRecorder) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [showAnswerRecorder, showReviewModal]);

  const fetchAnswerDetails = async () => {
    try {
      setIsLoadingAnswer(true);
      const response = await apiClient.get('/answer', {
        params: { question_id: question.id }
      });
      
      const rawData = response.data;
      const answerData = rawData.answer;
      const mediaAsset = rawData.media_asset;
      
      const transformedAnswer = {
        id: answerData.id,
        created_at: answerData.created_at,
        sent_at: answerData.sent_at,
        text: answerData.text_response || '',
        rating: answerData.rating || 0,
        feedback_text: answerData.feedback_text || '',
        allow_testimonial: answerData.allow_testimonial || false,
        feedback_at: answerData.feedback_at,
        media_assets: (() => {
          if (!mediaAsset) return [];
          
          if (mediaAsset.metadata?.type === 'multi-segment' && mediaAsset.metadata?.segments) {
            return mediaAsset.metadata.segments.map(segment => ({
              id: segment.uid,
              url: segment.playback_url,
              duration_sec: segment.duration,
              segment_index: segment.segment_index,
              metadata: { mode: segment.mode }
            }));
          }
          
          return [{
            id: mediaAsset.id,
            url: mediaAsset.url,
            duration_sec: mediaAsset.duration_sec,
            segment_index: 0,
            metadata: mediaAsset.metadata
          }];
        })(),
        attachments: (() => {
          try {
            if (answerData.attachments && typeof answerData.attachments === 'string' && answerData.attachments.trim()) {
              return JSON.parse(answerData.attachments);
            } else if (Array.isArray(answerData.attachments)) {
              return answerData.attachments;
            }
          } catch (e) {
            console.warn('Failed to parse answer attachments:', e);
          }
          return [];
        })()
      };
      
      setAnswerDetails(transformedAnswer);
    } catch (err) {
      console.error('❌ Error fetching answer details:', err);
      setAnswerDetails(null);
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  if (!isOpen || !question) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getDeliveryTime = () => {
    if (!answerDetails?.created_at || !question?.created_at) return '';
    const asked = new Date(question.created_at);
    const answered = new Date(answerDetails.created_at);
    const diffHours = Math.floor((answered - asked) / (1000 * 60 * 60));
    if (diffHours < 1) return 'under 1h';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const handleStartAnswer = () => {
    setShowAnswerRecorder(true);
    setCurrentStep(2);
  };

  const handleRecorderReady = (data) => {
    setAnswerData(data);
    setShowReviewModal(true);
    setCurrentStep(3);
  };

  const handleRecorderCancel = () => {
    setShowAnswerRecorder(false);
    setCurrentStep(1);
  };

  const handleEdit = () => {
    setShowReviewModal(false);
    setCurrentStep(2);
  };

  const handleSubmitSuccess = (result) => {
    setShowReviewModal(false);
    setShowAnswerRecorder(false);
    setAnswerData(null);
    setCurrentStep(1);

    if (onAnswerSubmitted) {
      onAnswerSubmitted(question.id);
    }

    onClose();
  };

  // Download question media and attachments as ZIP
  const downloadQuestionAsZip = async () => {
    try {
      setIsDownloading(true);
      const zip = new JSZip();

      console.log('📦 Creating question download ZIP...');

      const allItems = [];

      // Add media segments (videos and audio)
      if (mediaSegments && mediaSegments.length > 0) {
        for (const [index, segment] of mediaSegments.entries()) {
          const isVideo = segment.metadata?.mode === 'video' ||
                         segment.metadata?.mode === 'screen' ||
                         segment.metadata?.mode === 'screen-camera' ||
                         segment.url?.includes('cloudflarestream.com');

          const isAudio = segment.metadata?.mode === 'audio';

          let downloadUrl = segment.url;
          let fileName;

          // For Cloudflare Stream videos, use the downloads endpoint
          if (isVideo && segment.url?.includes('cloudflarestream.com')) {
            const videoId = getStreamVideoId(segment.url);
            if (videoId) {
              const streamDownloadUrl = `https://${CUSTOMER_CODE_OVERRIDE}.cloudflarestream.com/${videoId}/downloads/default.mp4`;
              downloadUrl = `/api/media/download-video?url=${encodeURIComponent(streamDownloadUrl)}`;
              fileName = `part${index + 1}-${segment.metadata?.mode || 'video'}.mp4`;

              allItems.push({
                url: downloadUrl,
                name: fileName,
                type: 'video'
              });
            }
          } else if (isAudio && segment.url) {
            // Audio files - proxy through backend
            downloadUrl = `/api/media/download-audio?url=${encodeURIComponent(segment.url)}`;
            fileName = `part${index + 1}-audio.webm`;

            allItems.push({
              url: downloadUrl,
              name: fileName,
              type: 'audio'
            });
          }
        }
      }

      // Add attachments
      let attachments = [];
      try {
        if (typeof question.attachments === 'string' && question.attachments.trim()) {
          attachments = JSON.parse(question.attachments);
        } else if (Array.isArray(question.attachments)) {
          attachments = question.attachments;
        }
      } catch (e) {
        console.error('Failed to parse attachments:', e);
      }

      for (const file of attachments) {
        allItems.push({
          url: file.url,
          name: file.name || file.filename || `attachment-${Date.now()}`,
          type: 'attachment'
        });
      }

      // Download all files and add to ZIP
      for (const item of allItems) {
        try {
          const response = await fetch(item.url);
          const blob = await response.blob();
          zip.file(item.name, blob);
          console.log(`✅ Added to ZIP: ${item.name}`);
        } catch (err) {
          console.error(`❌ Failed to download ${item.name}:`, err);
        }
      }

      // Generate ZIP file
      console.log('🗜️ Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Download ZIP
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `question-${question.id}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`✅ question-${question.id}.zip downloaded successfully!`);
    } catch (error) {
      console.error('❌ Error creating ZIP:', error);
      alert('Failed to create download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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

  const mediaSegments = question.recording_segments || question.media_asset || [];

  // Debug: Log media data structure
  if (isOpen && question) {
    console.log('🎬 [QuestionDetailModal] Question data:', {
      questionId: question.id,
      hasRecordingSegments: !!question.recording_segments,
      recordingSegmentsLength: question.recording_segments?.length,
      recordingSegments: question.recording_segments,
      hasMediaAsset: !!question.media_asset,
      mediaAssetLength: question.media_asset?.length,
      mediaAsset: question.media_asset,
      computedMediaSegments: mediaSegments,
      mediaSegmentsLength: mediaSegments.length,
    });

    // Log each segment details
    if (mediaSegments && mediaSegments.length > 0) {
      mediaSegments.forEach((segment, index) => {
        console.log(`🎬 [Segment ${index + 1}]:`, {
          id: segment.id,
          url: segment.url,
          metadata: segment.metadata,
          mode: segment.metadata?.mode,
          duration: segment.duration_sec || segment.duration,
          segmentIndex: segment.segment_index,
        });
      });
    } else {
      console.log('⚠️ [QuestionDetailModal] No media segments found!');
    }
  }

  return (
    <>
      {/* Question Detail Modal */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="relative bg-white w-full sm:rounded-2xl sm:shadow-2xl sm:max-w-4xl h-screen sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Sticky Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:rounded-t-2xl z-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0 mr-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Question Details</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {isPending && 'Pending your answer'}
                    {isAnswered && answerDetails && `Answered ${formatDate(answerDetails.sent_at || answerDetails.created_at)}`}
                    {isAnswered && !answerDetails && !isLoadingAnswer && 'Answered'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {isPending && (
                <ProgressStepper currentStep={currentStep} steps={ANSWER_STEPS} />
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full">
                
                {/* MOBILE COMPACT: Question Context Banner */}
                {isPending && (
                  <QuestionContextBanner question={question} expert={expertProfile} />
                )}
                
                {isAnswered && answerDetails?.rating > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Customer Feedback</h4>
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                star <= answerDetails.rating
                                  ? 'text-amber-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1"
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          ))}
                          <span className="text-sm font-semibold text-gray-900 ml-1">
                            {answerDetails.rating}.0 / 5.0
                          </span>
                        </div>
                        {answerDetails.feedback_text && (
                          <div className="bg-white rounded-lg p-3 mt-3">
                            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                              "{answerDetails.feedback_text}"
                            </p>
                            {answerDetails.allow_testimonial && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Allowed as testimonial</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {answerDetails.feedback_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Received {formatDate(answerDetails.feedback_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isAnswered && getDeliveryTime() && (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-semibold text-green-700">
                        Delivered in {getDeliveryTime()}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Question Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{question.title}</h3>
                      {question.text && (
                        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{question.text}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">Asked: {formatDate(question.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">Value: {formatPrice(question.price_cents)}</span>
                    </div>
                    {question.sla_hours_snapshot && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-gray-600">SLA: {question.sla_hours_snapshot}h</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Media & Attachments */}
                {mediaSegments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Question Media</h4>
                    {mediaSegments
                      .sort((a, b) => a.segment_index - b.segment_index)
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
                        
                        return (
                          <div key={segment.id} className="bg-gray-900 rounded-xl overflow-hidden">
                            {mediaSegments.length > 1 && (
                              <div className="px-4 py-2.5 bg-gray-800 flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-300">
                                  Part {index + 1}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {isVideo ? '🎥' : '🎤'} {segment.duration_sec}s
                                </span>
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
                              <div className="p-4 flex items-center justify-center">
                                <audio controls className="w-full max-w-md" preload="metadata">
                                  <source src={segment.url} type="audio/webm" />
                                </audio>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                  </div>
                )}

                {(() => {
                  let attachments = [];
                  try {
                    if (typeof question.attachments === 'string' && question.attachments.trim()) {
                      attachments = JSON.parse(question.attachments);
                    } else if (Array.isArray(question.attachments)) {
                      attachments = question.attachments;
                    }
                  } catch (e) {
                    console.error('Failed to parse attachments:', e);
                    attachments = [];
                  }

                  const hasMediaOrAttachments = (mediaSegments && mediaSegments.length > 0) || (attachments && attachments.length > 0);

                  if (!Array.isArray(attachments) || attachments.length === 0) {
                    return null;
                  }

                  return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-4 sm:p-5 space-y-2">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3">Question Attachments</h4>
                        {attachments.map((file, index) => (
                          <a
                            key={index}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-xs sm:text-sm hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all group"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="flex-1 text-gray-700 truncate font-medium">{file.name}</span>
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>

                      {/* Download All Button */}
                      {hasMediaOrAttachments && (
                        <div className="px-4 sm:px-5 py-3.5 bg-gray-50 border-t border-gray-200">
                          <button
                            onClick={downloadQuestionAsZip}
                            disabled={isDownloading}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium hover:bg-gray-100 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDownloading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                <span>Creating ZIP...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download All (ZIP)
                                <span className="ml-1 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                                  {(mediaSegments?.length || 0) + (attachments?.length || 0)}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Answer Section - Collapsible */}
                {isAnswered && answerDetails && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setShowAnswerSection(!showAnswerSection)}
                      className="w-full bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 px-4 sm:px-5 py-4 flex items-center justify-between hover:from-indigo-100 hover:to-violet-100 transition-all duration-200 group touch-manipulation min-h-[60px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="text-gray-900 font-bold text-sm sm:text-base">Your Answer</h4>
                          {!showAnswerSection && answerDetails.media_assets?.length > 0 && (
                            <p className="text-gray-600 text-xs sm:text-sm">
                              {answerDetails.media_assets.length} {answerDetails.media_assets.length === 1 ? 'media file' : 'media files'}
                            </p>
                          )}
                        </div>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showAnswerSection ? 'rotate-180' : ''} group-hover:text-gray-700`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <div className={`transition-all duration-300 ease-in-out ${showAnswerSection ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <div className="p-4 sm:p-5 space-y-4">
                        {answerDetails.text && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{answerDetails.text}</p>
                          </div>
                        )}

                        {answerDetails.media_assets && answerDetails.media_assets.length > 0 && (
                          <div className="space-y-3">
                            {answerDetails.media_assets
                              .sort((a, b) => (a.segment_index || 0) - (b.segment_index || 0))
                              .map((segment, arrayIndex) => {
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
                                
                                return (
                                  <div key={segment.id} className="bg-gray-900 rounded-xl overflow-hidden">
                                    {answerDetails.media_assets.length > 1 && (
                                      <div className="px-4 py-2.5 bg-gray-800 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-300">
                                          Part {arrayIndex + 1}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          {isVideo ? '🎥' : '🎤'} {segment.duration_sec}s
                                        </span>
                                      </div>
                                    )}
                                    
                                    {isVideo && videoId && customerCode ? (
                                      <div className="w-full aspect-video bg-black">
                                        <iframe
                                          src={`https://${customerCode}.cloudflarestream.com/${videoId}/iframe`}
                                          style={{ border: 'none', width: '100%', height: '100%' }}
                                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                          allowFullScreen={true}
                                          title={`Answer video ${arrayIndex + 1}`}
                                        />
                                      </div>
                                    ) : isAudio && segment.url ? (
                                      <div className="p-4 flex items-center justify-center">
                                        <audio controls className="w-full max-w-md" preload="metadata">
                                          <source src={segment.url} type="audio/webm" />
                                        </audio>
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        {answerDetails.attachments && answerDetails.attachments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Answer Attachments</p>
                            {answerDetails.attachments.map((file, index) => (
                              <a
                                key={index}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-xs sm:text-sm hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all group"
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span className="flex-1 text-gray-700 truncate font-medium">{file.name}</span>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isAnswered && isLoadingAnswer && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading answer details...</p>
                  </div>
                )}

                {isAnswered && !answerDetails && !isLoadingAnswer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Already Answered</p>
                        <p className="text-sm text-green-700">
                          Answered on {formatDate(question.answered_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Declined Offer Message */}
                {isDeclined && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 mb-4">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Offer Declined</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {question?.decline_reason || 'This offer was automatically declined because it was below your minimum threshold.'}
                      </p>
                      <div className="bg-white/60 rounded-lg p-4">
                        <p className="text-xs text-gray-600">
                          You cannot answer this question as the offer has been declined. The asker has been notified.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Answer Button - Inside scrollable content */}
                {isPending && (
                  <div className="pt-4 pb-24">
                    <button
                      onClick={handleStartAnswer}
                      className="w-full py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 touch-manipulation min-h-[48px] sm:min-h-[52px]"
                    >
                      Answer This Question →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Recorder Modal - FIXED SCROLL CONTAINMENT */}
      {showAnswerRecorder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={handleRecorderCancel}
          />

          {/* MOBILE FIX: Proper container with flex column */}
          <div className="relative w-full h-full sm:h-auto sm:w-auto sm:max-w-5xl sm:max-h-[90vh] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="relative bg-white w-full h-full sm:h-auto sm:rounded-2xl sm:shadow-2xl flex flex-col overflow-hidden sm:max-h-[90vh]">
              
              {/* Header */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:rounded-t-2xl z-20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create Your Answer</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Record your response with video, audio, or screen recording</p>
                  </div>
                  <button
                    onClick={handleRecorderCancel}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <ProgressStepper currentStep={currentStep} steps={ANSWER_STEPS} />
              </div>

              {/* FIXED: Scrollable content with proper padding for sticky footer */}
              <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden">
                <div className="p-4 sm:p-6 max-w-full pb-24 sm:pb-6">
                  <AnswerRecorder
                    question={question}
                    expert={expertProfile}
                    onReady={handleRecorderReady}
                    onCancel={handleRecorderCancel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnswerReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        answerData={answerData}
        question={question}
        onEdit={handleEdit}
        onSubmitSuccess={handleSubmitSuccess}
        userId={userId}
      />
    </>
  );
}

export default QuestionDetailModal;