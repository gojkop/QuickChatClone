import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ValueCalculator() {
  const [questionsPerWeek, setQuestionsPerWeek] = useState(2);
  const [pricePerQuestion, setPricePerQuestion] = useState(75);
  const [results, setResults] = useState({
    monthly: 0,
    yearly: 0,
    hoursPerWeek: 0,
    meetingsAvoided: 0
  });

  useEffect(() => {
    const monthlyRevenue = questionsPerWeek * pricePerQuestion * 4;
    const yearlyRevenue = monthlyRevenue * 12;
    const hoursPerWeek = questionsPerWeek * 0.33; // ~20 min per question
    const meetingsAvoided = questionsPerWeek * 52; // yearly

    setResults({
      monthly: monthlyRevenue,
      yearly: yearlyRevenue,
      hoursPerWeek,
      meetingsAvoided
    });
  }, [questionsPerWeek, pricePerQuestion]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-30"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
              Calculate Your Potential
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              See how much you could earn by monetizing quick questions without scheduling a single meeting.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl border border-gray-200 shadow-lg p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Left: Inputs */}
              <div className="space-y-8">
                <div>
                  <label htmlFor="questions" className="block text-sm font-semibold text-gray-900 mb-3">
                    Questions per week
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      id="questions"
                      min="1"
                      max="10"
                      step="1"
                      value={questionsPerWeek}
                      onChange={(e) => setQuestionsPerWeek(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-indigo-600 text-2xl font-bold text-indigo-600 shadow-sm">
                      {questionsPerWeek}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-3">
                    Price per question (€)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      id="price"
                      min="25"
                      max="200"
                      step="25"
                      value={pricePerQuestion}
                      onChange={(e) => setPricePerQuestion(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>€25</span>
                      <span>€100</span>
                      <span>€200</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center justify-center px-5 h-16 rounded-full bg-white border-2 border-violet-600 text-2xl font-bold text-violet-600 shadow-sm">
                      €{pricePerQuestion}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Results */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-sm font-semibold text-gray-600 mb-2">Monthly Revenue</div>
                  <div className="text-4xl font-black text-gray-900 mb-1">
                    {formatCurrency(results.monthly)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {questionsPerWeek} questions/week × 4 weeks
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm">
                  <div className="text-sm font-semibold text-indigo-600 mb-2">Yearly Revenue</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-1">
                    {formatCurrency(results.yearly)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Without a single scheduled meeting
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Time saved</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {results.hoursPerWeek.toFixed(1)}h
                    </div>
                    <div className="text-xs text-gray-500">per week</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Meetings avoided</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {results.meetingsAvoided}
                    </div>
                    <div className="text-xs text-gray-500">per year</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 pt-8 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-4">
                These numbers are based on your inputs. Actual results may vary.
              </p>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 rounded-xl text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <span>Start Earning Today</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="mt-4 text-xs text-gray-500">
                No credit card required • 5-minute setup • Cancel anytime
              </p>
            </div>
          </div>

          {/* Optional: Key insight below calculator */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-indigo-700">
                Most experts set their price at €50-€100 per question
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueCalculator;