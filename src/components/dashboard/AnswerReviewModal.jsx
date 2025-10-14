// src/components/dashboard/AnswerReviewModal.jsx
// FIXED - Removed duplicate button, better validation
import React, { useState } from 'react';
import { useAnswerUpload } from '@/hooks/useAnswerUpload';
import AnswerSubmittedModal from './AnswerSubmittedModal';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function AnswerReviewModal({ isOpen, onClose, answerData, question, onEdit, onSubmitSuccess, userId }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  
  const answerUpload = useAnswerUpload();
  
  if (!isOpen || !answerData) return null;

  const handleSubmit = async () => {
    // Validate userId
    if (!userId) {
      alert('Error: User ID is required. Please make sure you are logged in.');
      return;
    }

    // ✅ NEW: Validate that we have either text or recording
    if (!hasText && !hasRecording) {
      alert('Please add either a written response or a recording before submitting.');
      return;
    }

    try {
      console.log('📝 Submitting answer for question:', question.id);
      console.log('📦 Full answerData object:', answerData);
      console.log('📎 answerData.attachments:', answerData.attachments);
      console.log('📎 answerData.files:', answerData.files);
      console.log('Answer data summary:', {
        hasMedia: !!answerData.mediaBlob,
        hasText: !!answerData.text,
        hasRecordingSegments: (answerData.recordingSegments || []).length > 0,
        hasAttachments: (answerData.attachments || []).length > 0,
        hasFiles: (answerData.files || []).length > 0,
        recordingMode: answerData.recordingMode,
        recordingDuration: answerData.recordingDuration,
        userId,
      });

      // Submit answer (uploads media + attachments + creates DB record)
      const result = await answerUpload.submitAnswer(answerData, question.id, userId);
      
      console.log('✅ Answer submitted successfully:', result);
      
      // Store result for success modal
      setSubmittedAnswer(result);
      
      // Close review modal
      onClose();
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Call parent's success handler if provided
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

  // ✅ FIXED: Safe array handling
  const hasRecordingSegments = Array.isArray(answerData.recordingSegments) && answerData.recordingSegments.length > 0;
  const hasRecording = !!answerData.mediaBlob || hasRecordingSegments;
  const hasText = !!answerData.text && answerData.text.trim().length > 0;
  
  // ✅ FIXED: Safely get files/attachments
  const files = answerData.files || answerData.attachments || [];
  const hasFiles = Array.isArray(files) && files.length > 0;
  
  const recordingDuration = answerData.recordingDuration || 0;
  const isDurationValid = recordingDuration > 0;

  // ✅ NEW: Check if answer is valid for submission
  const isValidAnswer = hasText || hasRecording;

  // Get review URL from submitted answer
  const reviewUrl = submittedAnswer?.review_url;
  const playbackTokenHash = submittedAnswer?.playback_token_hash;

  // Determine current upload stage for display
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
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900">Review Your Answer</h2>
              <button
                onClick={onClose}
                disabled={answerUpload.uploading}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Upload Progress Overlay */}
            {answerUpload.uploading && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Submitting Your Answer</h3>
                  <p className="text-gray-600 mb-4">{getUploadStageText()}</p>
                  <div className="max-w-md mx-auto px-4">
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
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
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
            <div className="p-6 space-y-6">
              {/* Question Reference */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Answering to:</p>
                <p className="font-semibold text-gray-900">{question.title}</p>
              </div>

              {/* ✅ NEW: Validation Warning */}
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

              {/* Answer Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Answer Summary</h3>
                <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">

                  {/* Recording Status with Duration */}
                  {hasRecording ? (
                    <div className="flex items-start">
                      <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">
                        Recording
                      </span>
                      <div className="flex-1">
                        <div className={`text-sm font-medium flex items-center gap-2 mb-2 ${
                          isDurationValid ? 'text-green-700' : 'text-amber-700'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>
                            {hasRecordingSegments ? `${answerData.recordingSegments.length} segment(s)` : 'Recording'} Added
                          </span>
                        </div>
                        
                        {/* Duration Display */}
                        {isDurationValid && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                            <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-900">
                                Duration: {formatTime(recordingDuration)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {hasRecordingSegments ? 'Segments successfully uploaded' : 'Recording ready'}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                          </div>
                        )}

                        {!isDurationValid && hasRecording && (
                          <div className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-amber-900">
                                Recording verification needed
                              </div>
                              <div className="text-xs text-amber-700">
                                Duration could not be determined
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">
                        Recording
                      </span>
                      <span className="text-sm text-gray-500">No Recording</span>
                    </div>
                  )}

                  {/* Written Response Status */}
                  <div className="flex items-start">
                    <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Written</span>
                    {hasText ? (
                      <div className="text-sm font-medium text-green-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Added ({answerData.text.length} characters)</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not Added</span>
                    )}
                  </div>

                  {/* Attachments Status */}
                  <div className="flex items-start">
                    <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Files</span>
                    {hasFiles ? (
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-700 flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{files.length} file{files.length !== 1 ? 's' : ''} attached</span>
                        </div>
                        <ul className="text-sm list-disc pl-5 text-gray-700">
                          {files.map((file, index) => (
                            <li key={index}>{file.name || file.filename || `File ${index + 1}`}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No Files Attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ REMOVED: Duplicate "Go Back & Edit" button that was here */}

              {/* Important Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900">Before you submit:</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Your answer will be sent directly to the asker</li>
                      <li>• You cannot edit the answer after submission</li>
                      <li>• The asker will be notified immediately</li>
                      <li>• Payment will be processed upon submission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={onEdit}
                  disabled={answerUpload.uploading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Go Back & Edit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={answerUpload.uploading || !isValidAnswer}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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