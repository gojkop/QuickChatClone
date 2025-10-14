// src/components/question/AskReviewModal.jsx - IMPROVED VERSION
import React, { useState } from 'react';
import ProgressStepper from '@/components/common/ProgressStepper';

const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const formatTime = (seconds) => {
  if (seconds === undefined || seconds === null || seconds < 0 || isNaN(seconds)) {
    return '0:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const recordingSegments = questionData.recordingSegments || [];
  const totalDuration = recordingSegments.reduce((sum, seg) => {
    const dur = (seg && seg.duration >= 0) ? seg.duration : 0;
    return sum + dur;
  }, 0);
  const hasRecording = recordingSegments.length > 0;
  const attachments = questionData.attachments || [];
  const hasAttachments = attachments.length > 0;
  const hasContext = questionData.text && questionData.text.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             {/* Progress Stepper at top */}
      <div className="pt-6 px-4 sm:px-6">
        <ProgressStepper currentStep={2} />
      </div>
          {/* Header */}
  <div className="bg-surface border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-ink">Review Your Question</h2>
            <button
              onClick={onClose}
              className="p-2 text-subtext hover:text-ink hover:bg-canvas rounded-lg transition touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Expert & Price Info Card */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-primary font-semibold mb-1">Asking a question to</p>
                  <p className="text-xl sm:text-2xl font-bold text-ink">{expert.user?.name || expert.handle}</p>
                  <p className="text-xs sm:text-sm text-subtext mt-1">
                    Responds within {expert.sla_hours} hours
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-subtext mb-1">Total Price</div>
                  <div className="inline-flex items-center gap-2 bg-surface/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/20 shadow-sm">
                    <span className="font-bold text-ink text-2xl">
                      {formatPrice(expert.price_cents, expert.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Summary - Simplified */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-3">Your Question</label>
              <div className="space-y-3">
                {/* Title Card */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Question Title</div>
                  <div className="font-semibold text-gray-900 text-base">{questionData.title}</div>
                </div>

                {/* Recording Card - Only icon colored */}
                {hasRecording && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900 mb-1">
                          {recordingSegments.length} Recording{recordingSegments.length > 1 ? 's' : ''} Attached
                        </div>
                        <div className="text-xs text-gray-700">
                          Total length: {formatTime(totalDuration)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Context Card - Only icon colored */}
                {hasContext ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 mb-1">Written Details Added</div>
                        <div className="text-xs text-gray-700 line-clamp-2 break-words">{questionData.text}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-xs text-gray-500">No additional written context added</div>
                  </div>
                )}

                {/* Files Card - Only icon colored */}
                {hasAttachments ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-900 mb-2">
                          {attachments.length} File{attachments.length > 1 ? 's' : ''} Attached
                        </div>
                        <div className="space-y-1">
                          {attachments.map((file, idx) => (
                            <div key={idx} className="text-xs text-gray-700 truncate">
                              📎 {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-xs text-gray-500">No files attached</div>
                  </div>
                )}
              </div>
            </div>

            {/* All Ready Card - Kept green */}
            {(hasRecording || hasAttachments) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-green-900 mb-1">Ready to Send!</h3>
                    <p className="text-xs text-green-700">
                      Your question is complete and ready to submit. The expert will be notified immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Button */}
            <button
              onClick={onEdit}
              className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 touch-manipulation min-h-[48px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Go Back & Edit</span>
            </button>

            {/* Your Information Section */}
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-base sm:text-lg font-bold text-ink mb-4">Your Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-subtext mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition text-base"
                    placeholder="your.email@example.com"
                    required
                  />
                  <p className="text-xs text-subtext mt-1.5">
                    We'll send the expert's answer to this email address
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-subtext mb-2">
                      First Name <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition text-base"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-subtext mb-2">
                      Last Name <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition text-base"
                      placeholder="Smith"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 bg-surface border-t border-gray-200 px-4 sm:px-6 py-4 rounded-b-2xl">
            <button
              onClick={handleProceed}
              disabled={isSubmitting || !email}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none touch-manipulation min-h-[52px] text-base sm:text-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                <span>Proceed to Payment →</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskReviewModal;