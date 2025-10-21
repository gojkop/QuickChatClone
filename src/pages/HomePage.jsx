// src/pages/HomePage.jsx
import React from 'react';
import Hero from '@/components/home/Hero.jsx';
import HowItWorks from '@/components/home/HowItWorks.jsx';
import ValueCalculator from '@/components/home/ValueCalculator.jsx'; 
import Testimonials from '@/components/home/Testimonials.jsx';
import FinalCTA from '@/components/home/FinalCTA.jsx';
import { Link } from 'react-router-dom';

// MOVED: "Ask Anyone" banner - now appears AFTER social proof
const AskAnyoneBanner = () => (
  <section className="py-16 bg-gradient-to-r from-violet-50 to-purple-50 border-y border-violet-100">
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-violet-200 p-8 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Have a Question for Someone?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Know someone with the perfect expertise? Ask them directly — we'll invite them to answer on mindPick.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex-shrink-0">
              <Link
                to="/invite"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <span>Ask Anyone</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// NEW: Inline Social Impact section (replaces full-page CTA diversion)
const SocialImpactInline = () => (
  <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50 border-y border-orange-100">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl mb-6">
          <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12.8781 5.16335C11.0031 3.48835 8.01609 3.61035 6.27309 5.35335C4.53009 7.09635 4.39909 10.0914 6.07109 11.9684L11.5351 17.4324C11.7951 17.6924 12.2051 17.6924 12.4651 17.4324L17.9291 11.9684C19.6011 10.0914 19.4701 7.09635 17.7271 5.35335C15.9841 3.61035 12.9971 3.48835 11.1221 5.16335L12.0001 6.04135L12.8781 5.16335Z"/>
          </svg>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Turn Knowledge into{' '}
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            Kindness
          </span>
        </h2>
        
        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
          Set aside a percentage of your earnings to automatically donate to verified charities. 
          Make an impact while you earn — support causes like UNICEF, Doctors Without Borders, 
          Malala Fund, and more.
        </p>

        {/* Mini Stats */}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-sm mb-6">
          <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
          </svg>
          <span className="font-bold text-orange-900">
            6 verified charity partners
          </span>
        </div>

        {/* CTA - Learn More (not diverting to separate page during funnel) */}
        <div>
          <Link 
            to="/social-impact"
            className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-800 font-semibold transition-colors group"
          >
            <span>Learn about our charity partners</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// OPTIMIZED: HomePage flow now prioritizes expert conversion
function HomePage() {
  return (
    <>
      {/* Primary expert conversion funnel */}
      <Hero />
      <HowItWorks />
      <ValueCalculator />
      
      {/* Social proof before any distractions */}
      <Testimonials />
      
      {/* NEW: Inline social impact (doesn't break flow) */}
      <SocialImpactInline />
      
      {/* MOVED: Ask Anyone comes after social proof */}
      <AskAnyoneBanner />
      
      {/* Final conversion push */}
      <FinalCTA />
    </>
  );
}

export default HomePage;