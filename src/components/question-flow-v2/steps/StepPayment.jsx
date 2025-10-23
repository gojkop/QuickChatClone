import React from 'react';
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

  const handleSubmit = async () => {
    try {
      console.log('📤 Submitting question with data:', {
        expert: expert.handle,
        tierType,
        compose: composeData,
        review: reviewData
      });

      // Build base payload - CORRECT FORMAT FROM V1
      const basePayload = {
        expertHandle: expert.handle,
        title: composeData.title,
        text: composeData.text || null,
        payerEmail: reviewData.email,
        payerFirstName: reviewData.firstName || null,
        payerLastName: reviewData.lastName || null,
        recordingSegments: (composeData.recordings || []).map(r => ({
          uid: r.uid,
          url: r.playbackUrl,
          mode: r.mode,
          duration: r.duration
        })),
        attachments: (composeData.attachments || []).map(a => ({
          name: a.name || a.filename,
          url: a.url || a.playbackUrl,
          size: a.size
        })),
        sla_hours_snapshot: tierConfig?.sla_hours || expert.sla_hours
      };

      // Add tier-specific fields
      let endpoint, payload;

      if (tierType === 'deep_dive') {
        endpoint = '/api/questions/deep-dive';
        payload = {
          ...basePayload,
          proposed_price_cents: Math.round(parseFloat(composeData.tierSpecific.proposedPrice) * 100),
          asker_message: composeData.tierSpecific.askerMessage || null,
          stripe_payment_intent_id: 'pi_mock_' + Date.now()
        };
      } else {
        endpoint = '/api/questions/quick-consult';
        payload = {
          ...basePayload,
          stripe_payment_intent_id: 'pi_mock_' + Date.now()
        };
      }

      console.log('📡 Sending to:', endpoint, payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const result = await response.json();
      console.log('✅ Question submitted:', result);

      // Navigate to success page
      if (result.review_token) {
        navigate(`/question-sent?token=${result.review_token}`);
      } else {
        navigate('/question-sent');
      }

    } catch (error) {
      console.error('❌ Submission error:', error);
      alert(`Failed to submit question: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <PaymentPlaceholder
        expert={expert}
        tierType={tierType}
        tierConfig={tierConfig}
        composeData={composeData}
        reviewData={reviewData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default StepPayment;