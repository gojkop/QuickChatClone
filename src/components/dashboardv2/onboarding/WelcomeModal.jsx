import React from 'react';
import { Sparkles } from 'lucide-react';

function WelcomeModal({ userName, onGetStarted }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
          Welcome to mindPick{userName ? `, ${userName}` : ''}! 🎉
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 text-center mb-8">
          You're about to turn "Can I pick your brain?" into revenue.
        </p>

        {/* Subtext */}
        <p className="text-sm text-gray-500 text-center mb-8">
          Let's get you set up in 2 minutes
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default WelcomeModal;
