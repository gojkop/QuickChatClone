import React from 'react';
import Hero from '@/components/home/Hero.jsx';
import HowItWorks from '@/components/home/HowItWorks.jsx';
import ValueCalculator from '@/components/home/ValueCalculator.jsx'; 
import Testimonials from '@/components/home/Testimonials.jsx';
import SocialImpactCTA from '@/components/home/SocialImpactCTA.jsx';
import FinalCTA from '@/components/home/FinalCTA.jsx';
import { Link } from 'react-router-dom';

// New component: Subtle Ask Anyone CTA
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

function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ValueCalculator />
      <AskAnyoneBanner />
      <Testimonials />
      <SocialImpactCTA />
      <FinalCTA />
    </>
  );
}

export default HomePage;