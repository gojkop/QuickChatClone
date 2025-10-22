import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';

function Hero() {
  return (
    <AnimatedBackground variant="hero">
      <section className="relative pt-20 pb-16 md:pt-40 md:pb-32 text-center">
        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl"></div>
        <div className="pointer-events-none absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl"></div>
        
        <div className="container mx-auto px-6 relative">
          
          {/* Badge - Clean & On-Brand */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-sm border border-indigo-200 text-sm font-semibold text-indigo-700 mb-6 shadow-sm">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            Where Human Expertise Gets Valued
          </div>
          
          {/* Headline - Clear & Powerful - RESPONSIVE TEXT SIZES */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter">
            Get Paid for{' '}
            <span className="relative inline-block">
              <span className="animated-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                What Only You Know
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5C50 1 150 1 199 5" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="50%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
          
          {/* Subtext - Clean Flow - RESPONSIVE TEXT SIZES */}
          <p className="mt-6 md:mt-8 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
            Your audience has already tried AI and Google. Now they need personalized expertise 
            that understands <span className="font-semibold text-gray-900">their</span> specific situation.
          </p>
          <p className="mt-3 md:mt-4 text-base md:text-lg font-semibold text-gray-900">
            Share your link. Set your price. Get paid instantly. No meetings required.
          </p>
          
          {/* THE EXPERTISE LADDER - COMPACT & PROPORTIONAL */}
          <div className="mt-10 md:mt-12 mb-8 md:mb-10 max-w-4xl mx-auto">
            
            {/* Section Header - COMPACT */}
            <div className="mb-5 md:mb-6 text-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">The Expertise Ladder</h2>
              <p className="text-xs md:text-sm text-gray-600">Where do you fit in?</p>
            </div>
            
            {/* Desktop: Gradient Bar (Hidden on mobile) */}
            <div className="hidden md:block relative h-2 bg-gradient-to-r from-gray-200 via-indigo-500 to-violet-600 rounded-full mb-6 shadow-sm">
              <div className="absolute -top-6 left-0 text-xs text-gray-500 font-medium">Information</div>
              <div className="absolute -top-6 right-0 text-xs text-violet-600 font-bold">Transformation</div>
            </div>
            
            {/* Mobile: Progression indicator - COMPACT */}
            <div className="md:hidden flex justify-between items-center mb-4 px-4 text-xs font-bold">
              <span className="text-gray-400">FOUNDATION</span>
              <svg className="w-10 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="text-violet-600">VALUE</span>
            </div>
            
            {/* COMPACT CARDS - Subtle Non-Clickable Hover */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              
              {/* CARD 1: AI Information Layer - SUBTLE HOVER */}
              <div className="bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl border border-gray-200 p-3 md:p-4 transition-all duration-300 opacity-85 md:opacity-100 hover:opacity-100 hover:shadow-lg hover:-translate-y-1 hover:border-gray-300">
                {/* Step indicator + Title - COMPACT */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                    1
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Information</h3>
                </div>
                
                {/* COMPACT icon - CENTERED - NO individual hover */}
                <div className="w-12 h-12 md:w-13 md:h-13 rounded-lg md:rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center mb-3 mx-auto transition-colors duration-300">
                  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                {/* COMPACT description */}
                <p className="text-xs md:text-sm text-gray-600 leading-snug">
                  AI provides facts and patterns. Great for research.
                </p>
              </div>

              {/* CARD 2: YOUR EXPERTISE - SOFTER COLOR + SUBTLE HOVER */}
              <div className="group relative bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-500 rounded-xl md:rounded-2xl border-3 md:border-4 border-indigo-300 p-4 md:p-5 shadow-xl transform scale-[1.03] md:scale-105 -my-3 md:-my-2 z-10 transition-all duration-300 hover:shadow-2xl hover:border-indigo-400">
                
                {/* "YOU ARE HERE" badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-indigo-600 text-xs font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full shadow-lg border-2 md:border-3 border-indigo-100 whitespace-nowrap">
                  ← YOU
                </div>
                
                {/* Step indicator + Title - COMPACT, WHITE text */}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center font-black text-lg md:text-xl flex-shrink-0 ring-2 md:ring-3 ring-white/30">
                    2
                  </div>
                  <h3 className="font-black text-white text-base md:text-lg">Your Expertise</h3>
                </div>
                
                {/* COMPACT icon with glow - CENTERED - NO rotation/scale */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur text-white flex items-center justify-center mb-3 mx-auto shadow-xl ring-2 md:ring-3 ring-white/30 transition-all duration-300">
                  <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                
                {/* WHITE text - COMPACT */}
                <p className="text-white text-xs md:text-sm font-medium leading-snug mb-3">
                  You understand context, navigate nuance, and apply experience to their unique situation.
                </p>
                
                {/* Value badge - COMPACT */}
                <div className="inline-flex items-center gap-1.5 text-xs text-indigo-900 bg-white px-2.5 py-1 md:py-1.5 rounded-full font-bold shadow-md transition-all duration-300">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">Gets paid</span>
                </div>
              </div>

              {/* CARD 3: Accountability - SUBTLE HOVER */}
              <div className="bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl border border-gray-200 p-3 md:p-4 transition-all duration-300 opacity-85 md:opacity-100 hover:opacity-100 hover:shadow-lg hover:-translate-y-1 hover:border-violet-300">
                {/* Step indicator + Title - COMPACT */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                    3
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">Accountability</h3>
                </div>
                
                {/* COMPACT icon - CENTERED - NO individual hover */}
                <div className="w-12 h-12 md:w-13 md:h-13 rounded-lg md:rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3 mx-auto transition-colors duration-300">
                  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                
                {/* COMPACT description */}
                <p className="text-xs md:text-sm text-gray-600 leading-snug">
                  Real person, real responsibility behind every answer.
                </p>
              </div>

            </div>

            {/* Bottom Summary - COMPACT */}
            <div className="mt-5 md:mt-6 text-center">
              <p className="text-xs md:text-sm text-gray-600">
                <span className="font-bold text-indigo-600">You're in the middle</span> — where context meets expertise.
              </p>
            </div>
          </div>
          
          {/* CTA Buttons - RESPONSIVE SIZING */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signin" 
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 rounded-xl transition duration-base ease-in-out shadow-elev-2 hover:shadow-elev-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Start Earning Today</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <a 
              href="#how-it-works" 
              className="inline-flex items-center gap-2 text-gray-700 font-semibold py-4 px-6 rounded-lg border-2 border-gray-300 hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              See how it works
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            Free to start • 5-minute setup • No credit card required
          </p>
          
          {/* Social proof */}
          <div className="mt-12 md:mt-16 flex flex-col items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <img 
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md" 
                  src={`https://i.pravatar.cc/40?u=${i}`}
                  alt={`Expert ${i}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Join <span className="font-semibold text-indigo-600">500+ experts</span> earning from their expertise
            </p>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  );
}

export default Hero;