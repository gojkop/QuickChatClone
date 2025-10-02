import React from 'react';
import { Link } from 'react-router-dom';

function FinalCTA() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Stop losing money. <br className="md:hidden" />Reclaim your time.</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
          Turn inbound requests into a new revenue stream without adding a single meeting to your calendar.
        </p>
        <div className="mt-8">
          <Link to="/signin" className="inline-block bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-indigo-700 transition transform hover:scale-105 duration-300 shadow-lg cta-pulse">
            Start for Free
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;