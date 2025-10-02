import React from 'react';
import { Link } from 'react-router-dom';

function SocialImpactCTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-200 opacity-30 rounded-full blur-3xl -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-200 opacity-30 rounded-full blur-3xl translate-x-12 translate-y-12"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* New Multi-colored Heart Icon */}
          <svg className="mx-auto h-12 w-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="kindnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" /> 
                <stop offset="50%" stopColor="#F87171" /> 
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
            <path fillRule="evenodd" clipRule="evenodd" d="M12.8781 5.16335C11.0031 3.48835 8.01609 3.61035 6.27309 5.35335C4.53009 7.09635 4.39909 10.0914 6.07109 11.9684L11.5351 17.4324C11.7951 17.6924 12.2051 17.6924 12.4651 17.4324L17.9291 11.9684C19.6011 10.0914 19.4701 7.09635 17.7271 5.35335C15.9841 3.61035 12.9971 3.48835 11.1221 5.16335L12.0001 6.04135L12.8781 5.16335Z" fill="url(#kindnessGradient)"/>
          </svg>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Turn Your Knowledge into <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500">Kindness</span>
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            QuickChat empowers experts to dedicate a portion of their earnings to causes they care about. Transform your expertise into a force for good.
          </p>
          <Link to="/social-impact" className="mt-6 inline-flex items-center justify-center space-x-2 font-semibold text-white bg-indigo-600 py-3 px-8 rounded-full hover:bg-indigo-700 transition transform hover:scale-105 shadow-lg">
            <span>Discover Our Impact</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SocialImpactCTA;