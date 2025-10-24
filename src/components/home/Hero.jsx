import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';

function Hero() {
  return (
    <AnimatedBackground variant="hero">
      <section className="relative pt-20 pb-16 md:pt-40 md:pb-32 text-center">
        
        {/* ✅ PHASE 3: Floating decorative elements with animation */}
        <div className="pointer-events-none absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl float-slow"></div>
        <div className="pointer-events-none absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl float-medium"></div>
        
        <div className="container mx-auto px-6 relative">
          
          {/* ✅ PHASE 3: Enhanced badge with stagger animation */}
          <div 
            className="stagger-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200/50 text-sm font-semibold text-indigo-700 mb-6"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 4px 16px 0 rgba(99, 102, 241, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)'
            }}
          >
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            Beyond AI → Real Accountability
          </div>
          
          {/* ✅ PHASE 3: Enhanced headline with shimmer gradient */}
          <h1 
            className="stagger-fade-in text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight"
            style={{
              letterSpacing: '-0.02em',
              fontFeatureSettings: '"kern" 1',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased'
            }}
          >
            Get Paid for{' '}
            <span className="relative inline-block">
              <span className="gradient-text-shimmer bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
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
          
          {/* Enhanced body text */}
          <p 
            className="stagger-fade-in mt-6 md:mt-8 max-w-2xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed"
            style={{
              letterSpacing: '0.01em',
              lineHeight: '1.6'
            }}
          >
            Your audience has already tried AI and Google. Now they need{' '}
            <span className="font-bold text-gray-900">the last mile of expertise</span>—personalized judgment 
            that understands their specific situation.{' '}
            <span className="font-semibold text-indigo-600">Share your link. Set your price. Get paid instantly.</span>{' '}
            No meetings required.
          </p>
          
          {/* ✅ PHASE 3: CTA with magnetic hover effect */}
          <div className="stagger-fade-in mt-10 md:mt-12 flex justify-center">
            <Link 
              to="/signin" 
              className="btn-premium btn-gradient-primary magnetic-hover group inline-flex items-center gap-2 text-white font-bold py-4 px-8 rounded-xl transition-all"
              style={{
                boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.3), 0 2px 6px -1px rgba(139, 92, 246, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <span>Start Earning Today</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          <p className="stagger-fade-in mt-4 text-sm text-gray-500" style={{ letterSpacing: '0.01em' }}>
            Free to start • 5-minute setup • No credit card required
          </p>
          
        </div>
      </section>
    </AnimatedBackground>
  );
}

export default Hero;