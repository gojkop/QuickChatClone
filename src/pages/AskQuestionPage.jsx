// src/pages/AskQuestionPage.jsx - Modified with Optional AI Coach

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionComposer from '@/components/question/QuestionComposer';
import AskReviewModal from '@/components/question/AskReviewModal';

function AskQuestionPage() {
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const composerRef = useRef();

  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [questionData, setQuestionData] = useState(null);

  // ... existing useEffect for fetching expert ...
  useEffect(() => {
    const fetchExpertProfile = async () => {
      const params = new URLSearchParams(location.search);
      const handle = params.get('expert');
      
      if (!handle) {
        setError('No expert specified.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/public/profile?handle=${encodeURIComponent(handle)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This expert does not exist.');
          }
          throw new Error('Could not load expert profile.');
        }

        const data = await response.json();
        const expertProfile = data?.expert_profile ?? data;
        const publicValue = expertProfile?.public ?? expertProfile?.is_public ?? expertProfile?.isPublic;
        
        const isPublic = publicValue === true || publicValue === 1 || 
                        publicValue === '1' || publicValue === 'true';

        if (!isPublic) {
          throw new Error('This expert profile is private.');
        }

        const acceptingQuestionsValue = expertProfile?.accepting_questions;
        const isAcceptingQuestions = acceptingQuestionsValue === true || 
                                     acceptingQuestionsValue === 1 || 
                                     acceptingQuestionsValue === '1' || 
                                     acceptingQuestionsValue === 'true';

        if (!isAcceptingQuestions) {
          navigate(`/u/${handle}`, { replace: true });
          return;
        }

        setExpert({
          ...expertProfile,
          user: data?.user ?? expertProfile?.user,
          name: expertProfile?.name ?? data?.user?.name,
          accepting_questions: isAcceptingQuestions,
        });
      } catch (err) {
        console.error("Failed to fetch expert profile:", err);
        setError(err.message || "Could not load expert details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpertProfile();
  }, [location.search, navigate]);

  // Handle continue to review
  const handleContinueToReview = async () => {
    if (composerRef.current) {
      const data = await composerRef.current.validateAndGetData();
      if (data) {
        console.log('Question data:', data);
        setQuestionData(data);
        setShowReviewModal(true);
      }
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = async (askerInfo) => {
    try {
      console.log("Starting question submission...");
      
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      const payload = {
        expertHandle: expert.handle,
        title: questionData.title,
        text: questionData.text || null,
        payerEmail: askerInfo.email,
        payerFirstName: askerInfo.firstName || null,
        payerLastName: askerInfo.lastName || null,
        recordingSegments: questionData.recordingSegments || [],
        attachments: questionData.attachments || []
      };

      console.log('Submitting question with payload:', {
        ...payload,
        recordingSegments: payload.recordingSegments.length + ' segments',
        attachments: payload.attachments.length + ' attachments'
      });

      const response = await fetch('/api/questions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Submission failed (${response.status})`;
        
        try {
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            console.error('Backend returned non-JSON response:', errorText.substring(0, 500));
            errorMessage = `Server error (${response.status}). Check backend logs.`;
          } catch (textError) {
            console.error('Could not read error response:', textError);
            errorMessage = `Server error (${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Question submitted successfully:', result);

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        const expertName = expert.name || expert.user?.name || expert.handle;
        navigate(`/question-sent?question_id=${result.data.questionId}&expert=${expert.handle}&expertName=${encodeURIComponent(expertName)}&dev_mode=true`);
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error.message}`);
      
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Proceed to Payment';
      }
    }
  };

  // ... existing loading/error states ...
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-20 pt-32 sm:pt-40">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading expert details...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    // ... existing error UI ...
    return (
      <main className="container mx-auto px-4 py-20 pt-32 sm:pt-40">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <a href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300">
                Back to home
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-20 pt-32 sm:pt-40">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Ask{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {expert.name || expert.user?.name || expert.handle}
              </span>
            </h1>
            <p className="text-gray-600">
              Compose your question below. They will respond within {expert.sla_hours} hours.
            </p>
          </div>

          {/* Question Composer */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
            <QuestionComposer 
              ref={composerRef} 
              hideButton={true}
              expertId={expert.id}
              expertProfile={{
                name: expert.name || expert.user?.name,
                specialty: expert.specialty,
                price: expert.price_cents
              }}
            />
          </div>

          {/* Continue Button */}
          <div className="mt-6">
            <button 
              onClick={handleContinueToReview} 
              className="w-full text-lg font-bold py-4 px-4 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg transition-all"
            >
              Continue to Review
            </button>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      <AskReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onEdit={() => setShowReviewModal(false)}
        onProceedToPayment={handleProceedToPayment}
        questionData={questionData}
        expert={expert}
      />
    </>
  );
}

export default AskQuestionPage;