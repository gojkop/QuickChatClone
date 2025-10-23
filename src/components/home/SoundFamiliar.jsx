// src/components/home/SoundFamiliar.jsx
import React from 'react';

function SoundFamiliar() {
  const painPoints = [
    {
      emoji: '💬',
      text: 'Those "quick questions" have cost you 40 hours this month',
      subtext: 'All unpaid. Your expertise is valuable - why are you giving it away?'
    },
    {
      emoji: '⏰',
      text: 'Your calendar is full of "brain picking" sessions',
      subtext: 'But your revenue from them? Still zero. Time is money - except when it is not.'
    },
    {
      emoji: '🤖',
      text: 'AI gave them the basics. They need your judgment',
      subtext: 'The last-mile expertise only you can provide. Still expecting it free?'
    },
    {
      emoji: '💰',
      text: 'You built $200/hour expertise. DMs act like it costs $0',
      subtext: 'Your clients pay premium rates. Why does LinkedIn think you work for exposure?'
    }
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            {/* MODERN ICON: Sparkles instead of warning triangle */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-700 mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Sound Familiar?</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
              Your Expertise Is Being{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Undervalued
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
                className="group bg-white p-5 md:p-6 rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
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
              Stop working for free. Start getting paid what you are worth.
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              Respect their need for expertise. Respect your time. Turn inbound requests into revenue.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default SoundFamiliar;