import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ValueCalculator() {
  const [questionsPerWeek, setQuestionsPerWeek] = useState(3);
  const [pricePerQuestion, setPricePerQuestion] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [timeHorizon, setTimeHorizon] = useState('monthly');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Industry presets with SVG icons
  const presets = [
    { 
      id: 'consultant', 
      label: 'Consultant', 
      questions: 3, 
      price: 100,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'lawyer', 
      label: 'Lawyer', 
      questions: 2, 
      price: 150,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    },
    { 
      id: 'doctor', 
      label: 'Doctor', 
      questions: 2, 
      price: 125,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    { 
      id: 'tech', 
      label: 'Tech Expert', 
      questions: 4, 
      price: 75,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    { 
      id: 'designer', 
      label: 'Designer', 
      questions: 3, 
      price: 60,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    { 
      id: 'coach', 
      label: 'Coach', 
      questions: 4, 
      price: 80,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      id: 'finance', 
      label: 'Finance', 
      questions: 2, 
      price: 120,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'custom', 
      label: 'Custom', 
      questions: 3, 
      price: 100,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
  ];

  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setQuestionsPerWeek(preset.questions);
    setPricePerQuestion(preset.price);
  };

  // Calculations
  const weeklyRevenue = questionsPerWeek * pricePerQuestion;
  const monthlyRevenue = weeklyRevenue * 4.33;
  const yearlyRevenue = weeklyRevenue * 52;

  const platformFeeRate = 0.10;
  const stripeFeeRate = 0.032;
  const totalFeeRate = platformFeeRate + stripeFeeRate;

  const monthlyPlatformFee = monthlyRevenue * platformFeeRate;
  const monthlyStripeFee = monthlyRevenue * stripeFeeRate;
  const monthlyTakeHome = monthlyRevenue * (1 - totalFeeRate);

  const proMonthlyFee = 15;
  const proRevenue = monthlyRevenue * (1 - 0.07 - stripeFeeRate) - proMonthlyFee;
  const proSavings = proRevenue - monthlyTakeHome;

  const minutesPerQuestion = 10;
  const weeklyMinutes = questionsPerWeek * minutesPerQuestion;
  const monthlyHours = (weeklyMinutes * 4.33) / 60;
  const effectiveHourlyRate = monthlyTakeHome / monthlyHours;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDisplayRevenue = () => {
    switch (timeHorizon) {
      case 'weekly':
        return { amount: weeklyRevenue, label: 'week' };
      case 'monthly':
        return { amount: monthlyRevenue, label: 'month' };
      case 'yearly':
        return { amount: yearlyRevenue, label: 'year' };
      default:
        return { amount: monthlyRevenue, label: 'month' };
    }
  };

  const displayRevenue = getDisplayRevenue();

  const getPricingGuidance = () => {
    if (pricePerQuestion < 50) return "Entry-level";
    if (pricePerQuestion < 100) return "Mid-range";
    if (pricePerQuestion < 150) return "Premium";
    return "High-end";
  };

  const getQuestionsGuidance = () => {
    if (questionsPerWeek <= 2) return "Light";
    if (questionsPerWeek <= 5) return "Part-time";
    if (questionsPerWeek <= 10) return "Substantial";
    return "Full-time";
  };

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-3">
            Your Potential Earnings
          </h2>
          <p className="text-gray-600 mb-10">
            Calculate your earning potential based on your expertise
          </p>

          {/* Calculator Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
            
            {/* Industry Presets - Subtle pills */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4 text-left">
                Choose your expertise
              </label>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPreset === preset.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {preset.icon}
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

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
                  max="20"
                  step="1"
                  value={questionsPerWeek}
                  onChange={(e) => {
                    setQuestionsPerWeek(Number(e.target.value));
                    setSelectedPreset('custom');
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-lg border border-indigo-100">
                    {questionsPerWeek}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{getQuestionsGuidance()}</span>
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
                  step="5"
                  value={pricePerQuestion}
                  onChange={(e) => {
                    setPricePerQuestion(Number(e.target.value));
                    setSelectedPreset('custom');
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 font-bold text-lg border border-violet-100">
                    €{pricePerQuestion}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{getPricingGuidance()}</span>
                </div>
              </div>
            </div>

            {/* Time Horizon Tabs */}
            <div className="flex justify-center gap-2 mb-6">
              {['weekly', 'monthly', 'yearly'].map((horizon) => (
                <button
                  key={horizon}
                  onClick={() => setTimeHorizon(horizon)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    timeHorizon === horizon
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {horizon.charAt(0).toUpperCase() + horizon.slice(1)}
                </button>
              ))}
            </div>

            {/* Result Display */}
            <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-xl p-6 mb-4 border border-indigo-100">
              <div className="text-sm font-semibold text-gray-600 mb-2">
                Your potential revenue
              </div>
              <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                {formatCurrency(displayRevenue.amount)}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                per {displayRevenue.label}
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="font-medium">After fees: ~{formatCurrency(monthlyTakeHome)}/mo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">~{monthlyHours.toFixed(1)} hrs/month</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-medium">{formatCurrency(effectiveHourlyRate)}/hr</span>
                </div>
              </div>
            </div>

            {/* Expandable Breakdown */}
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 mb-6 inline-flex items-center gap-1 transition-colors"
            >
              <span>{showBreakdown ? 'Hide' : 'Show'} detailed breakdown</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Breakdown Details */}
            {showBreakdown && (
              <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left text-sm border border-gray-200">
                <div className="font-semibold text-gray-900 mb-3">Monthly Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross revenue:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Platform fee (10%):</span>
                    <span className="font-semibold">-{formatCurrency(monthlyPlatformFee)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Stripe fees (~3.2%):</span>
                    <span className="font-semibold">-{formatCurrency(monthlyStripeFee)}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-gray-300 flex justify-between">
                    <span className="font-bold text-gray-900">Your take-home:</span>
                    <span className="font-bold text-green-600">{formatCurrency(monthlyTakeHome)}</span>
                  </div>
                </div>
                
                {proSavings > 0 && monthlyRevenue > 500 && (
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-indigo-800">
                        <span className="font-semibold">Pro tip:</span> At this volume, Pro plan saves you {formatCurrency(proSavings)}/month with lower fees.{' '}
                        <Link to="/pricing" className="underline font-semibold hover:text-indigo-900">
                          Learn more →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <Link
              to="/signin"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-8 rounded-lg transition duration-base ease-in-out shadow-elev-2 hover:shadow-elev-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Create My Expert Page</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <p className="mt-4 text-xs text-gray-500">
              No meetings • Just async answers • No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ValueCalculator;