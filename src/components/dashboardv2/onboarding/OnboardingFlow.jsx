import React, { useState } from 'react';
import WelcomeModal from './WelcomeModal';
import EssentialSetupForm from './EssentialSetupForm';
import OnboardingSuccessModal from './OnboardingSuccessModal';

/**
 * Orchestrates the 3-step onboarding flow:
 * 1. Welcome Modal
 * 2. Essential Setup Form
 * 3. Success Modal
 */
function OnboardingFlow({ userName, onComplete }) {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Setup, 3: Success
  const [setupData, setSetupData] = useState(null);

  const handleWelcomeComplete = () => {
    setStep(2);
  };

  const handleSkip = () => {
    // User skipped - close onboarding without completing
    if (onComplete) {
      onComplete(null);
    }
  };

  const handleSetupComplete = (data) => {
    setSetupData(data);
    setStep(3);
  };

  const handleSuccessComplete = () => {
    if (onComplete) {
      onComplete(setupData);
    }
  };

  return (
    <>
      {step === 1 && (
        <WelcomeModal
          userName={userName}
          onGetStarted={handleWelcomeComplete}
          onSkip={handleSkip}
        />
      )}

      {step === 2 && (
        <EssentialSetupForm
          userName={userName}
          onComplete={handleSetupComplete}
          onSkip={handleSkip}
        />
      )}

      {step === 3 && setupData && (
        <OnboardingSuccessModal
          handle={setupData.handle}
          onContinue={handleSuccessComplete}
        />
      )}
    </>
  );
}

export default OnboardingFlow;
