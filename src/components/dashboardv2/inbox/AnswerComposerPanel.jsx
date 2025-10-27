// src/components/dashboardv2/inbox/AnswerComposerPanel.jsx
// Answer composer panel for cascading layout

import React, { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle, Video, Mic, FileText } from 'lucide-react';
import AnswerRecorder from '@/components/dashboard/AnswerRecorder';
import { useAnswerUpload } from '@/hooks/useAnswerUpload';

function AnswerComposerPanel({
  question,
  profile,
  onClose,
  onAnswerSubmitted,
  isMobile = false
}) {
  const [showReview, setShowReview] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const answerUpload = useAnswerUpload();

  const handleReady = (data) => {
    console.log('🎬 [ANSWER FLOW] handleReady called - showing inline review');
    console.log('📦 [ANSWER FLOW] Answer data received:', data);

    // Store answer data and show review screen
    setAnswerData(data);
    setShowReview(true);
  };

  const handleEdit = () => {
    console.log('✏️ [ANSWER FLOW] Edit button clicked - returning to recorder');
    console.log('📦 [ANSWER FLOW] Current answerData:', answerData);

    // DON'T reset answerData - keep it so recorder can restore it
    setShowReview(false);

    console.log('✅ [ANSWER FLOW] Switched back to recorder - showReview=false');
  };

  const handleSubmitConfirmed = async () => {
    console.log('✅ User confirmed submission');
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const userId = profile?.user_id;
      if (!userId) {
        throw new Error('User ID not found in profile. Please try logging in again.');
      }

      console.log('🚀 Submitting answer...');
      const result = await answerUpload.submitAnswer(answerData, question.id, userId);
      console.log('✅ Answer submitted successfully:', result);

      // Trigger parent callback after brief delay
      setTimeout(() => {
        console.log('📍 Triggering onAnswerSubmitted callback');
        onAnswerSubmitted?.(question.id);
        onClose();
      }, 800);

    } catch (error) {
      console.error('❌ Failed to submit answer:', error);
      setSubmitError(error.message || 'Failed to submit answer');
      setIsSubmitting(false);
    }
  };

  // Helper to render recording segment preview
  const renderSegmentPreview = (segment, index) => {
    const mode = segment.mode || 'video';
    const duration = segment.duration || 0;
    // Use blobUrl for immediate playback, fallback to playbackUrl/url after Stream processing
    const url = segment.blobUrl || segment.playbackUrl || segment.url;

    const modeLabel = mode === 'screen' ? 'Screen Recording' :
                     mode === 'audio' ? 'Audio Recording' :
                     mode === 'video' ? 'Video Recording' : 'Recording';

    const icon = mode === 'audio' ? <Mic size={16} className="text-indigo-600" /> : <Video size={16} className="text-indigo-600" />;

    return (
      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-semibold text-gray-900">{modeLabel}</span>
          </div>
          <span className="text-xs text-gray-600">{Math.floor(duration)}s</span>
        </div>
        {url && mode === 'audio' ? (
          <div className="p-3 bg-gray-900">
            <audio controls className="w-full" preload="metadata" src={url}>
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : url ? (
          <div className="bg-black">
            <video
              controls
              className="w-full"
              preload="metadata"
              style={{ maxHeight: '300px' }}
              src={url}
            >
              Your browser does not support video playback.
            </video>
          </div>
        ) : null}
      </div>
    );
  };

  // Helper to render attachment preview
  const renderAttachmentPreview = (attachment, index) => {
    const type = attachment.type || '';
    const url = attachment.url || '';
    const name = attachment.name || attachment.filename || `Attachment ${index + 1}`;

    return (
      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={16} className="text-indigo-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-900 truncate">{name}</span>
          </div>
        </div>
        {type.startsWith('video/') && url ? (
          <div className="bg-black">
            <video
              controls
              className="w-full"
              preload="metadata"
              style={{ maxHeight: '300px' }}
            >
              <source src={url} type={type} />
              Your browser does not support video playback.
            </video>
          </div>
        ) : type.startsWith('audio/') && url ? (
          <div className="p-3 bg-gray-900">
            <audio controls className="w-full" preload="metadata">
              <source src={url} type={type} />
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : type.startsWith('image/') && url ? (
          <img
            src={url}
            alt={name}
            className="w-full h-48 object-cover"
          />
        ) : type === 'application/pdf' || name.toLowerCase().endsWith('.pdf') ? (
          <div className="p-4 bg-red-50 flex items-center gap-3">
            <FileText size={32} className="text-red-500" />
            <span className="text-sm font-semibold text-red-700">PDF Document</span>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 flex items-center gap-3">
            <FileText size={32} className="text-gray-400" />
            <span className="text-sm text-gray-600">File attachment</span>
          </div>
        )}
      </div>
    );
  };

  if (!question || !profile) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-gray-500">
        <p>Loading question details...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <div className={`${isMobile ? "px-3 py-2" : "px-4 py-3"} flex items-center gap-3`}>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            aria-label="Back to question"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              Answer Question
            </h2>
            <p className="text-xs text-gray-500 truncate">
              Q-{question.id} · ${(question.price_cents / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className={`flex-1 overflow-y-auto overscroll-contain ${isMobile ? 'pb-4' : 'pb-0'}`}>
        <div className={`${isMobile ? 'p-3' : 'p-4 lg:p-6'} max-w-4xl mx-auto`}>
          {!showReview ? (
            <AnswerRecorder
              question={question}
              onReady={handleReady}
              onCancel={onClose}
              expert={profile}
              initialText={answerData?.text || ''}
              existingData={answerData}
            />
          ) : (
            <div className="space-y-4">
              {/* Review Summary */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Answer</h3>

                {answerData?.text && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Text Response:</h4>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">{answerData.text}</p>
                    </div>
                  </div>
                )}

                {answerData?.recordingSegments && answerData.recordingSegments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Recording: {answerData.recordingSegments.length} segment(s) • Total: {Math.round(answerData.recordingDuration || 0)}s
                    </h4>
                    <div className="space-y-3">
                      {answerData.recordingSegments.map((segment, index) => renderSegmentPreview(segment, index))}
                    </div>
                  </div>
                )}

                {answerData?.attachments && answerData.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Attachments: {answerData.attachments.length} file(s)
                    </h4>
                    <div className="space-y-3">
                      {answerData.attachments.map((attachment, index) => renderAttachmentPreview(attachment, index))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting}
                  className={`flex-1 ${isMobile ? 'px-4 py-2.5' : 'px-6 py-3'} border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50`}
                >
                  ← Edit Answer
                </button>
                <button
                  onClick={handleSubmitConfirmed}
                  disabled={isSubmitting}
                  className={`flex-1 ${isMobile ? 'px-4 py-2.5' : 'px-6 py-3'} bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer →'}
                </button>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{submitError}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Discrete Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm mx-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 size={48} className="text-indigo-600 animate-spin" />
                <CheckCircle
                  size={24}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 opacity-30"
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Submitting Answer
                </h3>
                <p className="text-sm text-gray-600">
                  Processing your answer and uploading media...
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnswerComposerPanel;