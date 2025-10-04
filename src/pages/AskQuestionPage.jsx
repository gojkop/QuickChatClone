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

  // State for the modal
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
        console.log('Fetching expert profile for handle:', handle);
        
        // Use the correct API endpoint (api:BQW1GS7L) with direct fetch
        const response = await fetch(
          `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/public/profile?handle=${encodeURIComponent(handle)}`
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This expert does not exist.');
          }
          throw new Error('Could not load expert profile.');
        }

        const data = await response.json();
        console.log('Expert profile data:', data);

        // Check if profile exists and is public
        const expertProfile = data?.expert_profile ?? data;
        const publicValue = expertProfile?.public ?? expertProfile?.is_public ?? expertProfile?.isPublic;
        
        // Coerce public value to boolean
        const isPublic = publicValue === true || publicValue === 1 || 
                        publicValue === '1' || publicValue === 'true';

        if (!isPublic) {
          throw new Error('This expert profile is private.');
        }

        setExpert({
          ...expertProfile,
          user: data?.user ?? expertProfile?.user,
          name: expertProfile?.name ?? data?.user?.name,
        });
      } catch (err) {
        console.error("Failed to fetch expert profile:", err);
        setError(err.message || "Could not load expert details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpertProfile();
  }, [location.search]);

  // Handler to open the review modal
  const handleContinueToReview = () => {
    if (composerRef.current) {
      const data = composerRef.current.validateAndGetData();
      if (data) {
        setQuestionData(data);
        setShowReviewModal(true);
      }
    }
  };

  // Placeholder for payment logic
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
    const isNotFound = error.includes('does not exist');
    const isPrivate = error.includes('private');

    return (
      <main className="container mx-auto px-4 py-20 pt-32 sm:pt-40">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isNotFound ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}>
                <svg className={`w-10 h-10 ${isNotFound ? 'text-amber-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isNotFound ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  )}
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {isNotFound ? 'Expert Not Found' : isPrivate ? 'Profile is Private' : 'Oops!'}
              </h2>
              
              <p className="text-gray-600 mb-6">{error}</p>
              
              {isNotFound ? (
                <>
                  <p className="text-gray-600 mb-6">
                    But you can invite them to join QuickChat!
                  </p>
                  <a
                    href={`/invite?expert=${new URLSearchParams(location.search).get('expert')}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Invite Them to QuickChat</span>
                  </a>
                </>
              ) : (
                <a 
                  href="/"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span>Browse Other Experts</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">or</p>
                <a 
                  href="/"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to home</span>
                </a>
              </div>
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

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
            <QuestionComposer 
              ref={composerRef} 
              hideButton={true}
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

      {/* Render the modal conditionally */}
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