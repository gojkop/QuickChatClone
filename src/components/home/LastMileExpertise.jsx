// src/components/home/LastMileExpertise.jsx
import React from 'react';

function LastMileExpertise() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-sm font-semibold text-indigo-700 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Beyond AI</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4 leading-tight">
              The Last Mile of Expertise
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              AI gets you <span className="font-bold text-indigo-600">80% there</span>.{' '}
              You deliver the <span className="font-bold text-violet-600">final 20% that matters</span>.
            </p>
          </div>

          {/* The Expertise Ladder */}
          <div className="mb-10 md:mb-12">
            
            {/* Desktop: Gradient Bar with Labels */}
            <div className="hidden md:block relative h-3 bg-gradient-to-r from-gray-300 via-indigo-500 to-violet-600 rounded-full mb-8 shadow-md">
              <div className="absolute -top-7 left-0 text-sm text-gray-600 font-semibold">
                Information
              </div>
              <div className="absolute -top-7 right-0 text-sm text-violet-700 font-bold">
                Transformation
              </div>
            </div>
            
            {/* Mobile: Simple progression indicator */}
            <div className="md:hidden flex justify-between items-center mb-6 px-2 text-xs font-bold">
              <span className="text-gray-500">FOUNDATION</span>
              <svg className="w-12 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="text-violet-700">VALUE</span>
            </div>
            
            {/* Three-tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              
              {/* TIER 1: AI - Information Layer */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-5 md:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">AI Information</h3>
                </div>
                
                <div className="w-14 h-14 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Instant facts, patterns, and general answers. Great starting point for research.
                </p>
                
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full font-medium">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free & fast</span>
                </div>
              </div>

              {/* TIER 2: YOU - Context & Judgment */}
              <div className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 rounded-2xl border-4 border-indigo-300 p-6 md:p-7 shadow-2xl transform scale-105 -my-4 md:-my-3 z-10 hover:shadow-3xl hover:-translate-y-2 transition-all duration-300">
                
                {/* "YOU ARE HERE" Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 text-xs font-black px-4 py-1.5 rounded-full shadow-lg border-3 border-indigo-100 whitespace-nowrap">
                  ← YOU
                </div>
                
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center font-black text-xl flex-shrink-0 ring-3 ring-white/30">
                    2
                  </div>
                  <h3 className="font-black text-white text-lg md:text-xl">Your Expertise</h3>
                </div>
                
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur text-white flex items-center justify-center mb-4 mx-auto shadow-xl ring-3 ring-white/30">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                
                <p className="text-white text-sm md:text-base font-medium leading-relaxed mb-4">
                  You understand context, navigate nuance, and apply years of experience to <span className="font-bold">their unique situation</span>.
                </p>
                
                <div className="inline-flex items-center gap-1.5 text-xs text-indigo-900 bg-white px-3 py-2 rounded-full font-bold shadow-md">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span>Gets paid</span>
                </div>
              </div>

              {/* TIER 3: Accountability */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-5 md:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Accountability</h3>
                </div>
                
                <div className="w-14 h-14 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  A real person with reputation and responsibility behind every answer.
                </p>
                
                <div className="inline-flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Trustworthy</span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Call-out */}
          <div className="text-center bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-indigo-100">
            <p className="text-base md:text-lg text-gray-700 mb-2">
              <span className="font-bold text-indigo-600">You're in the middle</span> — where context meets expertise.
            </p>
            <p className="text-sm md:text-base text-gray-600">
              AI can't provide accountability. You can. <span className="font-semibold">That's why your expertise has value.</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default LastMileExpertise;