import React from 'react';
import { Link } from 'react-router-dom';

function SocialImpactCTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-300/30 to-amber-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Animated heart icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl mb-6">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="kindnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" /> 
                  <stop offset="50%" stopColor="#F87171" /> 
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M12.8781 5.16335C11.0031 3.48835 8.01609 3.61035 6.27309 5.35335C4.53009 7.09635 4.39909 10.0914 6.07109 11.9684L11.5351 17.4324C11.7951 17.6924 12.2051 17.6924 12.4651 17.4324L17.9291 11.9684C19.6011 10.0914 19.4701 7.09635 17.7271 5.35335C15.9841 3.61035 12.9971 3.48835 11.1221 5.16335L12.0001 6.04135L12.8781 5.16335Z" 
                fill="url(#kindnessGradient)"
                className="animate-pulse"
                style={{ animationDuration: '2s' }}
              />
            </svg>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
            Turn Your Knowledge into{' '}
            <span className="bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 bg-clip-text text-transparent">
              Kindness
            </span>
          </h2>
          
          <p className="mt-6 text-xl text-gray-700 leading-relaxed">
            mindPick empowers experts to dedicate a portion of their earnings to causes they care about. Transform your expertise into a force for good.
          </p>
          
          <Link 
            to="/social-impact" 
            className="group mt-8 inline-flex items-center justify-center gap-2 font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 py-4 px-8 rounded-full transition duration-base ease-in-out shadow-elev-2 hover:shadow-elev-3 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span>Discover Our Impact</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SocialImpactCTA;