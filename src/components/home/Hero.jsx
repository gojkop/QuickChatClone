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
          
          {/* Badge - Clean & On-Brand with AI messaging */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-sm border border-indigo-200 text-sm font-semibold text-indigo-700 mb-6 shadow-sm">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            Beyond AI → Real Accountability
          </div>
          
          {/* Headline - Clear & Powerful */}
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
          
          {/* Subtext - Simplified to Single Clear Value Prop with AI positioning */}
          <p className="mt-6 md:mt-8 max-w-2xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed">
            Your audience has already tried AI and Google. Now they need{' '}
            <span className="font-bold text-gray-900">the last mile of expertise</span>—personalized judgment 
            that understands their specific situation.{' '}
            <span className="font-semibold text-indigo-600">Share your link. Set your price. Get paid instantly.</span>{' '}
            No meetings required.
          </p>
          
          {/* Single CTA Button - Maximum Focus */}
          <div className="mt-10 md:mt-12 flex justify-center">
            <Link 
              to="/signin" 
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 rounded-xl transition duration-base ease-in-out shadow-elev-2 hover:shadow-elev-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Start Earning Today</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            Free to start • 5-minute setup • No credit card required
          </p>
          
        </div>
      </section>
    </AnimatedBackground>
  );
}

export default Hero;