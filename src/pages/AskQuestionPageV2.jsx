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
  
  // State from navigation OR will be fetched from URL
  const navigationState = location.state || {};
  
  const [expert, setExpert] = useState(navigationState.expert || null);
  const [tierType, setTierType] = useState(navigationState.tierType || null);
  const [tierConfig, setTierConfig] = useState(navigationState.tierConfig || null);
  const [isLoading, setIsLoading] = useState(!navigationState.expert);
  const [error, setError] = useState('');

  const { state, actions } = useFlowState();

  // Fetch expert data from URL params if not provided via navigation
  useEffect(() => {
    const fetchExpertFromURL = async () => {
      // If we already have expert data from navigation, skip fetch
      if (navigationState.expert) {
        console.log('✅ Using expert data from navigation state');
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams(location.search);
      const handle = params.get('expert');
      const tier = params.get('tier'); // 'quick_consult' or 'deep_dive'

      console.log('🔍 AskQuestionPageV2 - URL params:', { handle, tier });

      if (!handle) {
        console.error('❌ No expert handle found in URL params');
        setError('No expert specified.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        console.log('📡 Fetching expert profile for:', handle);
        
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
        console.log('📦 Raw API response:', data);
        
        const expertProfile = data?.expert_profile ?? data;
        console.log('📋 Expert profile extracted:', expertProfile);
        
        // Check if profile is public
        const publicValue = expertProfile?.public ?? expertProfile?.is_public ?? expertProfile?.isPublic;
        const isPublic = publicValue === true || publicValue === 1 || 
                        publicValue === '1' || publicValue === 'true';

        if (!isPublic) {
          throw new Error('This expert profile is private.');
        }

        // Check if accepting questions
        const acceptingQuestionsValue = expertProfile?.accepting_questions;
        const isAcceptingQuestions = acceptingQuestionsValue === true || 
                                     acceptingQuestionsValue === 1 || 
                                     acceptingQuestionsValue === '1' || 
                                     acceptingQuestionsValue === 'true';

        if (!isAcceptingQuestions) {
          console.log('⚠️ Expert not accepting questions, redirecting to profile');
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

        console.log('✅ Expert data loaded:', expertData);
        console.log('📋 Expert has name:', expertData.name);
        console.log('📋 Expert has handle:', expertData.handle);
        console.log('📋 Expert has user:', expertData.user);

        setExpert(expertData);

        // Set tier type and config
        const determinedTierType = tier || 'quick_consult';
        setTierType(determinedTierType);

        console.log('🎯 Tier type:', determinedTierType);

        if (determinedTierType === 'quick_consult') {
          setTierConfig({
            price_cents: expertData.price_cents || 0,
            sla_hours: expertData.sla_hours || 48
          });
        } else if (determinedTierType === 'deep_dive') {
          // Parse deep_dive tier config if available
          const deepDiveTiers = expertData.deep_dive_tiers || expertData.tiers;
          if (deepDiveTiers && deepDiveTiers.length > 0) {
            console.log('📊 Using deep dive tier config:', deepDiveTiers[0]);
            setTierConfig(deepDiveTiers[0]);
          } else {
            console.log('⚠️ No deep dive tiers found, using fallback');
            // Fallback config
            setTierConfig({
              min_price_cents: 5000,
              max_price_cents: 50000,
              sla_hours: expertData.sla_hours || 48
            });
          }
        }

        console.log('✅ Initialization complete');
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
    // Validate required fields before moving to step 2
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

      const minPrice = (tierConfig?.min_price_cents || 0) / 100;
      const maxPrice = (tierConfig?.max_price_cents || 0) / 100;
      
      if (priceValue < minPrice || priceValue > maxPrice) {
        alert(`Offer must be between $${minPrice} and $${maxPrice}`);
        return;
      }
    }

    actions.completeStep(1);
    actions.goToStep(2);
  };

  const handleReviewComplete = () => {
    // Validate email before moving to step 3
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

 // Get current step button info for persistent mobile footer
  const getCurrentStepButton = () => {
    console.log('🔘 Button state check - Current step:', state.currentStep);
    console.log('📝 Compose state:', state.compose);
    
    switch (state.currentStep) {
      case 1:
        // ✅ FIX: Use trimmed length consistently
        const titleText = state.compose.title || '';
        const trimmedTitle = titleText.trim();
        const hasValidTitle = trimmedTitle.length >= 5;
        
        const hasPrice = tierType === 'deep_dive' 
          ? state.compose.tierSpecific?.proposedPrice && parseFloat(state.compose.tierSpecific.proposedPrice) > 0
          : true;

        console.log('📊 Title validation:', {
          titleText,
          trimmedTitle,
          trimmedLength: trimmedTitle.length,
          hasValidTitle,
          hasPrice,
          tierType
        });

        const buttonText = trimmedTitle.length === 0
          ? 'Enter a title to continue'
          : trimmedTitle.length < 5
          ? 'Title too short (min 5 characters)'
          : tierType === 'deep_dive' && !hasPrice
          ? 'Enter your offer amount'
          : 'Continue to Review →';

        const isDisabled = !hasValidTitle || !hasPrice;

        console.log('🔘 Button result:', { buttonText, isDisabled });

        return {
          show: true,
          text: buttonText,
          disabled: isDisabled,
          onClick: handleComposeComplete
        };
        
      case 2:
        return {
          show: true,
          text: !state.review.email
            ? 'Enter your email to continue'
            : !state.review.email.includes('@')
            ? 'Please enter a valid email'
            : 'Continue to Payment →',
          disabled: !state.review.email || !state.review.email.includes('@'),
          onClick: handleReviewComplete
        };
        
      case 3:
        return {
          show: false // Payment step has its own submit button
        };
        
      default:
        return { show: false };
    }
  };

  const buttonInfo = getCurrentStepButton();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading expert profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No expert data - EXPANDED CHECK
  if (!expert || !expert.handle) {
    console.error('❌ No expert data available');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No expert data available.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Ensure expert has required fields with safe defaults
  const safeExpert = {
    ...expert,
    name: expert.name || expert.user?.name || expert.handle || 'Expert',
    handle: expert.handle,
    price_cents: expert.price_cents || 0,
    currency: expert.currency || 'USD',
    sla_hours: expert.sla_hours || 48,
    id: expert.id || expert._id || null
  };

  console.log('🔒 Safe expert data:', safeExpert);

  return (
      <ErrorBoundary>
    <div className="min-h-screen bg-gray-50 pb-32 sm:pb-8">
    <FlowContainer expert={safeExpert} tierType={tierType} tierConfig={tierConfig}>
      </FlowContainer>

      {/* Persistent Mobile Footer */}
      {buttonInfo.show && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-lg" style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.98)'
        }}>
          <div className="p-4">
            <button
              onClick={buttonInfo.onClick}
              disabled={buttonInfo.disabled}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
              style={{
                minHeight: '52px',
                fontSize: '16px'
              }}
            >
              {buttonInfo.text}
            </button>
          </div>
        </div>
      )}
    </div>
 </ErrorBoundary>
  );
}

export default AskQuestionPageV2;