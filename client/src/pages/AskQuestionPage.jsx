import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionComposer from '@/components/question/QuestionComposer';
import AskReviewModal from '@/components/question/AskReviewModal'; // NEW: Import the new modal
import apiClient from '@/api';

function AskQuestionPage() {
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const composerRef = useRef();

  // NEW: State for the modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [questionData, setQuestionData] = useState(null);

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
        const response = await apiClient.get(`/3B14WLbJ/public/profile?handle=${handle}`);
        if (!response.data || !response.data.public) {
          throw new Error('This expert profile is private or does not exist.');
        }
        setExpert(response.data);
      } catch (err) {
        console.error("Failed to fetch expert profile:", err);
        setError(err.message || "Could not load expert details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpertProfile();
  }, [location.search]);

  // NEW: Handler to open the review modal
  const handleContinueToReview = () => {
    if (composerRef.current) {
      const data = composerRef.current.validateAndGetData();
      if (data) {
        setQuestionData(data);
        setShowReviewModal(true);
      }
    }
  };

  // NEW: Placeholder for payment logic
  const handleProceedToPayment = (askerInfo) => {
    console.log("Proceeding to payment with:");
    console.log("Asker Info:", askerInfo);
    console.log("Question Data:", questionData);
    console.log("Expert:", expert);

    // TODO: Implement payment logic here.
    // This is where you would call your backend to create a Stripe Checkout session,
    // and then redirect the user to the Stripe page.
    alert("Payment flow not implemented yet. Check the console for data.");
  };

  if (isLoading) {
    return <div className="text-center p-12">Loading expert details...</div>;
  }

  if (error) {
    return <div className="text-center p-12 text-red-600">{error}</div>;
  }

  return (
    <>
      <main className="container mx-auto px-4 py-20 pt-32 sm:pt-40">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Ask{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {expert.user?.name || 'this expert'}
              </span>
            </h1>
            <p className="text-gray-600">
              Compose your question below. They will respond within {expert.sla_hours} hours.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
            <QuestionComposer 
              ref={composerRef} 
              hideButton={true} // Hide the default button
            />
          </div>

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

      {/* NEW: Render the modal conditionally */}
      <AskReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onEdit={() => setShowReviewModal(false)} // Close modal to allow editing
        onProceedToPayment={handleProceedToPayment}
        questionData={questionData}
        expert={expert}
      />
    </>
  );
}

export default AskQuestionPage;