// src/components/dashboardv2/inbox/AnswerComposerPanel.jsx
// Answer composer panel for cascading layout

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AnswerRecorder from '@/components/dashboard/AnswerRecorder';
import AnswerReviewModal from '@/components/dashboard/AnswerReviewModal';

function AnswerComposerPanel({
  question,
  profile,
  onClose,
  onAnswerSubmitted
}) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [answerData, setAnswerData] = useState(null);

  const handleReady = (data) => {
    console.log('🎬 handleReady called - showing review modal');
    console.log('📦 Answer data:', data);

    // Store answer data and show review modal
    setAnswerData(data);
    setShowReviewModal(true);
  };

  const handleSubmitSuccess = (result) => {
    console.log('✅ Answer submitted successfully from review modal:', result);

    // Trigger parent callback after brief delay
    setTimeout(() => {
      console.log('📍 Triggering onAnswerSubmitted callback');
      onAnswerSubmitted?.(question.id);
      onClose();
    }, 800);
  };

  if (!question || !profile) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-gray-500">
        <p>Loading question details...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            aria-label="Back to question"
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

      {/* Answer Review Modal */}
      <AnswerReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        answerData={answerData}
        question={question}
        onEdit={() => setShowReviewModal(false)}
        onSubmitSuccess={handleSubmitSuccess}
        userId={profile?.user_id}
      />
    </div>
  );
}

export default AnswerComposerPanel;