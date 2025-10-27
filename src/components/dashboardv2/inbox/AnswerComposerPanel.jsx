// src/components/dashboardv2/inbox/AnswerComposerPanel.jsx
// Answer composer panel for cascading layout

import React, { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import AnswerRecorder from '@/components/dashboard/AnswerRecorder';
import { useAnswerUpload } from '@/hooks/useAnswerUpload';

function AnswerComposerPanel({
  question,
  profile,
  onClose,
  onAnswerSubmitted
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const answerUpload = useAnswerUpload();

  const handleReady = async (data) => {
    console.log('🎬 handleReady called with data:', data);
    console.log('📊 Question ID:', question.id);
    console.log('👤 Profile:', profile);

    // Start submission immediately in background
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get user_id from expert_profile (not expert_profile.id)
      const userId = profile?.user_id;
      console.log('🔑 User ID for submission:', userId);
      console.log('🔍 Full profile object:', profile);

      if (!userId) {
        throw new Error('User ID not found in profile. Please try logging in again.');
      }

      console.log('🚀 Calling submitAnswer...');
      const result = await answerUpload.submitAnswer(data, question.id, userId);

      console.log('✅ Answer submitted successfully:', result);

      // Brief success state, then trigger callback
      setTimeout(() => {
        console.log('📍 Triggering onAnswerSubmitted callback');
        onAnswerSubmitted?.(question.id);
        onClose();
      }, 800);

    } catch (error) {
      console.error('❌ Failed to submit answer:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setSubmitError(error.message || 'Failed to submit answer');
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Discrete Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm mx-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 size={48} className="text-indigo-600 animate-spin" />
                <CheckCircle
                  size={24}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 opacity-30"
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Submitting Answer
                </h3>
                <p className="text-sm text-gray-600">
                  Processing your answer and uploading media...
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && !isSubmitting && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-1">
                  Submission Failed
                </h4>
                <p className="text-sm text-red-700">{submitError}</p>
                <button
                  onClick={() => setSubmitError(null)}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnswerComposerPanel;