import React from 'react';
import { Link } from 'react-router-dom';

function SocialImpactCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-pink-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-48 h-48 bg-purple-200 opacity-30 rounded-full blur-3xl -top-12 -left-12"></div>
        <div className="absolute w-64 h-64 bg-green-200 opacity-30 rounded-full blur-3xl -bottom-16 -right-16"></div>
      </div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <svg className="mx-auto h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            Turn Your Knowledge into <span className="text-indigo-600">Kindness</span>
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