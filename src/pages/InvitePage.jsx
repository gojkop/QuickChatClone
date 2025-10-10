// src/pages/InvitePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExpertIdentifier from '@/components/invite/ExpertIdentifier';
import QuestionComposer from '@/components/question/QuestionComposer';
import PriceProposal from '@/components/invite/PriceProposal';
import ReviewModal from '@/components/invite/ReviewModal';

function InvitePage() {
  const [step, setStep] = useState(1);
  const [expertInfo, setExpertInfo] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [priceProposal, setPriceProposal] = useState({ type: 'expert-decides', amount: null });
  
  const location = useLocation();
  const navigate = useNavigate();
  const questionComposerRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expert = params.get('expert');
    if (expert) {
      setExpertInfo({
        identifier: expert,
        type: 'name',
        name: expert
      });
      setStep(2);
    }
  }, [location.search]);

  const handleExpertIdentified = (info) => {
    setExpertInfo(info);
    setStep(2);
  };

  // KEY CHANGE: Made async to support video concatenation
  const handleContinueToReview = async () => {
    if (questionComposerRef.current) {
      // This will trigger concatenation if there are segments - now async!
      const data = await questionComposerRef.current.validateAndGetData();
      if (data) {
        console.log('Question data with duration:', data.recordingDuration);
        setQuestionData(data);
        setShowReviewModal(true);
      }
    }
  };

  const handleSendInvite = (contactInfo) => {
    console.log("Sending question with:", {
      expert: expertInfo,
      question: questionData,
      contact: contactInfo,
      priceProposal
    });
    
    navigate(`/invite-sent?expert=${encodeURIComponent(expertInfo.name)}&method=${expertInfo.type}`);
  };

  const handleEditQuestion = () => {
    setShowReviewModal(false);
  };

  const handleBackToIdentifier = () => {
    setStep(1);
    setExpertInfo(null);
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {[
          { num: 1, label: 'Who' },
          { num: 2, label: 'Question' },
          { num: 3, label: 'Review' }
        ].map((item, index) => (
          <React.Fragment key={item.num}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step >= item.num 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step > item.num ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  item.num
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                step >= item.num ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </div>
            {index < 2 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all ${
                step > item.num ? 'bg-indigo-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <main className="container mx-auto px-4 py-20 pt-32 sm:pt-40">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              {step === 1 ? (
                'Ask Anyone a Question'
              ) : (
                <>
                  Ask{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {expertInfo?.name}
                  </span>
                </>
              )}
            </h1>
            <p className="text-gray-600">
              {step === 1 
                ? 'Connect with anyone and get expert answers — we\'ll invite them to mindPick'
                : 'They\'ll get your question and an invitation to answer on mindPick'
              }
            </p>
          </div>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Step 1: Expert Identifier */}
          {step === 1 && (
            <ExpertIdentifier 
              onContinue={handleExpertIdentified}
              initialValue={expertInfo?.identifier || ''}
            />
          )}

          {/* Step 2: Question + Price */}
          {step === 2 && (
            <>
              <button
                onClick={handleBackToIdentifier}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Ask someone else</span>
              </button>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 mb-6">
                <QuestionComposer 
                  ref={questionComposerRef}
                  hideButton={true}
                />
              </div>

              <div className="space-y-4">
                <PriceProposal onPriceChange={setPriceProposal} />
                
                <button
                  onClick={handleContinueToReview}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Review & Send Question
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {showReviewModal && questionData && (
        <ReviewModal
          isOpen={showReviewModal}
          questionData={questionData}
          expertHandle={expertInfo.name}
          expertInfo={expertInfo}
          priceProposal={priceProposal}
          onClose={() => setShowReviewModal(false)}
          onEdit={handleEditQuestion}
          onSend={handleSendInvite}
        />
      )}
    </>
  );
}

export default InvitePage;