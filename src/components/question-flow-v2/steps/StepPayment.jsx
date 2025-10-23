import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentPlaceholder from '../payment/PaymentPlaceholder';

function StepPayment({ 
  expert, 
  tierType, 
  tierConfig, 
  composeData, 
  reviewData, 
  onSubmit 
}) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      console.log('Starting question submission...');

      // Validate Deep Dive offer amount - only check it's a valid positive number
      if (tierType === 'deep_dive' && composeData.tierSpecific?.price) {
        const priceValue = parseFloat(composeData.tierSpecific.price);
        if (!priceValue || priceValue <= 0) {
          setError('Please enter a valid offer amount');
          setIsSubmitting(false);
          return;
        }
      }

      // Base payload for both tiers
      const basePayload = {
        expertHandle: expert.handle,
        title: composeData.title,
        text: composeData.text || null,
        payerEmail: reviewData.email,
        payerFirstName: reviewData.firstName || null,
        payerLastName: reviewData.lastName || null,
        recordingSegments: composeData.recordings || [],
        attachments: composeData.attachments || [],
        sla_hours_snapshot: tierConfig?.sla_hours || expert.sla_hours
      };

      // Add tier-specific fields
      let payload;
      let endpoint;

      if (tierType === 'deep_dive') {
        payload = {
          ...basePayload,
          proposed_price_cents: Math.round(parseFloat(composeData.tierSpecific.price) * 100),
          asker_message: composeData.tierSpecific.message || null,
          stripe_payment_intent_id: 'pi_mock_' + Date.now(), // Mock for now (Stripe not implemented yet)
        };
        endpoint = '/api/questions/deep-dive';
      } else {
        // Quick Consult
        payload = {
          ...basePayload,
          stripe_payment_intent_id: 'pi_mock_' + Date.now(), // Mock for now (Stripe not implemented yet)
        };
        endpoint = '/api/questions/quick-consult';
      }

      console.log('Submitting question with payload:', {
        tierType: tierType || 'quick_consult',
        endpoint,
        recordingSegments: payload.recordingSegments.length + ' segments',
        attachments: payload.attachments.length + ' attachments'
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Submission failed (${response.status})`;
        
        try {
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          try {
            const errorText = await response.text();
            console.error('Backend returned non-JSON response:', errorText.substring(0, 500));
            errorMessage = `Server error (${response.status}). Check backend logs.`;
          } catch (textError) {
            console.error('Could not read error response:', textError);
            errorMessage = `Server error (${response.status})`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Full backend response:', result);
      console.log('📦 Result.data structure:', result.data);

      // Note: Auto-decline logic is handled in Xano during question creation
      // Offers below auto_decline_below_cents threshold are created with pricing_status = 'offer_declined'

      // Check if backend returned a Stripe checkout URL (for future when Stripe is implemented)
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      // Navigate to success page
      const expertName = expert.name || expert.user?.name || expert.handle;
      const questionId = result.data?.questionId || result.data?.id;

      const reviewToken = result.data?.reviewToken ||
                         result.data?.review_token ||
                         result.data?.token ||
                         result.reviewToken ||
                         result.review_token ||
                         result.token;

      console.log('🔍 Review token found:', reviewToken);
      console.log('🔍 Question ID:', questionId);

      const params = new URLSearchParams({
        question_id: questionId,
        expert: expert.handle,
        expertName: expertName,
      });

      if (reviewToken) {
        params.append('review_token', reviewToken);
        console.log('✅ Added review_token to URL params');
      } else {
        console.warn('⚠️ No review_token found in response.');
      }

      params.append('dev_mode', 'true');

      const navigationUrl = `/question-sent?${params.toString()}`;
      console.log('🚀 Navigating to:', navigationUrl);
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }
      
      navigate(navigationUrl);

    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message || 'An error occurred while submitting your question');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Submission Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <PaymentPlaceholder
        expert={expert}
        tierType={tierType}
        tierConfig={tierConfig}
        composeData={composeData}
        reviewData={reviewData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default StepPayment;