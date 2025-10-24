import { useState, useCallback } from 'react';

export function useFlowState() {
  const [state, setState] = useState({
    currentStep: 1,
    completedSteps: [],
    
    // Step 1 data
    compose: {
      title: '',
      recordings: [],
      attachments: [],
      text: '',
      tierSpecific: {} // price/message for Deep Dive
    },
    
    // Step 2 data
    review: {
      email: '',
      firstName: '',
      lastName: ''
    },
    
    // Step 3 data
    payment: {
      paymentIntentId: null,
      status: 'pending'
    }
  });

  const actions = {
    // Navigate to specific step
    goToStep: useCallback((stepNumber) => {
      setState(prev => ({
        ...prev,
        currentStep: stepNumber
      }));
    }, []),

    // Complete a step and move to next
    completeStep: useCallback((stepNumber) => {
      setState(prev => ({
        ...prev,
        currentStep: stepNumber + 1,
        completedSteps: [...new Set([...prev.completedSteps, stepNumber])]
      }));
    }, []),

    // Update compose data - WITH LOGGING
    updateCompose: useCallback((data) => {
      console.log('🔄 updateCompose called with:', data);
      setState(prev => {
        const newState = {
          ...prev,
          compose: { ...prev.compose, ...data }
        };
        console.log('📊 New compose state:', newState.compose);
        return newState;
      });
    }, []),

    // Update review data
    updateReview: useCallback((data) => {
      setState(prev => ({
        ...prev,
        review: { ...prev.review, ...data }
      }));
    }, []),

    // Update payment data
    updatePayment: useCallback((data) => {
      setState(prev => ({
        ...prev,
        payment: { ...prev.payment, ...data }
      }));
    }, [])
  };

  return { state, actions };
}