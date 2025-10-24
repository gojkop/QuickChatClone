import React from 'react';
import QuestionSummaryCard from '../review/QuestionSummaryCard';
import PriceCard from '../review/PriceCard';
import ContactForm from '../review/ContactForm';

function StepReview({ 
  expert, 
  tierType, 
  tierConfig, 
  composeData, 
  reviewData, 
  onUpdate, 
  onContinue,
  onEditCompose 
}) {
  // ✅ FIX: Handle email change correctly
  const handleEmailChange = (value) => {
    console.log('📧 Email changed:', value); // Debug
    onUpdate('email', value);
  };

  const handleContinue = () => {
    // Validate email
    if (!reviewData.email || !reviewData.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    onContinue();
  };

  const canContinue = reviewData.email && reviewData.email.includes('@');

  return (
    <div className="space-y-4 pb-4 sm:pb-6">
      {/* Question Summary */}
      <QuestionSummaryCard
        composeData={composeData}
        onEdit={onEditCompose}
      />

      {/* Price Card */}
      <PriceCard
        expert={expert}
        tierType={tierType}
        tierConfig={tierConfig}
        composeData={composeData}
      />

      {/* Contact Information */}
      {/* ✅ FIX: Pass email prop instead of data, and onChange expects string value */}
      <ContactForm
        email={reviewData?.email || ''}
        onChange={handleEmailChange}
      />

      {/* Continue Button - will be shown in persistent footer */}
      <div className="hidden sm:block pt-3 border-t">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          {!reviewData.email
            ? 'Enter your email to continue'
            : !reviewData.email.includes('@')
            ? 'Please enter a valid email'
            : 'Continue to Payment →'}
        </button>
      </div>
    </div>
  );
}

export default StepReview;