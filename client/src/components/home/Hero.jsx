import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="relative pt-40 pb-28 text-center overflow-hidden">
      <div className="container mx-auto px-6 relative">
        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
          Monetize every <span className="animated-gradient-text">brain-pick</span>.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
          Stop giving away your expertise. QuickChat lets you instantly monetize "quick questions" with a personal link. No scheduling, no awkwardness, just value for value.
        </p>
        <div className="mt-10">
          <Link to="/signin" className="inline-block bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-indigo-700 transition transform hover:scale-105 duration-300 shadow-xl cta-pulse">
            Get Your Link &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;