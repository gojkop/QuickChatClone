import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuestionComposer from '@/components/question/QuestionComposer';
import apiClient from '@/api';

function AskQuestionPage() {
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const composerRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const handle = params.get('expert');
    if (handle) {
      // In a real app, you would fetch expert details here to get the price
      // For now, we'll use a placeholder
      setExpert({ handle, name: handle, price: 7500, currency: 'USD' });
    }
  }, [location.search]);

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    const questionData = composerRef.current.getQuestionData();
    console.log("Proceeding to payment with data:", questionData);

    try {
      // 1. Create a Stripe Checkout Session on the backend
      const response = await apiClient.post('/fALBm5Ej/stripe/checkout-session', {
        // Pass relevant data to create the session
        expert_handle: expert.handle,
        // The return_url will have session_id appended by Stripe
        return_url: `${window.location.origin}/question-sent` 
      });

      // 2. Redirect to Stripe's checkout page
      if (response.data && response.data.checkout_url) {
        window.location.assign(response.data.checkout_url);
      } else {
        throw new Error('Failed to create checkout session.');
      }
    } catch (error) {
      console.error("Payment error:", error);
      setIsLoading(false);
      alert('Could not proceed to payment. Please try again.');
    }
  };

  if (!expert) {
    return <div>Loading expert details...</div>;
  }
  
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="mt-2 text-gray-500">You are asking a question to <strong className="text-gray-700">{expert.name}</strong></p>
        </div>
        <QuestionComposer ref={composerRef}>
          <button onClick={handleProceedToPayment} disabled={isLoading} className="w-full text-lg font-bold py-4 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </QuestionComposer>
      </div>
    </main>
  );
}

export default AskQuestionPage;