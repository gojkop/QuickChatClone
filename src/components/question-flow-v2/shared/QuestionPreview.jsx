import React from 'react';

function QuestionPreview({ isOpen, onClose, questionData, expert, tierType, tierConfig }) {
  if (!isOpen) return null;

  const formatPrice = (cents, currency = 'USD') => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    const amount = (cents || 0) / 100;
    return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Question Preview</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Expert Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {(expert.name || expert.handle).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-gray-900">{expert.name || expert.handle}</div>
                <div className="text-sm text-gray-600">
                  {tierType === 'quick_consult' ? 'Quick Consult' : 'Deep Dive'} • 
                  {tierType === 'quick_consult' 
                    ? formatPrice(tierConfig?.price_cents, expert.currency)
                    : questionData.tierSpecific?.price ? `$${questionData.tierSpecific.price}` : 'Offer pending'
                  }
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Question Title</h3>
              <p className="text-lg font-bold text-gray-900">{questionData.title}</p>
            </div>

            {/* Recordings */}
            {questionData.recordings && questionData.recordings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Recordings</h3>
                <div className="space-y-2">
                  {questionData.recordings.map((recording, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-900">
                        {recording.mode.charAt(0).toUpperCase() + recording.mode.slice(1)} Recording
                      </span>
                      <span className="text-sm text-gray-600">({formatTime(recording.duration)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text */}
            {questionData.text && questionData.text.trim() && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Additional Details</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{questionData.text}</p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {questionData.attachments && questionData.attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Attachments</h3>
                <div className="space-y-2">
                  {questionData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="font-medium text-gray-900 truncate flex-1">{attachment.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deep Dive Offer */}
            {tierType === 'deep_dive' && questionData.tierSpecific && (
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-900 mb-3">Your Offer</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600">Offer Amount:</span>
                    <span className="ml-2 text-lg font-bold text-purple-900">${questionData.tierSpecific.price}</span>
                  </div>
                  {questionData.tierSpecific.message && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Message to Expert:</span>
                      <p className="text-sm text-gray-800 italic">"{questionData.tierSpecific.message}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionPreview;