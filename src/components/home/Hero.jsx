import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';

function Hero() {
  return (
    <AnimatedBackground variant="hero">
      <section className="relative pt-40 pb-32 text-center">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-violet-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-6 relative">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-200/50 text-sm font-semibold text-indigo-700 mb-6 shadow-sm">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Your expertise, finally monetized
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
            Monetize every{' '}
            <span className="relative inline-block">
              <span className="animated-gradient-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
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
          
          <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Stop giving away your expertise. mindPick lets you instantly monetize "quick questions" with a personal link. 
            <span className="block mt-2 font-semibold text-gray-800">No scheduling, no awkwardness, just value for value.</span>
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signin" 
              className="group relative inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Your Link
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <a 
              href="#how-it-works" 
              className="inline-flex items-center gap-2 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-white/50 transition-all duration-300"
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
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                  src={`https://i.pravatar.cc/40?u=${i}`}
                  alt={`Expert ${i}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Join <span className="font-semibold text-indigo-600">500+ experts</span> already monetizing their inbox
            </p>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  );
}

export default Hero;