// src/components/dashboardv2/inbox/AnswerComposerPanel.jsx
// Answer composer panel for cascading layout

import React, { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import AnswerRecorder from '@/components/dashboard/AnswerRecorder';
import AnswerReviewModal from '@/components/dashboard/AnswerReviewModal';
import AnswerSubmittedModal from '@/components/dashboard/AnswerSubmittedModal';

/**
 * AnswerComposerPanel Component
 * Wraps the answer recording flow in a panel layout
 * Includes recording, review, and success states
 *
 * @param {Object} props
 * @param {Object} props.question - Question being answered
 * @param {Object} props.profile - Expert profile
 * @param {Function} props.onClose - Callback when closing the panel
 * @param {Function} props.onAnswerSubmitted - Callback after successful submission
 */
function AnswerComposerPanel({
  question,
  profile,
  onClose,
  onAnswerSubmitted
}) {
  const [answerData, setAnswerData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedAnswerId, setSubmittedAnswerId] = useState(null);

  // Handle when user clicks "Review Answer"
  const handleReady = (data) => {
    setAnswerData(data);
    setShowReviewModal(true);
  };

  // Handle going back from review to editing
  const handleBackToEdit = () => {
    setShowReviewModal(false);
  };

  // Handle successful answer submission
  const handleAnswerSubmitted = (answerId) => {
    setSubmittedAnswerId(answerId);
    setShowReviewModal(false);
    setShowSuccessModal(true);
  };

  // Handle closing success modal and returning to inbox
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onAnswerSubmitted?.();
    onClose();
  };

  if (!question || !profile) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-gray-500">
        <p>Loading question details...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close answer composer"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                Answer Question
              </h2>
              <p className="text-xs text-gray-500 truncate">
                Q-{question.id} · ${(question.price_cents / 100).toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          <AnswerRecorder
            question={question}
            onReady={handleReady}
            onCancel={onClose}
            expert={profile}
          />
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && answerData && (
        <AnswerReviewModal
          isOpen={showReviewModal}
          onClose={handleBackToEdit}
          question={question}
          answerData={answerData}
          userId={profile?.user?.id || profile?.id}
          onAnswerSubmitted={handleAnswerSubmitted}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && submittedAnswerId && (
        <AnswerSubmittedModal
          isOpen={showSuccessModal}
          onClose={handleSuccessClose}
          answerId={submittedAnswerId}
          questionId={question.id}
        />
      )}
    </div>
  );
}

export default AnswerComposerPanel;