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
                  {isAuthenticated ? "Go to Dashboard" : "Start for Free"}
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
                  className="block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg transform hover:scale-[1.02]"
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
                      <span>Remove "Powered by QuickChat"</span>
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

      {/* Comparison Table (Optional - Compact) */}
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
              <Link to="/faq" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                <span>View all FAQs</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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