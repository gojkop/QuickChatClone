import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlowContainer from '@/components/question-flow-v2/layout/FlowContainer';
import AccordionSection from '@/components/question-flow-v2/layout/AccordionSection';
import ProgressDots from '@/components/question-flow-v2/layout/ProgressDots';
import StepCompose from '@/components/question-flow-v2/steps/StepCompose';
import StepReview from '@/components/question-flow-v2/steps/StepReview';
import StepPayment from '@/components/question-flow-v2/steps/StepPayment';
import { useFlowState } from '@/components/question-flow-v2/hooks/useFlowState';
import ErrorBoundary from '@/components/question-flow-v2/shared/ErrorBoundary';


function AskQuestionPageV2() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationState = location.state || {};
  
  const [expert, setExpert] = useState(navigationState.expert || null);
  const [tierType, setTierType] = useState(navigationState.tierType || null);
  const [tierConfig, setTierConfig] = useState(navigationState.tierConfig || null);
  const [isLoading, setIsLoading] = useState(!navigationState.expert);
  const [error, setError] = useState('');

  const { state, actions } = useFlowState();

  useEffect(() => {
    const fetchExpertFromURL = async () => {
      if (navigationState.expert) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams(location.search);
      const handle = params.get('expert');
      const tier = params.get('tier');

      if (!handle) {
        console.error('❌ No expert handle found in URL params');
        setError('No expert specified.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
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
          console.log('Expert not accepting questions, redirecting to profile');
          navigate(`/u/${handle}`, { replace: true });
          return;
        }

        const expertData = {
          ...expertProfile,
          user: data?.user ?? expertProfile?.user,
          name: expertProfile?.name ?? data?.user?.name ?? handle,
          handle: expertProfile?.handle ?? handle,
          accepting_questions: isAcceptingQuestions,
        };

        setExpert(expertData);

        const determinedTierType = tier || 'quick_consult';
        setTierType(determinedTierType);

        if (determinedTierType === 'quick_consult') {
          setTierConfig({
            price_cents: expertData.price_cents || 0,
            sla_hours: expertData.sla_hours || 48
          });
        } else if (determinedTierType === 'deep_dive') {
          const deepDiveTiers = expertData.deep_dive_tiers || expertData.tiers;
          if (deepDiveTiers && deepDiveTiers.length > 0) {
            setTierConfig(deepDiveTiers[0]);
          } else {
            setTierConfig({
              min_price_cents: 5000,
              max_price_cents: 50000,
              sla_hours: expertData.sla_hours || 48
            });
          }
        }

        console.log('Expert profile loaded successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Failed to fetch expert profile:', err);
        setError(err.message || 'Could not load expert details.');
        setIsLoading(false);
      }
    };

    fetchExpertFromURL();
  }, [location.search, navigationState.expert, navigate]);

  const handleComposeComplete = () => {
    if (!state.compose.title || state.compose.title.length < 5) {
      alert('Please enter a question title (at least 5 characters)');
      return;
    }

    if (tierType === 'deep_dive') {
      const priceValue = parseFloat(state.compose.tierSpecific?.proposedPrice);
      if (!priceValue || priceValue <= 0) {
        alert('Please enter a valid offer amount');
        return;
      }
    }

    actions.completeStep(1);
    actions.goToStep(2);
  };

  const handleReviewComplete = () => {
    if (!state.review.email || !state.review.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    actions.completeStep(2);
    actions.goToStep(3);
  };

  const handleEditCompose = () => {
    actions.goToStep(1);
  };

  // ✅ PREMIUM: Enhanced Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
            <div className="absolute inset-0 inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">Loading expert profile...</p>
          <p className="text-gray-500 text-sm">Preparing your question flow</p>
        </div>
      </div>
    );
  }

  // ✅ PREMIUM: Enhanced Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50/20 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="review-card-glass rounded-2xl p-8 border-2 border-red-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="heading-gradient-primary text-2xl mb-3">Oops!</h2>
            <p className="text-gray-700 mb-6 body-text-premium">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-gradient-primary btn-premium w-full py-3 px-6 rounded-xl font-semibold text-white transition-all"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ PREMIUM: Enhanced No Expert State
  if (!expert || !expert.handle) {
    console.error('❌ No expert data available');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="review-card-glass rounded-2xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="heading-gradient-primary text-xl mb-3">No Expert Data</h2>
            <p className="text-gray-600 mb-6 body-text-premium">We couldn't find the expert information you're looking for.</p>
            <button
              onClick={() => navigate('/')}
              className="btn-gradient-primary btn-premium w-full py-3 px-6 rounded-xl font-semibold text-white transition-all"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const safeExpert = {
    ...expert,
    name: expert.name || expert.user?.name || expert.handle || 'Expert',
    handle: expert.handle,
    price_cents: expert.price_cents || 0,
    currency: expert.currency || 'USD',
    sla_hours: expert.sla_hours || 48,
    id: expert.id || expert._id || null
  };

  return (
    <ErrorBoundary>
      {/* ✅ PREMIUM: Enhanced background gradient with better container structure */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 pt-20 sm:pt-24 pb-32 sm:pb-8">
        <div className="container-premium">
          {/* ✅ PREMIUM: Progress Dots with spacing */}
          <div className="progress-dots-container spacing-lg">
            <ProgressDots
              currentStep={state.currentStep}
              completedSteps={state.completedSteps}
            />
          </div>

          <FlowContainer expert={safeExpert} tierType={tierType} tierConfig={tierConfig}>
            {/* ✅ PREMIUM: Content flow wrapper for consistent spacing */}
            <div className="content-flow">
              {/* Step 1: Compose */}
              <AccordionSection
                step={1}
                title="Compose Your Question"
                icon="compose"
                state={state.currentStep === 1 ? 'active' : state.completedSteps.includes(1) ? 'completed' : 'locked'}
                isExpandable={true}
                onEdit={handleEditCompose}
              >
                <ErrorBoundary>
                  <StepCompose
                    expert={safeExpert}
                    tierType={tierType}
                    tierConfig={tierConfig}
                    composeData={state.compose}
                    onUpdate={actions.updateCompose}
                    onContinue={handleComposeComplete}
                  />
                </ErrorBoundary>
              </AccordionSection>

              {/* Step 2: Review */}
              <AccordionSection
                step={2}
                title="Review & Contact Info"
                icon="review"
                state={state.currentStep === 2 ? 'active' : state.completedSteps.includes(2) ? 'completed' : 'locked'}
                isExpandable={true}
                onEdit={() => actions.goToStep(2)}
              >
                <ErrorBoundary>
                  <StepReview
                    expert={safeExpert}
                    tierType={tierType}
                    tierConfig={tierConfig}
                    composeData={state.compose}
                    reviewData={state.review}
                    onUpdate={actions.updateReview}
                    onContinue={handleReviewComplete}
                    onEditCompose={handleEditCompose}
                  />
                </ErrorBoundary>
              </AccordionSection>

              {/* Step 3: Payment */}
              <AccordionSection
                step={3}
                title="Payment & Submit"
                icon="payment"
                state={state.currentStep === 3 ? 'active' : 'locked'}
                isExpandable={false}
              >
                <ErrorBoundary>
                  <StepPayment
                    expert={safeExpert}
                    tierType={tierType}
                    tierConfig={tierConfig}
                    composeData={state.compose}
                    reviewData={state.review}
                  />
                </ErrorBoundary>
              </AccordionSection>
            </div>
          </FlowContainer>
        </div>

        {/* ✅ PREMIUM: Mobile Footer with enhanced styling */}
        {state.currentStep <= 2 && (
          <MobileFooterButton 
            state={state}
            tierType={tierType}
            onComposeComplete={handleComposeComplete}
            onReviewComplete={handleReviewComplete}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

// ✅ PREMIUM: Enhanced Mobile Footer Button Component
function MobileFooterButton({ state, tierType, onComposeComplete, onReviewComplete }) {
  if (state.currentStep === 1) {
    const titleText = state.compose?.title || '';
    const trimmedTitle = titleText.trim();
    const hasValidTitle = trimmedTitle.length >= 5;
    const hasPrice = tierType === 'deep_dive' 
      ? state.compose.tierSpecific?.proposedPrice && parseFloat(state.compose.tierSpecific.proposedPrice) > 0
      : true;
    
    const buttonText = trimmedTitle.length === 0
      ? 'Enter a title to continue'
      : trimmedTitle.length < 5
      ? `Title too short (${trimmedTitle.length}/5 characters)`
      : tierType === 'deep_dive' && !hasPrice
      ? 'Enter your offer amount'
      : 'Continue to Review →';
    
    const isDisabled = !hasValidTitle || !hasPrice;

    return (
      <div 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 animate-slideUpFooter" 
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)',
          // ✅ PREMIUM: Glass morphism effect with enhanced blur
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          // ✅ PREMIUM: Subtle gradient border
          borderTop: '1px solid rgba(229, 231, 235, 0.6)',
          // ✅ PREMIUM: Multi-layered shadow with inset highlight
          boxShadow: '0 -4px 16px 0 rgba(0, 0, 0, 0.08), 0 -2px 8px 0 rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="p-4">
          <button
            onClick={onComposeComplete}
            disabled={isDisabled}
            className={`btn-premium w-full font-bold py-4 px-6 rounded-xl touch-manipulation transition-all ${
              isDisabled 
                ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-100 cursor-not-allowed opacity-60' 
                : 'btn-gradient-primary text-white'
            }`}
            style={{
              minHeight: '52px',
              fontSize: '16px',
              letterSpacing: '0.01em'
            }}
          >
            {isDisabled ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {buttonText}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {buttonText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (state.currentStep === 2) {
    const hasEmail = state.review.email && state.review.email.includes('@');
    const buttonText = !state.review.email
      ? 'Enter your email to continue'
      : !state.review.email.includes('@')
      ? 'Please enter a valid email'
      : 'Continue to Payment →';

    return (
      <div 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 animate-slideUpFooter" 
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)',
          // ✅ PREMIUM: Glass morphism effect with enhanced blur
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          // ✅ PREMIUM: Subtle gradient border
          borderTop: '1px solid rgba(229, 231, 235, 0.6)',
          // ✅ PREMIUM: Multi-layered shadow with inset highlight
          boxShadow: '0 -4px 16px 0 rgba(0, 0, 0, 0.08), 0 -2px 8px 0 rgba(0, 0, 0, 0.04), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)'
        }}
      >
        <div className="p-4">
          <button
            onClick={onReviewComplete}
            disabled={!hasEmail}
            className={`btn-premium w-full font-bold py-4 px-6 rounded-xl touch-manipulation transition-all ${
              !hasEmail 
                ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-100 cursor-not-allowed opacity-60' 
                : 'btn-gradient-primary text-white'
            }`}
            style={{
              minHeight: '52px',
              fontSize: '16px',
              letterSpacing: '0.01em'
            }}
          >
            {!hasEmail ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {buttonText}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {buttonText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default AskQuestionPageV2;