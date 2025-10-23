import React from 'react';
import ProgressDots from './ProgressDots';
import AccordionSection from './AccordionSection';
import { useFlowState } from '../hooks/useFlowState';
import StepCompose from '../steps/StepCompose';
import StepReview from '../steps/StepReview';  // ← This was missing
import StepPayment from '../steps/StepPayment';  

import '../../../styles/question-flow-v2.css';

function FlowContainer({ expert, tierType, tierConfig }) {
  const { state, actions } = useFlowState();
  const { currentStep, completedSteps } = state;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
          Ask{' '}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            {expert.name || expert.user?.name || expert.handle}
          </span>
        </h1>
        <p className="text-sm text-gray-600">
          Response within <strong>{tierConfig?.sla_hours || expert.sla_hours} hours</strong>
        </p>
      </div>

      {/* Progress Dots */}
      <ProgressDots 
        currentStep={currentStep} 
        completedSteps={completedSteps}
      />

      {/* Step 1: Compose */}
      <AccordionSection
        step={1}
        title="Your Question"
        icon="compose"
        state={
          currentStep === 1 ? 'active' :
          completedSteps.includes(1) ? 'completed' :
          'locked'
        }
        onEdit={() => actions.goToStep(1)}
        isExpandable={completedSteps.includes(1)}
      >
        <div className="p-6">
          <StepCompose
            expert={expert}
            tierType={tierType}
            tierConfig={tierConfig}
            composeData={state.compose}
            onUpdate={actions.updateCompose}
            onContinue={() => actions.completeStep(1)}
          />
        </div>
      </AccordionSection>

      {/* Step 2: Review */}
      <AccordionSection
        step={2}
        title="Review Your Question"
        icon="review"
        state={
          currentStep === 2 ? 'active' :
          completedSteps.includes(2) ? 'completed' :
          'locked'
        }
        onEdit={() => actions.goToStep(2)}
        isExpandable={completedSteps.includes(2)}
      >
        <div className="p-6">
          <StepReview
            expert={expert}
            tierType={tierType}
            tierConfig={tierConfig}
            composeData={state.compose}
            reviewData={state.review}
            onUpdate={actions.updateReview}
            onContinue={() => actions.completeStep(2)}
            onEditCompose={() => actions.goToStep(1)}
          />
        </div>
      </AccordionSection>

{/* Step 3: Payment */}
<AccordionSection
  step={3}
  title="Payment & Submit"
  icon="payment"
  state={
    currentStep === 3 ? 'active' :
    completedSteps.includes(3) ? 'completed' :
    'locked'
  }
  onEdit={() => actions.goToStep(3)}
  isExpandable={false}
>
  <div className="p-6">
    <StepPayment
      expert={expert}
      tierType={tierType}
      tierConfig={tierConfig}
      composeData={state.compose}
      reviewData={state.review}
      onSubmit={() => {
        // TODO: Navigate to success page
        alert('Question submitted successfully! (Mock)');
      }}
    />
  </div>
</AccordionSection>
    </div>
  );
}

export default FlowContainer;