import React from 'react';
import { CheckCircleIcon } from '../shared/SVGIcons';

const steps = [
  { number: 1, label: 'Compose' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Payment' }
];

function ProgressDots({ currentStep, completedSteps }) {
  return (
    <div className="progress-dots-container mb-8">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Dot */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`progress-dot ${
                  completedSteps.includes(step.number) ? 'completed' :
                  currentStep === step.number ? 'active' :
                  ''
                }`}
              >
                {completedSteps.includes(step.number) && (
                  <CheckCircleIcon className="w-full h-full text-white" />
                )}
              </div>
              <span className={`text-xs font-medium ${
                currentStep === step.number ? 'text-indigo-600' :
                completedSteps.includes(step.number) ? 'text-green-600' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`progress-connector ${
                completedSteps.includes(step.number) ? 'completed' : ''
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProgressDots;