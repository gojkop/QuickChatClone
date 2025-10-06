// src/components/question/AskReviewModal.jsx
import React, { useState } from 'react';

// Helper to format price from cents
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const formatTime = (seconds) => {
    // Handle invalid values
    if (seconds === undefined || seconds === null || seconds < 0 || isNaN(seconds)) {
      return '0:00';
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Also in AskReviewModal.jsx, when displaying segment duration:
  // BEFORE:
  // {formatTime(segment.duration || 0)}

  // AFTER:
  {formatTime(segment.duration >= 0 ? segment.duration : 0)}

  // And for total duration calculation:
  const totalDuration = recordingSegments.reduce((sum, seg) => {
    const dur = seg.duration >= 0 ? seg.duration : 0;
    return sum + dur;
  }, 0);

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

function AskReviewModal({ isOpen, questionData, expert, onClose, onEdit, onProceedToPayment }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !questionData || !expert) return null;

  const handleProceed = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    onProceedToPayment({
      email,
      firstName,
      lastName
    });
  };

  // Get recording segments and total duration
  const recordingSegments = questionData.recordingSegments || [];
  const totalDuration = recordingSegments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
  const hasRecording = recordingSegments.length > 0;

  // Get attachments
  const attachments = questionData.attachments || [];
  const hasAttachments = attachments.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Question</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Expert & Price Info Card */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-indigo-600 font-semibold mb-1">Asking a question to</p>
                  <p className="text-2xl font-bold text-indigo-900">{expert.user?.name || expert.handle}</p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-600 mb-1">Price</div>
                  <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-indigo-200 shadow-sm">
                    <span className="font-bold text-gray-900 text-lg">
                      {formatPrice(expert.price_cents, expert.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Summary */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Your Question Summary</label>
              <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">

                {/* Title */}
                <div className="flex items-start">
                  <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Title</span>
                  <p className="text-gray-900 text-sm font-medium">{questionData.title}</p>
                </div>

                {/* Recording Segments - NEW: Show all segments */}
                {hasRecording && (
                  <div className="flex items-start">
                    <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">
                      Recording
                    </span>
                    <div className="flex-1">
                      <div className="space-y-2">
                        {recordingSegments.map((segment, index) => (
                          <div key={segment.uid || index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                            {/* Segment number */}
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            
                            {/* Segment info */}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900">
                                {segment.mode === 'video' ? '📹 Video' : 
                                 segment.mode === 'audio' ? '🎤 Audio' : 
                                 segment.mode === 'screen' ? '💻 Screen' : 'Recording'} Segment
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(segment.duration || 0)} • {formatBytes(segment.size || 0)}
                              </div>
                            </div>

                            {/* Upload status */}
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-green-600">✅</span>
                                <span className="text-green-600 font-medium">Uploaded</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total duration summary */}
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 bg-indigo-50 px-3 py-2 rounded">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-indigo-900">
                          Total: {recordingSegments.length} segment{recordingSegments.length > 1 ? 's' : ''} • {formatTime(totalDuration)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Context */}
                <div className="flex items-start">
                  <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Context</span>
                  {questionData.text ? (
                     <div className="text-sm font-medium text-green-700 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                       </svg>
                       <span>Added</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Not Added</span>
                  )}
                </div>

                {/* Attached Files - NEW: Show all files with details */}
                <div className="flex items-start">
                  <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Files</span>
                  {hasAttachments ? (
                    <div className="flex-1">
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div key={file.url || index} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                            {/* File icon */}
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>

                            {/* File info */}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900 truncate">
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatBytes(file.size || 0)}
                              </div>
                            </div>

                            {/* Upload status */}
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-green-600">✅</span>
                                <span className="text-green-600 font-medium">Uploaded</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No Files Attached</span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            {(hasRecording || hasAttachments) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-green-900 mb-1">All Content Uploaded!</h3>
                    <p className="text-xs text-green-700">
                      {hasRecording && `${recordingSegments.length} recording segment${recordingSegments.length > 1 ? 's' : ''}`}
                      {hasRecording && hasAttachments && ' and '}
                      {hasAttachments && `${attachments.length} file${attachments.length > 1 ? 's' : ''}`}
                      {' '}ready to submit. Your question will be sent instantly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Button */}
            <button
              onClick={onEdit}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Go Back & Edit</span>
            </button>

            {/* Your Profile Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                    placeholder="your.email@example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll send the expert's answer here.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <button
              onClick={handleProceed}
              disabled={isSubmitting || !email}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskReviewModal;