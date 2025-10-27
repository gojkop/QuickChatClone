// src/pages/AskQuestionPage.jsx - IMPROVED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import QuestionComposer from '@/components/question/QuestionComposer';
import AskReviewModal from '@/components/question/AskReviewModal';
import PaymentPlaceholder from '@/components/question-flow-v2/payment/PaymentPlaceholder';
import ProgressStepper from '@/components/common/ProgressStepper';
import FirstTimeUserTips from '@/components/common/FirstTimeUserTips';
import apiClient from '@/api';

const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

function AskQuestionPage() {
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const composerRef = useRef();

  // Tier selection from navigation state
  const tierInfo = location.state || {};
  const { tierType, tierConfig } = tierInfo;

  // Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [questionData, setQuestionData] = useState(null);
  const [askerInfo, setAskerInfo] = useState(null);

  // Deep Dive specific state
  const [proposedPrice, setProposedPrice] = useState('');
  const [askerMessage, setAskerMessage] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track isSubmitting state changes for debugging
  useEffect(() => {
    console.log('📊 [PAYMENT FLOW] AskQuestionPage isSubmitting changed:', isSubmitting);
  }, [isSubmitting]);

  useEffect(() => {
    const fetchExpertProfile = async () => {
      const params = new URLSearchParams(location.search);
      const handle = params.get('expert');

      console.log('🔍 AskQuestionPage - location.search:', location.search);
      console.log('🔍 AskQuestionPage - handle from params:', handle);
      console.log('🔍 AskQuestionPage - location.state:', location.state);

      if (!handle) {
        console.error('❌ No expert handle found in URL params');
        setError('No expert specified.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/public/profile?handle=${encodeURIComponent(handle)}`
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

  const handleContinueToReview = async () => {
    if (composerRef.current) {
      const data = await composerRef.current.validateAndGetData();
      if (data) {
        setQuestionData(data);
        setShowReviewModal(true);
      }
    }
  };

  const handleProceedToPayment = async (reviewInfo) => {
    // Validate Deep Dive offer amount
    if (tierType === 'deep_dive') {
      const priceValue = parseFloat(proposedPrice);
      if (!priceValue || priceValue <= 0) {
        alert('Please enter a valid offer amount');
        return;
      }
    }

    // Store asker info and move to payment step
    setAskerInfo(reviewInfo);
    setShowReviewModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentStart = () => {
    // Set submitting state immediately when payment processing begins
    console.log("💳 [PAYMENT FLOW] Payment processing started");
    console.log("🔄 [PAYMENT FLOW] Setting isSubmitting=true");
    setIsSubmitting(true);
    console.log("✅ [PAYMENT FLOW] Loader should be visible now");
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    console.log("💳 [PAYMENT FLOW] handlePaymentSuccess called");
    console.log("📊 [PAYMENT FLOW] Current isSubmitting:", isSubmitting);
    console.log("💳 [PAYMENT FLOW] Payment Intent ID:", paymentIntentId);

    try {
      // isSubmitting is already true from handlePaymentStart
      console.log("💳 [PAYMENT FLOW] Payment successful, starting question submission...");

      // ✅ STEP 1: Create media_asset record if recordings exist
      let mediaAssetId = null;

      if (questionData.recordingSegments && questionData.recordingSegments.length > 0) {
        console.log('📹 Creating media_asset record for', questionData.recordingSegments.length, 'segments');
        
        const firstSegment = questionData.recordingSegments[0];
        const totalDuration = questionData.recordingSegments.reduce((sum, seg) => sum + (seg.duration || 0), 0);
        
        const metadata = {
          type: 'multi-segment',
          mime_type: 'video/webm',
          segments: questionData.recordingSegments.map(seg => ({
            uid: seg.uid,
            playback_url: seg.playbackUrl,
            duration: seg.duration,
            mode: seg.mode,
            segment_index: seg.segmentIndex,
          })),
          segment_count: questionData.recordingSegments.length,
        };
        
        try {
          const response = await apiClient.post('/media_asset', {
            provider: 'cloudflare_stream',
            asset_id: firstSegment.uid,
            duration_sec: Math.round(totalDuration),
            status: 'ready',
            url: firstSegment.playbackUrl,
            metadata: JSON.stringify(metadata),
          });

          mediaAssetId = response.data?.id;
          console.log('✅ Media asset created, ID:', mediaAssetId);
        } catch (mediaError) {
          console.error('❌ Failed to create media_asset:', mediaError);
          alert('Failed to process media. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // ✅ STEP 2: Build payload with media_asset_id (NO recordingSegments array)
      const basePayload = {
        expertHandle: expert.handle,
        title: questionData.title,
        text: questionData.text || null,
        payerEmail: askerInfo.email,
        payerFirstName: askerInfo.firstName || null,
        payerLastName: askerInfo.lastName || null,
        media_asset_id: mediaAssetId, // ✅ Send the ID instead of segments array
        attachments: questionData.attachments || [],
        sla_hours_snapshot: tierConfig?.sla_hours || expert.sla_hours,
        stripe_payment_intent_id: paymentIntentId // Real payment ID from Stripe
      };

      // Add tier-specific fields
      let payload;
      let endpoint;

      if (tierType === 'deep_dive') {
        payload = {
          ...basePayload,
          proposed_price_cents: Math.round(parseFloat(proposedPrice) * 100),
          asker_message: askerMessage || null,
        };
        endpoint = '/api/questions/deep-dive';
      } else {
        // Quick Consult
        payload = basePayload;
        endpoint = '/api/questions/quick-consult';
      }

      console.log('Submitting question with payload:', {
        tierType: tierType || 'legacy',
        endpoint,
        media_asset_id: payload.media_asset_id,
        attachments: payload.attachments.length + ' attachments'
      });

      const response = await fetch(endpoint, {
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
      console.log('✅ Full backend response:', result);
      console.log('📦 Result.data structure:', result.data);

      // Note: Auto-decline logic is handled in Xano during question creation
      // Offers below auto_decline_below_cents threshold are created with pricing_status = 'offer_declined'

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        const expertName = expert.name || expert.user?.name || expert.handle;
        const questionId = result.data?.questionId || result.data?.id;

        const reviewToken = result.data?.reviewToken ||
                           result.data?.review_token ||
                           result.data?.token ||
                           result.reviewToken ||
                           result.review_token ||
                           result.token;

        console.log('🔍 Review token found:', reviewToken);
        console.log('🔍 Question ID:', questionId);

        const params = new URLSearchParams({
          question_id: questionId,
          expert: expert.handle,
          expertName: expertName,
        });

        if (reviewToken) {
          params.append('review_token', reviewToken);
          console.log('✅ Added review_token to URL params');
        } else {
          console.warn('⚠️ No review_token found in response.');
        }

        params.append('dev_mode', 'true');

        const navigationUrl = `/question-sent?${params.toString()}`;
        console.log('🚀 [PAYMENT FLOW] Preparing to navigate to:', navigationUrl);
        console.log('⚠️ [PAYMENT FLOW] KEEPING isSubmitting=true during navigation');
        console.log('📊 [PAYMENT FLOW] Final isSubmitting state before navigate:', isSubmitting);

        // Keep isSubmitting true during navigation - don't set to false
        // The loader will stay active until the new page loads
        console.log('🌐 [PAYMENT FLOW] Calling navigate() - page will change now');
        navigate(navigationUrl);
        console.log('✅ [PAYMENT FLOW] navigate() called, component should unmount soon');
      }

    } catch (error) {
      console.error('❌ [PAYMENT FLOW] Submission error:', error);
      console.error('❌ [PAYMENT FLOW] Error details:', {
        message: error.message,
        stack: error.stack
      });
      console.log('🔄 [PAYMENT FLOW] Setting isSubmitting=false due to error');
      setIsSubmitting(false);
      console.log('✅ [PAYMENT FLOW] Loader should hide now (error state)');
      alert(`Error: ${error.message}`);

      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Proceed to Payment';
      }
    }
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
    return (
      <main className="container mx-auto px-4 py-20 pt-32 sm:pt-40">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <a 
                href="/" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-12 sm:py-20 pt-24 sm:pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Progress Stepper */}
          <ProgressStepper currentStep={1} />

          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Ask{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {expert.name || expert.user?.name || expert.handle}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              They will respond within <strong>{tierConfig?.sla_hours || expert.sla_hours} hours</strong>
            </p>
          </div>

          {/* First Time User Tips */}
          <FirstTimeUserTips />

{/* How It Works - Compact Info */}
<div className="bg-indigo-50/50 border border-indigo-200 rounded-lg p-4 mb-6">
  <div className="flex items-start gap-2 mb-2">
    <svg className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="text-xs sm:text-sm text-indigo-900">
      <span className="font-semibold">Compose your question</span> (video/audio/text)
      <span className="mx-1">→</span>
      <span className="font-semibold">
        Pay {
          tierType === 'quick_consult'
            ? formatPrice(tierConfig?.price_cents, expert.currency)
            : tierType === 'deep_dive' && proposedPrice
            ? `$${proposedPrice}`
            : formatPrice(expert.price_cents, expert.currency)
        }
      </span>
      <span className="mx-1">→</span>
      <span className="font-semibold">Get answer</span> within {
        tierConfig?.sla_hours || expert.sla_hours
      }h via email
    </div>
  </div>
</div>

          {/* Tier Information Banner */}
          {tierType && (
            <div className={`mb-6 p-4 rounded-lg border-2 ${
              tierType === 'quick_consult'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-purple-50 border-purple-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {tierType === 'quick_consult' ? '⚡' : '🎯'}
                </span>
                <h3 className="font-bold text-gray-900">
                  {tierType === 'quick_consult' ? 'Quick Consult' : 'Deep Dive'}
                </h3>
              </div>
              <div className="text-sm text-gray-700">
                {tierType === 'quick_consult' ? (
                  <>
                    <p className="font-semibold">
                      Fixed Price: {formatPrice(tierConfig?.price_cents)}
                    </p>
                    <p className="text-gray-600">
                      Your answer will be delivered within {tierConfig?.sla_hours} hours after payment
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">
                      Suggested Range: {formatPrice(tierConfig?.min_price_cents)} - {formatPrice(tierConfig?.max_price_cents)}
                    </p>
                    <p className="text-gray-600">
                      Expert will review your offer. Answer delivered within {tierConfig?.sla_hours} hours after acceptance.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Question Composer */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
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

          {/* Deep Dive: Price Offer & Message */}
          {tierType === 'deep_dive' && (
            <div className="mt-6 bg-purple-50 rounded-xl border-2 border-purple-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Make Your Offer</h3>

              {/* Price Input */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Offer Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    placeholder={`${(tierConfig?.min_price_cents || 0) / 100} - ${(tierConfig?.max_price_cents || 0) / 100}`}
                    step="1"
                    className="w-full pl-8 pr-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Suggested range: {formatPrice(tierConfig?.min_price_cents)} - {formatPrice(tierConfig?.max_price_cents)}
                </p>
              </div>

              {/* Message to Expert */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message to Expert (Optional)
                </label>
                <textarea
                  value={askerMessage}
                  onChange={(e) => setAskerMessage(e.target.value)}
                  placeholder="Explain why this question is urgent or important to you..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Help the expert understand the context and urgency of your question
                </p>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="mt-6">
            <button 
              onClick={handleContinueToReview} 
              className="w-full text-base sm:text-lg font-bold py-4 px-6 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] touch-manipulation min-h-[52px]"
            >
              Continue to Review →
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
            <p>
              Questions? Check our{' '}
              <a href="/faq" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Help Center
              </a>
            </p>
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
        tierType={tierType}
        tierConfig={tierConfig}
        proposedPrice={proposedPrice}
      />

      {/* Payment Modal */}
      {showPaymentModal && questionData && askerInfo && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPaymentModal(false)}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Progress Stepper */}
              <div className="pt-6 px-4 sm:px-6">
                <ProgressStepper currentStep={3} />
              </div>

              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isSubmitting}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Payment Content */}
              <div className="p-6">
                <PaymentPlaceholder
                  expert={expert}
                  tierType={tierType}
                  tierConfig={tierConfig}
                  composeData={{
                    title: questionData.title,
                    text: questionData.text,
                    recordings: questionData.recordingSegments,
                    attachments: questionData.attachments,
                    tierSpecific: tierType === 'deep_dive' ? { price: proposedPrice } : null
                  }}
                  reviewData={askerInfo}
                  onSubmit={handlePaymentSuccess}
                  onPaymentStart={handlePaymentStart}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discrete Loading Overlay - Question Submission */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-[9999]">
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
                  Submitting Question
                </h3>
                <p className="text-sm text-gray-600">
                  Processing your question and uploading media...
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AskQuestionPage;