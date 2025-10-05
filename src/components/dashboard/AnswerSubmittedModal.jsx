// src/components/dashboard/AnswerSubmittedModal.jsx
import React, { useState } from 'react';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function AnswerSubmittedModal({ isOpen, onClose, answerData, question }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Mock review URL - will be real once backend is implemented
  const reviewUrl = `${window.location.origin}/r/a7f3b2c8-9e4d-4f1a-8b6c-3d2e1f0a9b8c`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreviewAnswer = () => {
    // Open preview in new tab
    window.open(reviewUrl, '_blank');
  };

  const handleReturnToDashboard = () => {
    onClose();
    // Navigate to dashboard or refresh question list
    window.location.href = '/expert';
  };

  const hasRecording = !!answerData?.mediaBlob;
  const hasText = !!answerData?.text && answerData.text.trim().length > 0;
  const hasFiles = answerData?.files && answerData.files.length > 0;
  const recordingDuration = answerData?.recordingDuration || 0;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Success Header */}
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-100 px-6 py-8 text-center rounded-t-2xl">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              <svg className="w-10 h-10 text-green-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-2">Answer Submitted! 🎉</h2>
            <p className="text-gray-600">Your answer has been successfully delivered</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Question Reference */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Question Answered</p>
              <p className="font-semibold text-gray-900">{question?.title || 'Your question'}</p>
            </div>

            {/* Answer Summary with Duration */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Answer Summary</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className={`p-3 rounded-lg border-2 text-center ${hasRecording ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <svg className={`w-6 h-6 mx-auto mb-1 ${hasRecording ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className={`text-xs font-semibold ${hasRecording ? 'text-green-900' : 'text-gray-600'}`}>
                    {answerData?.recordingMode === 'video' ? 'Video' : 'Audio'}
                  </p>
                </div>

                <div className={`p-3 rounded-lg border-2 text-center ${hasText ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <svg className={`w-6 h-6 mx-auto mb-1 ${hasText ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className={`text-xs font-semibold ${hasText ? 'text-green-900' : 'text-gray-600'}`}>
                    Written
                  </p>
                </div>

                <div className={`p-3 rounded-lg border-2 text-center ${hasFiles ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <svg className={`w-6 h-6 mx-auto mb-1 ${hasFiles ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <p className={`text-xs font-semibold ${hasFiles ? 'text-green-900' : 'text-gray-600'}`}>
                    {hasFiles ? `${answerData.files.length} File${answerData.files.length !== 1 ? 's' : ''}` : 'No Files'}
                  </p>
                </div>
              </div>

              {/* Duration Display if recording exists */}
              {hasRecording && recordingDuration > 0 && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-indigo-900">
                      Recording Duration: {formatTime(recordingDuration)}
                    </div>
                    <div className="text-xs text-indigo-700">
                      All segments successfully combined
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Review Link */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm font-bold text-indigo-900">Answer Review Link</span>
              </div>
              <div className="bg-white border border-indigo-200 rounded-lg p-3 flex items-center gap-2 mb-3">
                <code className="flex-1 text-xs text-gray-600 truncate">{reviewUrl}</code>
                <button
                  onClick={handleCopyLink}
                  className="flex-shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition"
                >
                  {copied ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </span>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>
              <p className="text-xs text-indigo-700">
                The asker has been sent this link via email
              </p>
            </div>

            {/* What Happens Next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-blue-900 mb-2">What happens next?</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ The asker has been notified via email</li>
                    <li>✓ They can view your answer at any time</li>
                    <li>✓ You'll be notified when they leave feedback</li>
                    <li>✓ Payment has been processed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submitted Info */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Submitted {new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePreviewAnswer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Answer
              </button>
              <button
                onClick={handleReturnToDashboard}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnswerSubmittedModal;