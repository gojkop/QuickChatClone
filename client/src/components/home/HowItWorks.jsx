import React from 'react';

// A reusable component for each step to keep the code clean
const HowItWorksStep = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 transition-transform duration-300 hover:-translate-y-2">
    <div className="flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100 text-indigo-600 mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
);

function HowItWorks() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">How It Works</h2>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">A simple, three-step process to reclaim your time.</p>
        <div className="mt-16 grid md:grid-cols-3 gap-8 md:gap-12">
          <HowItWorksStep
            icon={
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
            title="1. Share Your Link"
            description="Sign up, connect Stripe, and set your price. Get a unique quick.chat/your-handle link to share in your bio, signature, and DMs."
          />
          <HowItWorksStep
            icon={
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="2. Get Paid Questions"
            description="Followers and clients pre-pay to send you a short async voice or video message. No more unpaid direct messages."
          />
          <HowItWorksStep
            icon={
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            title="3. Reply & Earn"
            description="Record your answer when it's convenient for you. Payment is automatically transferred to your account upon sending."
          />
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;