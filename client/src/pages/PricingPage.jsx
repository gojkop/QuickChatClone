import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function PricingPage() {
  const { isAuthenticated } = useAuth();

  const CheckmarkIcon = () => (
    <svg className="text-brand-indigo w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
  );

  return (
    <>
      <section className="text-center pt-32 sm:pt-40 pb-16">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tighter">
            Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-violet">Transparent Pricing</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
            Focus on sharing your expertise. We'll handle the rest. Choose a plan that grows with you.
          </p>
        </div>
      </section>

      <section className="pt-8 pb-24">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8 items-start">
          {/* Starter Plan */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 h-full flex flex-col">
            <h2 className="text-2xl font-bold">Starter</h2>
            <p className="text-gray-500 mt-2">Perfect for getting started. No upfront cost.</p>
            
            <div className="mt-6">
              <span className="text-5xl font-extrabold">Free</span>
              <span className="text-lg font-medium text-gray-500"> to start</span>
            </div>

            <p className="mt-4 text-lg font-semibold">10% <span className="font-normal text-gray-500">platform fee per transaction</span></p>

            <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
              <li className="flex items-start"><CheckmarkIcon /><span>Personal expert link and page</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>Secure Stripe Connect payouts</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>Core pay → record → answer flow</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>Email notifications & SLA timer</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>Basic earnings analytics</span></li>
            </ul>

            <Link 
              to={isAuthenticated ? "/expert" : "/signin"} 
              className="block w-full text-center mt-8 px-4 py-3 rounded-md font-semibold transition-all duration-200 ease-in-out border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start for Free"}
            </Link>
            <p className="text-xs text-gray-400 mt-4 text-center">Stripe processing fees of ~2.9% + €0.30 also apply.</p>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-8 rounded-xl border-2 border-brand-indigo h-full flex flex-col relative transform scale-102 shadow-xl">
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">Recommended</div>
            <h2 className="text-2xl font-bold">Pro</h2>
            <p className="text-gray-500 mt-2">For active experts who want to maximize earnings.</p>
            
            <div className="mt-6">
              <span className="text-5xl font-extrabold">€15</span>
              <span className="text-lg font-medium text-gray-500">/ month</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Or €144 per year (two months free)</p>

            <p className="mt-4 text-lg font-semibold">7% <span className="font-normal text-gray-500">platform fee per transaction</span></p>

            <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
              <li className="flex items-start font-semibold"><CheckmarkIcon /><span>Everything in Starter, plus:</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>Remove "Powered by QuickChat" branding</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>AI-powered transcripts & TL;DR summaries</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>Social share kit (captions & thumbnails)</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>Custom branding options</span></li>
              <li className="flex items-start"><CheckmarkIcon /><span>Priority support</span></li>
            </ul>

            <Link 
              to={isAuthenticated ? "/expert" : "/signin?plan=pro"} 
              className="block w-full text-center mt-8 px-4 py-3 rounded-md font-semibold transition-all duration-200 ease-in-out bg-brand-indigo text-white hover:bg-indigo-700 cta-pulse"
            >
              {isAuthenticated ? "Go to Dashboard" : "Go Pro"}
            </Link>
            <p className="text-xs text-gray-400 mt-4 text-center">Stripe processing fees of ~2.9% + €0.30 also apply.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default PricingPage;