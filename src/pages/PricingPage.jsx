// src/pages/PricingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function PricingPage() {
  const { isAuthenticated } = useAuth();

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="bg-white">
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
                  {isAuthenticated ? "Upgrade to Pro" : "Start with Pro"}
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

      {/* NEW: Trust Badges Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-6 text-center font-medium">
              Trusted payment processing and security
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {/* Stripe Logo */}
              <div className="flex flex-col items-center gap-2">
                <svg className="h-8 opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#6772E5"/>
                </svg>
                <span className="text-xs text-gray-500">Secure payments</span>
              </div>

              {/* Security Badges */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">SSL Encrypted</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">GDPR Compliant</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Money-back SLA</span>
                </div>
              </div>
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
                  If you don't answer within your stated timeframe, the asker receives an automatic full refund. This builds trust with your audience.
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