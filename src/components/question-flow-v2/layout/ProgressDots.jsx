import React from 'react';
import { CheckCircleIcon } from '../shared/SVGIcons';

const steps = [
  { number: 1, label: 'Compose' },
  { number: 2, label: 'Review' },
  { number: 3, label: 'Payment' }
];

function ProgressDots({ currentStep, completedSteps }) {
  return (
    <div className="progress-dots-container mb-10">
      <div className="flex items-center justify-center gap-3">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Premium Dot */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {/* Outer glow ring for active state */}
                {currentStep === step.number && (
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
                      transform: 'scale(1.4)',
                      zIndex: 0,
                      animation: 'pulse-glow 2s ease-in-out infinite'
                    }}
                  />
                )}
                
                <div
                  className={`progress-dot ${
                    completedSteps.includes(step.number) ? 'completed' :
                    currentStep === step.number ? 'active' :
                    ''
                  }`}
                  style={{
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {completedSteps.includes(step.number) && (
                    <CheckCircleIcon className="w-full h-full text-white" />
                  )}
                  {currentStep === step.number && !completedSteps.includes(step.number) && (
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  )}
                </div>
              </div>
              
              <span className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                currentStep === step.number ? 'text-indigo-600' :
                completedSteps.includes(step.number) ? 'text-emerald-600' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>

            {/* Premium Connector */}
            {index < steps.length - 1 && (
              <div 
                className="relative" 
                style={{ 
                  width: '48px', 
                  height: '3px', 
                  marginBottom: '28px' 
                }}
              >
                {/* Background track */}
                <div className={`progress-connector ${
                  completedSteps.includes(step.number) ? 'completed' : ''
                }`} />
                
                {/* Animated progress fill */}
                {completedSteps.includes(step.number) && (
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      animation: 'slideInFromLeft 0.6s ease-out',
                      transformOrigin: 'left'
                    }}
                  />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProgressDots;