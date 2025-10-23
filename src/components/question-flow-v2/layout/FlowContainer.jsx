import React from 'react';
import ProgressDots from './ProgressDots';
import AccordionSection from './AccordionSection';
import { useFlowState } from '../hooks/useFlowState';
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
          <p className="text-gray-600 mb-4">Step 1 content will go here (Phase 2)</p>
          <button
            onClick={() => actions.completeStep(1)}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Continue to Review →
          </button>
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
          <p className="text-gray-600 mb-4">Step 2 content will go here (Phase 4)</p>
          <button
            onClick={() => actions.completeStep(2)}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Continue to Payment →
          </button>
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
          <p className="text-gray-600 mb-4">Step 3 content will go here (Phase 5)</p>
          <button
            onClick={() => alert('Submit!')}
            className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition"
          >
            Submit Question →
          </button>
        </div>
      </AccordionSection>
    </div>
  );
}

export default FlowContainer;