import React from 'react';

function AnswerReviewModal({ isOpen, onClose, answerData, question, onSubmit, onEdit }) {
  if (!isOpen || !answerData) return null;

  const handleSubmit = () => {
    onSubmit(answerData);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-xl font-bold text-gray-900">Review Your Answer</h2>
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
            {/* Question Reference */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Answering to:</p>
              <p className="font-semibold text-gray-900">{question.title}</p>
            </div>

            {/* Answer Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Answer</h3>
              <div className="space-y-3">
                {/* Recording Status */}
                {answerData.mediaBlob && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-700 font-medium">
                      {answerData.recordingMode === 'video' ? 'Video' : 'Audio'} answer recorded
                    </span>
                  </div>
                )}

                {/* Written Answer */}
                {answerData.text && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Written response:</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{answerData.text}</p>
                    </div>
                  </div>
                )}

                {!answerData.mediaBlob && !answerData.text && (
                  <p className="text-amber-600 text-sm">No answer content recorded</p>
                )}
              </div>
            </div>

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
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Go Back & Edit
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnswerReviewModal;