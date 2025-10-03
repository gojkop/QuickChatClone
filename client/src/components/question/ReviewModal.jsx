import React, { useState } from 'react';
import DeliveryPreview from '@/components/invite/DeliveryPreview';

function ReviewModal({ isOpen, questionData, expertHandle, expertInfo, priceProposal, onClose, onEdit, onSend }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !questionData) return null;

  const handleSend = async () => {
    // Always require email for asker notifications
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address for notifications');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending (mock)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSend({
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
                  <p className="text-sm text-indigo-600 font-semibold mb-1">Inviting to QuickChat</p>
                  <p className="text-2xl font-bold text-indigo-900">{expertHandle}</p>
                </div>
                
                {/* Price Proposal Badge */}
                {priceProposal && (
                  <div className="text-right">
                    <div className="text-xs text-gray-600 mb-1">Price proposal</div>
                    <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-indigo-200 shadow-sm">
                      {priceProposal.type === 'expert-decides' ? (
                        <>
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="font-bold text-gray-900">Expert decides</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-gray-900">€{priceProposal.amount}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Question Title */}
            {questionData.title && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question Title</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-900">{questionData.title}</p>
                </div>
              </div>
            )}

            {/* Recording Preview */}
            {questionData.mediaBlob && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your {questionData.recordingMode === 'video' ? 'Video' : 'Audio'} Question
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  {questionData.recordingMode === 'video' ? (
                    <video
                      src={URL.createObjectURL(questionData.mediaBlob)}
                      controls
                      className="w-full"
                    />
                  ) : (
                    <div className="p-8 flex items-center justify-center bg-gray-900">
                      <audio
                        src={URL.createObjectURL(questionData.mediaBlob)}
                        controls
                        className="w-full max-w-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Context */}
            {questionData.text && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Context</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{questionData.text}</p>
                </div>
              </div>
            )}

            {/* Attached Files */}
            {questionData.files && questionData.files.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Attached Files</label>
                <div className="space-y-2">
                  {questionData.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
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
              <span>Edit Question or Price</span>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How They'll Receive the Invitation</h3>
              
              {/* Delivery Preview */}
              <DeliveryPreview 
                expertInfo={expertInfo}
                priceProposal={priceProposal}
              />
            </div>

            {/* Contact Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Contact Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                We'll send you confirmation and notify you when they respond
              </p>
              
              {/* Email (Always required for asker notifications) */}
              <div className="mb-4">
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
                <p className="text-xs text-gray-500 mt-1">For confirmation and response notifications</p>
              </div>

              {/* Name Fields (Optional) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSubmitting || !email}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {expertInfo?.type === 'email' ? 'Send Email Invitation' : 'Complete Invitation'}
                    </span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;