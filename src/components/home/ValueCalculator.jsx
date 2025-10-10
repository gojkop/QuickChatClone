import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ValueCalculator() {
  const [questionsPerWeek, setQuestionsPerWeek] = useState(2);
  const [pricePerQuestion, setPricePerQuestion] = useState(75);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);

  useEffect(() => {
    const yearly = questionsPerWeek * pricePerQuestion * 52;
    setYearlyRevenue(yearly);
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
    <section className="py-20 md:py-24 bg-gradient-to-b from-surface to-canvas">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-ink mb-3">
            Your Potential Earnings
          </h2>
          <p className="text-subtext mb-10">
            Quick calculation based on your availability and pricing
          </p>

          {/* Compact Calculator Card */}
          <div className="bg-surface rounded-xl border border-gray-200 shadow-elev-3 p-6 md:p-8">
            {/* Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Questions Input */}
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Questions per week
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={questionsPerWeek}
                  onChange={(e) => setQuestionsPerWeek(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="mt-2 text-center">
                  <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-lg">
                    {questionsPerWeek}
                  </span>
                </div>
              </div>

              {/* Price Input */}
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price per question
                </label>
                <input
                  type="range"
                  min="25"
                  max="200"
                  step="25"
                  value={pricePerQuestion}
                  onChange={(e) => setPricePerQuestion(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="mt-2 text-center">
                  <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent font-bold text-lg">
                    €{pricePerQuestion}
                  </span>
                </div>
              </div>
            </div>

            {/* Result Display */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 mb-6">
              <div className="text-sm font-semibold text-subtext mb-2">
                Your potential yearly revenue
              </div>
              <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {formatCurrency(yearlyRevenue)}
              </div>
              <div className="text-xs text-subtext mt-2">
                No meetings scheduled • Just async answers
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/signin"
              className="btn btn-primary px-6 py-3"
            >
              <span>Get Your Link</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueCalculator;
