import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';

function Hero() {
  return (
    <AnimatedBackground variant="hero">
      <section className="relative pt-40 pb-32 text-center">
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
          
          {/* Headline - Clear & Powerful */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
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
          
          {/* Subtext - Clean Flow */}
          <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Your audience has already tried AI and Google. Now they need personalized expertise 
            that understands <span className="font-semibold text-gray-900">their</span> specific situation.
          </p>
          <p className="mt-4 text-lg font-semibold text-gray-900">
            Share your link. Set your price. Get paid instantly. No meetings required.
          </p>
          
          {/* THE INTELLIGENCE SPECTRUM - Stronger Messaging */}
          <div className="mt-16 mb-12 max-w-4xl mx-auto">
            
            {/* Section Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">The Expertise Ladder</h2>
              <p className="text-sm text-gray-600">From information to transformation</p>
            </div>
            
            {/* Gradient Bar */}
            <div className="relative h-3 bg-gradient-to-r from-gray-200 via-indigo-500 to-violet-600 rounded-full mb-10 shadow-sm">
              <div className="absolute -top-8 left-0 text-xs text-gray-500 font-medium">Information</div>
              <div className="absolute -top-8 right-0 text-xs text-violet-600 font-bold">Transformation</div>
            </div>
            
            {/* Three Stages - Stronger Positioning */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Stage 1: AI Information Layer */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Information</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  AI provides facts, patterns, and general knowledge. Brilliant for research and broad answers.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>What is possible?</span>
                </div>
              </div>

              {/* Stage 2: Your Expertise (ELEVATED) */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border-2 border-indigo-400 p-6 shadow-xl transform md:scale-105 hover:shadow-2xl transition-all duration-300 relative">
                {/* Premium Badge */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  You
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mb-4 shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Personal Expertise</h3>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  You understand context, navigate nuance, and apply experience to their unique situation.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-indigo-700 bg-white px-2.5 py-1 rounded-full font-semibold shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span>What should I do?</span>
                </div>
              </div>

              {/* Stage 3: Accountability & Trust */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Accountability</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  Real person, real responsibility. Your reputation and expertise stand behind every answer.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Someone I can trust</span>
                </div>
              </div>

            </div>

            {/* Bottom Summary */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">AI gives information.</span> You provide insight, judgment, and accountability for their unique context.
              </p>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signin" 
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 rounded-lg text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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
          <div className="mt-16 flex flex-col items-center gap-3">
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