// src/components/home/SoundFamiliar.jsx
import React from 'react';

function SoundFamiliar() {
  const painPoints = [
    {
      emoji: '📧',
      text: 'Your DMs are overflowing with "quick questions"',
      subtext: 'Each one costs you 15-30 minutes you will never get back'
    },
    {
      emoji: '😰',
      text: 'You feel guilty saying no to people who need help',
      subtext: 'But saying yes means working for free... again'
    },
    {
      emoji: '🔄',
      text: 'They have already tried AI and Google—it was not enough',
      subtext: 'They need your experience, judgment, and context'
    },
    {
      emoji: '⏰',
      text: 'Calendar requests pile up for "just 15 minutes"',
      subtext: 'Which actually takes an hour with prep and follow-up'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-sm font-semibold text-red-700 mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Sound Familiar?</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
              Your Expertise Is Being{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Drained for Free
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5C50 1 150 1 199 5" stroke="url(#gradient-red)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#DC2626" />
                      <stop offset="50%" stopColor="#EA580C" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
          </div>

          {/* Pain Points Grid */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-5 mb-8 md:mb-10">
            {painPoints.map((point, index) => (
              <div 
                key={index}
                className="group bg-white p-5 md:p-6 rounded-xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-3xl md:text-4xl">
                    {point.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base md:text-lg mb-1">
                      {point.text}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {point.subtext}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Solution Teaser */}
          <div className="text-center bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-6 md:p-8 border border-indigo-100">
            <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              There's a better way.
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              Respect their need for expertise. Respect your time. Get paid for what only you can provide.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default SoundFamiliar;