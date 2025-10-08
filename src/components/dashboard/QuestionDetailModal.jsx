// src/components/dashboard/QuestionDetailModal.jsx
import React, { useState } from 'react';
import AnswerRecorder from './AnswerRecorder';
import AnswerReviewModal from './AnswerReviewModal';

function QuestionDetailModal({ isOpen, onClose, question, userId, onAnswerSubmitted }) {
  const [showAnswerRecorder, setShowAnswerRecorder] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  const handleStartAnswer = () => {
    setShowAnswerRecorder(true);
  };

  const handleRecorderReady = (data) => {
    console.log('✅ Answer data from recorder:', data);
    setAnswerData(data);
    setShowReviewModal(true);
  };

  const handleRecorderCancel = () => {
    setShowAnswerRecorder(false);
  };

  const handleEdit = () => {
    setShowReviewModal(false);
    // Recorder stays open with existing data
  };

  const handleSubmitSuccess = (result) => {
    console.log('✅ Answer submitted successfully:', result);
    
    // Close all modals
    setShowReviewModal(false);
    setShowAnswerRecorder(false);
    setAnswerData(null);
    
    // Notify parent to refresh questions list
    if (onAnswerSubmitted) {
      onAnswerSubmitted(question.id);
    }
    
    // Close the detail modal
    onClose();
  };

  const isPending = question.status === 'paid' && !question.answered_at;
  const isAnswered = question.status === 'answered' || !!question.answered_at;

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

  // If recorder is open, show it full-screen
  if (showAnswerRecorder) {
    return (
      <>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Answer Question</h2>
                <p className="text-sm text-gray-600 mt-1">Record your answer with video, audio, or screen recording</p>
              </div>
              <button
                onClick={handleRecorderCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Answer Recorder */}
            <AnswerRecorder
              question={question}
              onReady={handleRecorderReady}
              onCancel={handleRecorderCancel}
            />
          </div>
        </div>

        {/* Answer Review Modal */}
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

  // Otherwise show question detail modal
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Question Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isPending && 'Pending your answer'}
                {isAnswered && 'Answered'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Question Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{question.title}</h3>
                  {question.text && (
                    <p className="text-gray-700 whitespace-pre-wrap">{question.text}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
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

            {/* Media Assets */}
            {question.media_asset && question.media_asset.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Question Media</h4>
                {question.media_asset
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
                        {question.media_asset.length > 1 && (
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

            {/* Attachments */}
            {question.attachments && question.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Attachments</h4>
                {question.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Answer Button */}
            {isPending && (
              <button
                onClick={handleStartAnswer}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Answer This Question
              </button>
            )}

            {/* Already Answered */}
            {isAnswered && (
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionDetailModal;