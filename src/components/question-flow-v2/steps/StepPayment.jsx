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

      // Build payload
      const basePayload = {
        expert_handle: expert.handle,
        title: composeData.title,
        text: composeData.text || '',
        media_urls: (composeData.recordings || []).map(r => ({
          uid: r.uid,
          url: r.playbackUrl,
          mode: r.mode,
          duration: r.duration
        })),
        attachment_urls: (composeData.attachments || []).map(a => a.url || a.playbackUrl),
        asker_email: reviewData.email,
        asker_first_name: reviewData.firstName || '',
        asker_last_name: reviewData.lastName || '',
      };

      // Add tier-specific fields
      const endpoint = tierType === 'deep_dive' 
        ? '/api/questions/deep-dive'
        : '/api/questions/quick-consult';

      const payload = tierType === 'deep_dive'
        ? {
            ...basePayload,
            proposed_price_cents: Math.round(parseFloat(composeData.tierSpecific.proposedPrice) * 100),
            expert_message: composeData.tierSpecific.expertMessage || ''
          }
        : basePayload;

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