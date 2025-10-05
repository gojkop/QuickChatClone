// src/components/dashboard/AnswerReviewModal.jsx
import React, { useState } from 'react';
import AnswerSubmittedModal from './AnswerSubmittedModal';

function AnswerReviewModal({ isOpen, onClose, answerData, question, onSubmit, onEdit }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  if (!isOpen || !answerData) return null;

  const handleSubmit = async () => {
    // TODO: Implement actual submission with loading state
    // For now, we'll simulate the submission
    console.log('Submitting answer:', answerData);
    
    // Close review modal
    onClose();
    
    // Show success modal
    setShowSuccessModal(true);
    
    // Call parent's onSubmit if provided
    if (onSubmit) {
      onSubmit(answerData);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const hasRecording = !!answerData.mediaBlob;
  const hasText = !!answerData.text && answerData.text.trim().length > 0;
  const hasFiles = answerData.files && answerData.files.length > 0;

  return (
    <>
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

              {/* Answer Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Answer Summary</h3>
                <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">

                  {/* Recording Status */}
                  <div className="flex items-start">
                    <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">
                      {answerData.recordingMode === 'video' ? 'Video' : 'Audio'}
                    </span>
                    {hasRecording ? (
                      <div className="text-sm font-medium text-green-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Recording Added</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No Recording</span>
                    )}
                  </div>

                  {/* Written Response Status */}
                  <div className="flex items-start">
                    <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Written</span>
                    {hasText ? (
                      <div className="text-sm font-medium text-green-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Added ({answerData.text.length} characters)</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not Added</span>
                    )}
                  </div>

                  {/* Attachments Status */}
                  <div className="flex items-start">
                    <span className="w-28 text-xs font-semibold text-gray-500 uppercase flex-shrink-0">Files</span>
                    {hasFiles ? (
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-700 flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{answerData.files.length} file{answerData.files.length !== 1 ? 's' : ''} attached</span>
                        </div>
                        <ul className="text-sm list-disc pl-5 text-gray-700">
                          {answerData.files.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No Files Attached</span>
                    )}
                  </div>
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
                      <li>• Payment will be processed upon submission</li>
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
                  disabled={!hasRecording && !hasText}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnswerSubmittedModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        answerData={answerData}
        question={question}
      />
    </>
  );
}

export default AnswerReviewModal;