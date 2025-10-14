// src/components/dashboard/AnswerReviewModal.jsx
// FULLY UPDATED - Outcome-focused design (Phase 2-3)

import React, { useState } from 'react';
import { useAnswerUpload } from '@/hooks/useAnswerUpload';
import AnswerSubmittedModal from './AnswerSubmittedModal';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

function AnswerReviewModal({ isOpen, onClose, answerData, question, onEdit, onSubmitSuccess, userId }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  
  const answerUpload = useAnswerUpload();
  
  if (!isOpen || !answerData) return null;

  const handleSubmit = async () => {
    if (!userId) {
      alert('Error: User ID is required. Please make sure you are logged in.');
      return;
    }

    if (!hasText && !hasRecording) {
      alert('Please add either a written response or a recording before submitting.');
      return;
    }

    try {
      const result = await answerUpload.submitAnswer(answerData, question.id, userId);
      
      setSubmittedAnswer(result);
      onClose();
      setShowSuccessModal(true);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }
      
    } catch (error) {
      console.error('❌ Failed to submit answer:', error);
      alert(`Failed to submit answer: ${error.message}`);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    answerUpload.reset();
  };

  const hasRecordingSegments = Array.isArray(answerData.recordingSegments) && answerData.recordingSegments.length > 0;
  const hasRecording = !!answerData.mediaBlob || hasRecordingSegments;
  const hasText = !!answerData.text && answerData.text.trim().length > 0;
  const files = answerData.files || answerData.attachments || [];
  const hasFiles = Array.isArray(files) && files.length > 0;
  const recordingDuration = answerData.recordingDuration || 0;
  const isDurationValid = recordingDuration > 0;
  const isValidAnswer = hasText || hasRecording;

  const reviewUrl = submittedAnswer?.review_url;
  const playbackTokenHash = submittedAnswer?.playback_token_hash;

  const getUploadStageText = () => {
    if (!answerUpload.uploading) return null;
    
    switch (answerUpload.stage) {
      case 'media':
        return answerData.recordingMode === 'video' 
          ? '📤 Uploading video to Cloudflare Stream...'
          : '🎤 Uploading audio to R2...';
      case 'attachments':
        return '📎 Uploading attachments...';
      case 'submitting':
        return '💾 Creating answer record...';
      default:
        return '⏳ Processing...';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] overflow-y-auto">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={answerUpload.uploading ? undefined : onClose}
        />

        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Review Your Answer</h2>
              <button
                onClick={onClose}
                disabled={answerUpload.uploading}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Upload Progress Overlay */}
            {answerUpload.uploading && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Submitting Your Answer</h3>
                  <p className="text-gray-600 mb-4">{getUploadStageText()}</p>
                  <div className="max-w-md mx-auto">
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>Media Upload</span>
                        <span>
                          {answerUpload.stage === 'media' ? '⏳ In Progress' : 
                           answerUpload.mediaResult ? '✅ Complete' : '⏸️ Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Attachments</span>
                        <span>
                          {answerUpload.stage === 'attachments' ? '⏳ In Progress' : 
                           answerUpload.attachmentResults.length > 0 ? '✅ Complete' : '⏭️ Skipped'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Creating Record</span>
                        <span>
                          {answerUpload.stage === 'submitting' ? '⏳ In Progress' : '⏸️ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {answerUpload.error && !answerUpload.uploading && (
              <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Submission Failed</p>
                    <p className="text-sm text-red-700 mt-1">{answerUpload.error}</p>
                    <button
                      onClick={() => answerUpload.reset()}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Question Reference */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Answering to:</p>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">{question.title}</p>
              </div>

              {/* Validation Warning */}
              {!isValidAnswer && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-amber-900">Answer Required</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Please add at least a written response or a recording before submitting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Your Answer is Ready */}
              {isValidAnswer && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Your Answer is Ready to Send</h3>
                      <div className="space-y-2 text-xs sm:text-sm">
                        {hasRecording && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span className="text-gray-700">
                              {hasRecordingSegments 
                                ? `${answerData.recordingSegments.length} recording${answerData.recordingSegments.length > 1 ? 's' : ''}`
                                : 'Recording'} 
                              {isDurationValid && ` (${formatTime(recordingDuration)})`}
                            </span>
                          </div>
                        )}
                        
                        {hasText && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span className="text-gray-700">Written context ({answerData.text.length} characters)</span>
                          </div>
                        )}
                        
                        {hasFiles && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span className="text-gray-700">{files.length} supporting file{files.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <span className="text-gray-700">
                            On time (within {question.sla_hours_snapshot}h SLA)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 text-xs text-gray-600">
                    <strong>📬 What happens next:</strong> The asker will be notified immediately and can view your answer within minutes.
                  </div>
                </div>
              )}

              {/* Earnings Info */}
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">You'll earn from this answer:</div>
                    <div className="text-xl sm:text-2xl font-black text-indigo-600">
                      {formatPrice(question.price_cents, question.currency)}
                    </div>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Before you submit:</p>
                    <ul className="text-xs sm:text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Your answer will be sent directly to the asker</li>
                      <li>• You cannot edit the answer after submission</li>
                      <li>• The asker will be notified immediately</li>
                      <li>• Payment will be processed upon submission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  onClick={onEdit}
                  disabled={answerUpload.uploading}
                  className="order-2 sm:order-1 px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                >
                  Go Back & Edit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={answerUpload.uploading || !isValidAnswer}
                  className="order-1 sm:order-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px]"
                  title={!isValidAnswer ? 'Add a written response or recording to submit' : ''}
                >
                  {answerUpload.uploading ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnswerSubmittedModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        answerData={answerData}
        question={question}
        reviewUrl={reviewUrl}
        playbackTokenHash={playbackTokenHash}
      />
    </>
  );
}

export default AnswerReviewModal;