// src/pages/HomePage.jsx
import React from 'react';
import Hero from '@/components/home/Hero.jsx';
import HowItWorks from '@/components/home/HowItWorks.jsx';
import ValueCalculator from '@/components/home/ValueCalculator.jsx'; 
import Testimonials from '@/components/home/Testimonials.jsx';
import FinalCTA from '@/components/home/FinalCTA.jsx';
import SEO from '@/components/common/SEO';
import { Link } from 'react-router-dom';

const AskAnyoneBanner = () => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    // MOBILE OPTIMIZED: py-16 → py-12 md:py-16
    <section className="py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 border-y border-indigo-100">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* MOBILE OPTIMIZED: p-8 md:p-10 → p-6 md:p-10 */}
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-lg p-6 md:p-10">
            
            {/* Header with Icon */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>

              {/* Title - RESPONSIVE TEXT SIZE */}
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-2">
                  Need a Specific Expert Who's Not on mindPick Yet?
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
              Send them an invitation and we'll help you reach them professionally—no awkward cold emails needed.
            </p>

            {/* Example Badges - CONSOLIDATED TO SINGLE COLOR (Fix #7) */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Medical specialist abroad</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>Tech expert you follow</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Industry thought leader</span>
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/invite"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-xl transition duration-base ease-in-out shadow-elev-2 hover:shadow-elev-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span>Invite a Specific Expert</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors text-sm"
              >
                <span>How does this work?</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expandable Details */}
            {showDetails && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center md:text-left">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mx-auto md:mx-0 mb-2">1</div>
                    <div className="font-semibold text-gray-900 mb-1">Send details & record question</div>
                    <div className="text-gray-600 text-xs">Provide their contact and record your question</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mx-auto md:mx-0 mb-2">2</div>
                    <div className="font-semibold text-gray-900 mb-1">We invite them</div>
                    <div className="text-gray-600 text-xs">Professional invitation sent on your behalf</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mx-auto md:mx-0 mb-2">3</div>
                    <div className="font-semibold text-gray-900 mb-1">They join & answer</div>
                    <div className="text-gray-600 text-xs">Expert sets up their page and responds</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    A professional way to reach the expertise you need, without the awkwardness of cold outreach.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

// SOCIAL IMPACT - FIXED COLORS (Fix #5)
const SocialImpactInline = () => (
  // MOBILE OPTIMIZED: py-16 → py-12 md:py-16
  // COLOR FIX: from-yellow-50 to-orange-50 → from-rose-50 via-pink-50 to-violet-50
  <section className="py-12 md:py-16 bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 border-y border-rose-100">
    <div className="container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Icon - UPDATED GRADIENT */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-xl mb-6">
          <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12.8781 5.16335C11.0031 3.48835 8.01609 3.61035 6.27309 5.35335C4.53009 7.09635 4.39909 10.0914 6.07109 11.9684L11.5351 17.4324C11.7951 17.6924 12.2051 17.6924 12.4651 17.4324L17.9291 11.9684C19.6011 10.0914 19.4701 7.09635 17.7271 5.35335C15.9841 3.61035 12.9971 3.48835 11.1221 5.16335L12.0001 6.04135L12.8781 5.16335Z"/>
          </svg>
        </div>

        {/* RESPONSIVE TEXT SIZE + UPDATED GRADIENT */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Turn Knowledge into{' '}
          <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
            Kindness
          </span>
        </h2>
        
        <p className="text-gray-700 text-base md:text-lg mb-6 leading-relaxed">
          Set aside a percentage of your earnings to automatically donate to verified charities. 
          Make an impact while you earn — support causes like UNICEF, Doctors Without Borders, 
          Malala Fund, and more.
        </p>

        {/* Mini Stats - UPDATED BORDER COLOR */}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-rose-200 shadow-sm mb-6">
          <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
          </svg>
          <span className="font-bold text-rose-900">
            6 verified charity partners
          </span>
        </div>

        {/* CTA - UPDATED TEXT COLOR */}
        <div>
          <Link 
            to="/social-impact"
            className="inline-flex items-center gap-2 text-rose-700 hover:text-rose-800 font-semibold transition-colors group"
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

// OPTIMIZED: HomePage flow
function HomePage() {
  return (
    <>
      <SEO
        title="mindPick - Monetize Your Expertise"
        description="Get paid for your expertise. mindPick connects you with people who need personalized answers AI can't provide. Set your price, share your link, earn from your knowledge—no meetings required."
      />
      {/* Primary expert conversion funnel */}
      <Hero />
      <HowItWorks />
      <ValueCalculator />
      
      {/* Social proof before any distractions */}
      <Testimonials />
      
      {/* Inline social impact (doesn't break flow) */}
      <SocialImpactInline />
      
      {/* Ask Anyone comes after social proof */}
      <AskAnyoneBanner />
      
      {/* Final conversion push */}
      <FinalCTA />
    </>
  );
}

export default HomePage;