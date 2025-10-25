// src/components/common/ProgressStepper.jsx
// UPDATED - Modern icon design with SVG icons

import React from 'react';

const ProgressStepper = ({ currentStep, steps }) => {
  // Default to Asker journey steps if none provided
  const defaultSteps = [
    { 
      id: 1, 
      name: 'Compose', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      description: 'Record your question' 
    },
    { 
      id: 2, 
      name: 'Review', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Check everything' 
    },
    { 
      id: 3, 
      name: 'Payment', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      description: 'Complete & send' 
    }
  ];
  
  const progressSteps = steps || defaultSteps;
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-4 sm:mb-8">
      {/* Mobile view - simplified */}
      <div className="flex sm:hidden items-center justify-center gap-2 px-4">
        <div className="text-sm font-semibold text-gray-600">
          Step {currentStep} of {progressSteps.length}
        </div>
        <div className="flex gap-1">
          {progressSteps.map((step) => (
            <div
              key={step.id}
              className={`h-2 w-8 rounded-full transition-all ${
                currentStep >= step.id 
                  ? 'bg-indigo-600' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop view - full stepper with modern icons */}
      <div className="hidden sm:flex items-center justify-center">
        {progressSteps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                currentStep >= step.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className={currentStep >= step.id ? 'text-white' : 'text-gray-400'}>
                    {step.icon}
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-semibold ${
                  currentStep >= step.id ? 'text-indigo-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {step.description}
                </div>
              </div>
            </div>
            
            {idx < progressSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 mb-8 transition-all ${
                currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressStepper;