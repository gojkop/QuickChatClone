// src/components/home/Hero.jsx
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
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-sm border border-primary/10 text-sm font-semibold text-primary mb-6 shadow-elev-1">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Your expertise, finally monetized
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
            Monetize every{' '}
            <span className="relative inline-block">
              <span className="animated-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                brain-pick
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
            .
          </h1>
          
          <p className="mt-8 max-w-2xl mx-auto text-xl text-subtext leading-relaxed">
            Stop giving away your expertise. mindPick lets you instantly monetize "quick questions" with a personal link. 
            <span className="block mt-2 font-semibold text-ink">No scheduling, no awkwardness, just value for value.</span>
          </p>
          
          {/* UPDATED CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative">
              <Link 
                to="/signin" 
                className="group relative inline-flex items-center gap-2 bg-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-indigo-700 transition duration-base ease-in-out shadow-elev-2 hover:shadow-elev-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {/* CHANGED: From "Get Your Link" to "Start Earning Today" */}
                <span>Start Earning Today</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {/* NEW: Added subtext */}
              <p className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-600 whitespace-nowrap">
                Free • 5-min setup
              </p>
            </div>
            
            <a 
              href="#how-it-works" 
              className="inline-flex items-center gap-2 text-ink/80 font-semibold py-4 px-6 rounded-lg border border-gray-200 hover:bg-canvas transition duration-base ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              See how it works
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
          
          {/* Social proof */}
          <div className="mt-16 flex flex-col items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <img 
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-surface shadow-elev-1" 
                  src={`https://i.pravatar.cc/40?u=${i}`}
                  alt={`Expert ${i}`}
                />
              ))}
            </div>
            <p className="text-sm text-subtext">
              Join <span className="font-semibold text-primary">500+ experts</span> already monetizing their inbox
            </p>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  );
}

export default Hero;