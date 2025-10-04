import React, { useState } from 'react';

// Helper to format price from cents
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
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

            {/* Detailed Question Review Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Your Question Summary</label>
              <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">

                {/* Title */}
                <div className="flex items-start">
                  <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Title</span>
                  <p className="text-gray-900 text-sm font-medium">{questionData.title}</p>
                </div>

                {/* Recording */}
                {questionData.mediaBlob && (
                  <div className="flex items-start">
                    <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">
                      {questionData.recordingMode === 'video' ? 'Video' : 'Audio'}
                    </span>
                    <div className="text-sm font-medium text-green-700 flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                       <span>Recording Added</span>
                    </div>
                  </div>
                )}

                {/* Additional Context */}
                <div className="flex items-start">
                  <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Context</span>
                  {questionData.text ? (
                     <p className="text-sm text-gray-800 whitespace-pre-wrap">{questionData.text}</p>
                  ) : (
                    <span className="text-sm text-gray-500">Not Added</span>
                  )}
                </div>

                {/* Attached Files */}
                <div className="flex items-start">
                  <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Files</span>
                  {questionData.files && questionData.files.length > 0 ? (
                    <ul className="text-sm list-disc pl-5">
                      {questionData.files.map((file, index) => (
                        <li key={index} className="text-gray-800">{file.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-gray-500">No Files Attached</span>
                  )}
                </div>
              </div>
            </div>


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