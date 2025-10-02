import React from 'react';

function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight">How It Works</h2>
        <p className="mt-3 text-lg text-gray-600">A simple, three-step process to reclaim your time.</p>
        <div className="mt-16 grid md:grid-cols-3 gap-8 md:gap-12">
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 font-black text-2xl">1</div>
            <h3 className="mt-6 text-xl font-semibold">Share Your Link</h3>
            <p className="mt-2 text-gray-600">Sign up, connect Stripe, and set your price. Get a unique `quick.chat/your-handle` link to share anywhere.</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 font-black text-2xl">2</div>
            <h3 className="mt-6 text-xl font-semibold">Get Paid Questions</h3>
            <p className="mt-2 text-gray-600">Askers pre-pay to send you a short async voice or video message. No more unpaid DMs.</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 font-black text-2xl">3</div>
            <h3 className="mt-6 text-xl font-semibold">Reply & Earn</h3>
            <p className="mt-2 text-gray-600">Record your answer when it's convenient. Payment is automatically transferred to your account.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;