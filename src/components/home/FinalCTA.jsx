import React from 'react';
import { Link } from 'react-router-dom';

function FinalCTA() {
  return (
    <section className="py-12 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* ENHANCED HEADLINE WITH AI POSITIONING */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Where AI Stops,{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Your Expertise Begins
              </span>
            </span>
          </h2>
          
          {/* ENHANCED SUBTEXT */}
          <p className="mt-5 md:mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
            Turn your <span className="font-bold text-gray-900">last-mile expertise</span> into a revenue stream. 
            Get paid for the judgment, context, and accountability only you can provide—without adding meetings to your calendar.
          </p>
          
          {/* CTAs */}
          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signin" 
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 md:py-5 md:px-10 rounded-xl text-base md:text-lg transition duration-base ease-in-out shadow-elev-2 hover:shadow-elev-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Claim My Free Expert Link</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-2 text-gray-700 font-semibold py-4 px-6 md:py-5 md:px-8 rounded-xl border-2 border-gray-300 hover:border-indigo-600 hover:bg-indigo-50 transition duration-base ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              View Pricing
            </Link>
          </div>
          
          {/* Trust signals */}
          <div className="mt-12 md:mt-16 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">5-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;