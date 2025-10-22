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
          
          {/* Badge - Expert-Affirming */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-700 mb-6 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            You're the Expert After AI Fails
          </div>
          
          {/* Headline - Catchy & Value-Focused */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
            Monetize{' '}
            <span className="relative inline-block">
              <span className="animated-gradient-text bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                The Last Mile
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
            {' '}of Expertise
          </h1>
          
          {/* Subtext - Clear Value Prop */}
          <p className="mt-8 max-w-2xl mx-auto text-xl text-subtext leading-relaxed">
            Your audience has already Googled. They've asked ChatGPT. Now they need YOU—
            <span className="block mt-2 font-semibold text-ink">The human who understands their context. Get paid for being irreplaceable.</span>
          </p>
          
          {/* THE INTELLIGENCE SPECTRUM - Expert-Centric Messaging */}
          <div className="mt-16 mb-12 max-w-4xl mx-auto">
            
            {/* Gradient Bar */}
            <div className="h-3 bg-gradient-to-r from-gray-300 via-indigo-400 to-violet-600 rounded-full mb-8 shadow-sm"></div>
            
            {/* Three Stages - Expert Journey Perspective */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Stage 1: Where They Start */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">They Start Here</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Google, ChatGPT, articles—generic answers for generic questions
                </p>
                <div className="text-xs text-gray-500 italic">
                  Free information, no context
                </div>
              </div>

              {/* Stage 2: Your Value (HERO - elevated) */}
              <div className="bg-white rounded-xl border-2 border-indigo-300 p-6 shadow-lg transform md:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center mb-4 shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">They Pay You Here</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your expertise for THEIR situation—valued, paid, delivered async
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  <span>💰</span>
                  <span>€50-€200 per answer</span>
                </div>
              </div>

              {/* Stage 3: What You Deliver */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">You Deliver This</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Context, judgment, accountability—what no AI can replicate
                </p>
                <div className="text-xs text-gray-500 italic">
                  Your irreplaceable value
                </div>
              </div>

            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signin" 
              className="group relative inline-flex items-center gap-2 bg-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-indigo-700 transition duration-base ease-in-out shadow-elev-2 hover:shadow-elev-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Start Earning Today</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="absolute -bottom-7 left-0 right-0 text-center text-xs text-gray-600 font-normal">
                Free • 5-min setup • No meetings
              </span>
            </Link>
            
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
          <div className="mt-20 flex flex-col items-center gap-3">
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
              Join <span className="font-semibold text-primary">500+ experts</span> earning from their expertise
            </p>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  );
}

export default Hero;