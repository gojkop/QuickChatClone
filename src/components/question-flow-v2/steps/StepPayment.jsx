import React from 'react';
import PaymentPlaceholder from '../payment/PaymentPlaceholder';

function StepPayment({ 
  expert, 
  tierType, 
  tierConfig, 
  composeData, 
  reviewData, 
  onSubmit 
}) {
  const handleSubmit = async () => {
    // TODO: Real Stripe integration will go here
    console.log('Submitting question with data:', {
      expert: expert.handle,
      tierType,
      compose: composeData,
      review: reviewData
    });

    // Mock submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For now, just alert success
    alert('Mock submission successful! (Real Stripe integration coming next)');
    
    // Navigate to success page (mock)
    onSubmit();
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