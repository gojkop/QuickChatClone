import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlowContainer from '@/components/question-flow-v2/layout/FlowContainer';
import AccordionSection from '@/components/question-flow-v2/layout/AccordionSection';
import ProgressDots from '@/components/question-flow-v2/layout/ProgressDots';
import StepCompose from '@/components/question-flow-v2/steps/StepCompose';
import StepReview from '@/components/question-flow-v2/steps/StepReview';
import StepPayment from '@/components/question-flow-v2/steps/StepPayment';
import { useFlowState } from '@/components/question-flow-v2/hooks/useFlowState';

function AskQuestionPageV2() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { expert, tierType, tierConfig } = location.state || {};
  const { state, actions } = useFlowState();

  // If no expert data, redirect back
  React.useEffect(() => {
    if (!expert) {
      console.error('No expert data provided');
      navigate('/');
    }
  }, [expert, navigate]);

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const handleComposeComplete = () => {
    actions.completeStep(1);
    actions.goToStep(2);
  };

  const handleReviewComplete = () => {
    actions.completeStep(2);
    actions.goToStep(3);
  };

  const handleEditCompose = () => {
    actions.goToStep(1);
  };

  // Get current step button info
  const getCurrentStepButton = () => {
    switch (state.currentStep) {
      case 1:
        return {
          show: true,
          text: !state.compose.title?.trim()
            ? 'Enter a title to continue'
            : state.compose.title.length < 5
            ? 'Title too short (min 5 characters)'
            : tierType === 'deep_dive' && (!state.compose.tierSpecific?.proposedPrice || parseFloat(state.compose.tierSpecific.proposedPrice) <= 0)
            ? 'Enter your offer amount'
            : 'Continue to Review →',
          disabled: !state.compose.title?.trim() || 
                   state.compose.title.length < 5 ||
                   (tierType === 'deep_dive' && (!state.compose.tierSpecific?.proposedPrice || parseFloat(state.compose.tierSpecific.proposedPrice) <= 0)),
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

  return (
    <div className="min-h-screen bg-gray-50 pb-32 sm:pb-8">
      <FlowContainer>
        {/* Progress Dots */}
        <ProgressDots
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
        />

        {/* Step 1: Compose */}
        <AccordionSection
          step={1}
          title="Compose Your Question"
          icon="compose"
          state={state.currentStep === 1 ? 'active' : state.completedSteps.includes(1) ? 'completed' : 'locked'}
          isExpandable={true}
          onEdit={handleEditCompose}
        >
          <StepCompose
            expert={expert}
            tierType={tierType}
            tierConfig={tierConfig}
            composeData={state.compose}
            onUpdate={actions.updateCompose}
            onContinue={handleComposeComplete}
          />
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
          <StepReview
            expert={expert}
            tierType={tierType}
            tierConfig={tierConfig}
            composeData={state.compose}
            reviewData={state.review}
            onUpdate={actions.updateReview}
            onContinue={handleReviewComplete}
            onEditCompose={handleEditCompose}
          />
        </AccordionSection>

        {/* Step 3: Payment */}
        <AccordionSection
          step={3}
          title="Payment & Submit"
          icon="payment"
          state={state.currentStep === 3 ? 'active' : 'locked'}
          isExpandable={false}
        >
          <StepPayment
            expert={expert}
            tierType={tierType}
            tierConfig={tierConfig}
            composeData={state.compose}
            reviewData={state.review}
          />
        </AccordionSection>
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
  );
}

export default AskQuestionPageV2;