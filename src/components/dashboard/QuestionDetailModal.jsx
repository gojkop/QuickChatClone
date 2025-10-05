import React, { useState, useEffect } from 'react';
import AnswerRecorder from './AnswerRecorder';
import AnswerReviewModal from './AnswerReviewModal';

const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const getTimeAgo = (timestamp) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
};

function QuestionDetailModal({ isOpen, onClose, question }) {
  const [showAnswerRecorder, setShowAnswerRecorder] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (question?.media_asset_id) {
      // Mock URL - replace with actual media URL fetch
      setMediaUrl(`/api/media/${question.media_asset_id}`);
    }
    if (question?.attachments) {
      try {
        const files = JSON.parse(question.attachments);
        setAttachments(files);
      } catch (e) {
        setAttachments([]);
      }
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const handleAnswerClick = () => {
    setShowAnswerRecorder(true);
  };

  const handleAnswerReady = (data) => {
    setAnswerData(data);
    setShowReviewModal(true);
  };

  const handleSubmitAnswer = async (finalData) => {
    console.log('Submitting answer:', finalData);
    // TODO: API call to submit answer
    alert('Answer submitted successfully!');
    setShowReviewModal(false);
    setShowAnswerRecorder(false);
    onClose();
  };

  const isAnswered = question.status === 'answered';
  const isPending = question.status === 'paid' && !question.answered_at;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Question Details</h2>
                {isPending && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>
                    Pending Response
                  </span>
                )}
                {isAnswered && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    Answered
                  </span>
                )}
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
            {!showAnswerRecorder ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  
                  {/* Asker Info Card */}
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-indigo-600 font-semibold mb-1">Asked by</p>
                        <p className="text-xl font-bold text-indigo-900">{question.payer_name || 'Anonymous'}</p>
                        <p className="text-sm text-indigo-700 mt-1">{question.payer_email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Payment</div>
                        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-indigo-200 shadow-sm">
                          <span className="font-bold text-gray-900 text-lg">
                            {formatPrice(question.price_cents, question.currency)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{getTimeAgo(question.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Question Title */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Question Title</h3>
                    <p className="text-lg font-semibold text-gray-900">{question.title}</p>
                  </div>

                  {/* Media Content */}
                  {question.media_asset_id && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        {question.media_type === 'video' ? 'Video Question' : 'Audio Question'}
                      </h3>
                      <div className="bg-gray-900 rounded-xl overflow-hidden">
                        {question.media_type === 'video' ? (
                          <video 
                            controls 
                            className="w-full aspect-video"
                            preload="metadata"
                          >
                            <source src={mediaUrl} type="video/webm" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="p-8 flex items-center justify-center">
                            <audio 
                              controls 
                              className="w-full max-w-md"
                              preload="metadata"
                            >
                              <source src={mediaUrl} type="audio/webm" />
                              Your browser does not support the audio tag.
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Context */}
                  {question.text && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Context</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap">{question.text}</p>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {attachments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Attachments</h3>
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          
                            key={index}
                            href={file.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 flex-1">{file.name}</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SLA Info */}
                  {isPending && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-amber-900">Response Time Commitment</p>
                          <p className="text-sm text-amber-700 mt-1">
                            You've committed to respond within {question.sla_hours} hours
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
                <AnswerRecorder 
                  question={question}
                  onReady={handleAnswerReady}
                  onCancel={() => setShowAnswerRecorder(false)}
                />
              </div>
            )}

            {/* Footer */}
            {!showAnswerRecorder && !isAnswered && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold text-sm transition">
                      Request More Info
                    </button>
                    <button className="px-4 py-2 text-red-600 hover:text-red-700 font-semibold text-sm transition">
                      Refund & Decline
                    </button>
                  </div>
                  <button
                    onClick={handleAnswerClick}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Answer Question
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer Review Modal */}
      <AnswerReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        answerData={answerData}
        question={question}
        onSubmit={handleSubmitAnswer}
        onEdit={() => setShowReviewModal(false)}
      />
    </>
  );
}

export default QuestionDetailModal;