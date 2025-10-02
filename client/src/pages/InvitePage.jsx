import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionComposer from '@/components/question/QuestionComposer';
import PriceProposal from '@/components/invite/PriceProposal';
import ReviewModal from '@/components/question/ReviewModal';

function InvitePage() {
  const [expertHandle, setExpertHandle] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [priceProposal, setPriceProposal] = useState({ type: 'expert-decides', amount: null });
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expert = params.get('expert') || 'an expert';
    setExpertHandle(expert);
  }, [location.search]);
  
  const handleQuestionReady = (data) => {
    // Store question data and open review modal
    setQuestionData(data);
    setShowReviewModal(true);
  };

  const handleSendInvite = (contactInfo) => {
    console.log("Sending invite with:", {
      expertHandle,
      question: questionData,
      contact: contactInfo,
      priceProposal
    });
    
    // Navigate to invite-specific success page with expert name
    navigate(`/invite-sent?expert=${encodeURIComponent(expertHandle)}`);
  };

  const handleEditQuestion = () => {
    // Close modal to return to editing
    setShowReviewModal(false);
  };

  return (
    <>
      <main className="container mx-auto px-4 py-20 pt-32 sm:pt-40">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Invite{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {expertHandle}
              </span>
            </h1>
            <p className="text-gray-600">
              They're not on QuickChat yet. Send your question and we'll invite them to join.
            </p>
          </div>

          {/* Question Composer */}
          <QuestionComposer onReady={handleQuestionReady} />

          {/* Price Proposal - Compact version close to the button */}
          <div className="mt-4 space-y-3">
            <PriceProposal 
              onPriceChange={setPriceProposal}
              compact={true}
            />
            
            {/* Price Summary Preview */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">Price proposal:</span>
                <span className="font-bold text-indigo-700">
                  {priceProposal.type === 'expert-decides' 
                    ? 'Expert will decide' 
                    : `€${priceProposal.amount}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          questionData={questionData}
          expertHandle={expertHandle}
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