import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/common/SEO';


function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [pricePerQuestion, setPricePerQuestion] = useState(50);

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );

  // ROI Calculator Logic
  const starterFeePerQuestion = pricePerQuestion * 0.10;
  const proFeePerQuestion = pricePerQuestion * 0.07;
  const savingsPerQuestion = starterFeePerQuestion - proFeePerQuestion;
  const breakEvenQuestions = Math.ceil(15 / savingsPerQuestion);
  const monthlyProCost = 15;

  // Example calculations for 20 questions/month
  const exampleQuestions = 20;
  const starterMonthlyFees = starterFeePerQuestion * exampleQuestions;
  const proMonthlyFees = (proFeePerQuestion * exampleQuestions) + monthlyProCost;
  const monthlySavings = starterMonthlyFees - proMonthlyFees;

  return (
    <div className="bg-white">
        <SEO
      title="Pricing - mindPick"
      description="Simple, transparent pricing for experts. Start free with a 10% platform fee or upgrade to Pro for just €15/month with reduced 7% fees. No hidden costs, no long-term contracts."
    />
      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-16 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
            Simple,{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Focus on sharing your expertise. We'll handle the rest.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Starter Plan */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900">Starter</h2>
                <p className="text-gray-600 mt-2">Perfect for getting started</p>
                
                <div className="mt-8 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-gray-900">Free</span>
                    <span className="text-gray-500">to start</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    10% platform fee per transaction
                  </p>
                </div>

                <Link 
                  to={isAuthenticated ? "/expert" : "/signin"} 
                  className="block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all duration-200 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Start Free • No Card Required"}
                </Link>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="text-sm font-semibold text-gray-900 mb-4">What's included:</div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Personal expert link and page</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Secure Stripe Connect payouts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Pay → record → answer flow</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Email notifications & SLA timer</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Basic earnings analytics</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  + Stripe processing fees (~2.9% + €0.30)
                </p>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-white rounded-xl border-2 border-indigo-600 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Recommended Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-lg shadow-sm">
                Recommended
              </div>

              <div className="p-8 pt-12">
                <h2 className="text-2xl font-bold text-gray-900">Pro</h2>
                <p className="text-gray-600 mt-2">For active experts</p>
                
                <div className="mt-8 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">€15</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">or €144/year (save 2 months)</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    7% platform fee per transaction
                  </p>
                </div>

                <Link 
                  to={isAuthenticated ? "/expert" : "/signin?plan=pro"} 
                  className="group block w-full text-center py-3 px-4 rounded-lg font-semibold transition duration-base ease-in-out bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-elev-2 hover:shadow-elev-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {isAuthenticated ? "Upgrade to Pro" : "Start with Pro • No Card Required"}
                </Link>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="text-sm font-semibold text-gray-900 mb-4">Everything in Starter, plus:</div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Reduced 7% platform fee</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Remove "Powered by mindPick"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>AI transcripts & TL;DR summaries</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Social share kit & captions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Custom branding options</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckIcon />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="px-8 py-4 bg-indigo-50 border-t border-indigo-100">
                <p className="text-xs text-gray-600 text-center">
                  + Stripe processing fees (~2.9% + €0.30)
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Compare Plans</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                <div className="text-sm font-semibold text-gray-600">Feature</div>
                <div className="text-sm font-semibold text-gray-900 text-center">Starter</div>
                <div className="text-sm font-semibold text-indigo-600 text-center">Pro</div>
              </div>
              
              {[
                { feature: 'Platform Fee', starter: '10%', pro: '7%' },
                { feature: 'Monthly Cost', starter: 'Free', pro: '€15' },
                { feature: 'Expert Link', starter: true, pro: true },
                { feature: 'AI Features', starter: false, pro: true },
                { feature: 'White Label', starter: false, pro: true },
                { feature: 'Priority Support', starter: false, pro: true }
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100 last:border-b-0 items-center">
                  <div className="text-sm text-gray-700">{row.feature}</div>
                  <div className="text-sm flex items-center justify-center">
                    {typeof row.starter === 'boolean' ? (
                      row.starter ? 
                        <CheckIcon /> : 
                        <span className="text-gray-300">—</span>
                    ) : (
                      <span className="font-semibold text-gray-900">{row.starter}</span>
                    )}
                  </div>
                  <div className="text-sm flex items-center justify-center">
                    {typeof row.pro === 'boolean' ? (
                      row.pro ? 
                        <CheckIcon /> : 
                        <span className="text-gray-300">—</span>
                    ) : (
                      <span className="font-semibold text-indigo-600">{row.pro}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator - COMPACT VERSION */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                When Does Pro Pay for Itself?
              </h2>
              <p className="text-gray-600 text-sm">
                Calculate your break-even point based on your pricing
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 p-6">
              {/* Interactive Price Input */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Your price per question
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={pricePerQuestion}
                    onChange={(e) => setPricePerQuestion(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex items-center gap-1 bg-white border-2 border-indigo-600 rounded-lg px-3 py-1.5 min-w-[90px]">
                    <span className="text-gray-500 font-semibold text-sm">€</span>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={pricePerQuestion}
                      onChange={(e) => setPricePerQuestion(Number(e.target.value))}
                      className="w-full font-bold text-lg text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Break-even Highlight */}
              <div className="bg-white rounded-lg border-2 border-indigo-600 p-4 mb-5 text-center shadow-md">
                <div className="text-xs font-semibold text-gray-600 mb-1">Pro pays for itself after</div>
                <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-0.5">
                  {breakEvenQuestions}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {breakEvenQuestions === 1 ? 'question' : 'questions'} per month
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Save <span className="font-bold text-indigo-600">€{savingsPerQuestion.toFixed(2)}</span> per question
                </div>
              </div>

              {/* Detailed Breakdown - Compact */}
              <div className="grid md:grid-cols-2 gap-4 mb-5">
                {/* Starter Breakdown */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Starter</h3>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Free</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform fee</span>
                      <span className="font-semibold text-gray-900">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee per question</span>
                      <span className="font-semibold text-gray-900">€{starterFeePerQuestion.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                      <span className="text-gray-600">Monthly ({exampleQuestions}q)</span>
                      <span className="font-bold text-gray-900">€{starterMonthlyFees.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Pro Breakdown */}
                <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-100 rounded-lg border-2 border-indigo-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Pro</h3>
                    <span className="text-xs font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded">€15/mo</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform fee</span>
                      <span className="font-semibold text-gray-900">7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee per question</span>
                      <span className="font-semibold text-gray-900">€{proFeePerQuestion.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-indigo-200 flex justify-between">
                      <span className="text-gray-600">Monthly ({exampleQuestions}q)</span>
                      <span className="font-bold text-indigo-600">€{proMonthlyFees.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Highlight - Compact */}
              {monthlySavings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-5">
                  <div className="text-xs font-semibold text-green-700 mb-0.5">
                    Monthly savings with Pro ({exampleQuestions} questions/month)
                  </div>
                  <div className="text-2xl font-black text-green-600">
                    €{monthlySavings.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    €{(monthlySavings * 12).toFixed(2)}/year
                  </div>
                </div>
              )}

              {/* CTA - Compact */}
              <div className="text-center">
                <Link
                  to={isAuthenticated ? "/expert" : "/signin?plan=pro"}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm py-2.5 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span>{isAuthenticated ? "Upgrade to Pro" : "Start with Pro"}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <p className="mt-2 text-xs text-gray-500">No card required • Cancel anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {/* Stripe Logo */}
            <div className="flex items-center gap-2">
              <svg className="h-8" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF"/>
              </svg>
              <span className="text-xs font-semibold text-gray-600">Payments by Stripe</span>
            </div>
            
            {/* Security Badges */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-gray-600">SSL Encrypted</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-gray-600">GDPR Compliant</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-gray-600">SLA Money-back Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Common Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">When do I get paid?</h3>
                <p className="text-gray-600 text-sm">
                  Payments are processed via Stripe Connect and sent directly to your bank account automatically.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Can I switch plans later?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">What if I miss my SLA?</h3>
                <p className="text-gray-600 text-sm">
                  If you don't answer within your stated timeframe, the payment authorization is released and the asker is not charged.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link to="/faq" className="group inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                <span>View all FAQs</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PricingPage;