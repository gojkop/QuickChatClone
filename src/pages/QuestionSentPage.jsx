import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function QuestionSentPage() {
  const location = useLocation();
  const [questionId, setQuestionId] = useState('');
  const [reviewToken, setReviewToken] = useState('');
  const [expertHandle, setExpertHandle] = useState('');
  const [expertName, setExpertName] = useState('the expert');
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qid = params.get('question_id');
    const token = params.get('review_token');
    const handle = params.get('expert');
    const name = params.get('expertName') || 'the expert';
    
    console.log('🔍 QuestionSentPage - URL params:', {
      question_id: qid,
      review_token: token,
      expert: handle,
      expertName: name,
      fullSearch: location.search
    });
    
    setQuestionId(qid);
    setReviewToken(token);
    setExpertHandle(handle);
    setExpertName(name);
    
    if (!token) {
      console.warn('⚠️ No review_token found in URL params!');
    } else {
      console.log('✅ Review token found:', token);
    }

    // ✅ PREMIUM: Staggered content reveal animation
    setTimeout(() => setShowContent(true), 200);
  }, [location.search]);

  const reviewUrl = reviewToken ? `${window.location.origin}/r/${reviewToken}` : '';

  const handleCopyLink = () => {
    if (reviewUrl) {
      navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 pt-20 sm:pt-24 pb-12">
      <main className="container-premium">
        <div className="max-w-3xl mx-auto">
          {/* ✅ PREMIUM: Enhanced Success Icon with Glow */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="relative inline-block mb-6">
              {/* Success circle with pulse animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div 
                className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-white shadow-lg"
                style={{
                  animation: 'successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}
              >
                <svg 
                  className="w-12 h-12 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{
                    strokeDasharray: 60,
                    strokeDashoffset: 60,
                    animation: 'checkmarkDraw 0.6s ease-out 0.3s forwards'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* ✅ PREMIUM: Gradient heading */}
            <h1 
              className="heading-gradient-primary text-4xl sm:text-5xl font-black mb-3"
              style={{
                animation: 'fadeInUp 0.6s ease-out 0.4s both'
              }}
            >
              Question Sent Successfully!
            </h1>
            <p 
              className="text-lg text-gray-600 body-text-premium max-w-xl mx-auto"
              style={{
                animation: 'fadeInUp 0.6s ease-out 0.5s both'
              }}
            >
              {expertName} has been notified and will review your question soon.
            </p>
          </div>

          {/* ✅ PREMIUM: Glass morphism card */}
          <div 
            className="review-card-glass rounded-2xl overflow-hidden spacing-lg"
            style={{
              animation: showContent ? 'fadeInUp 0.6s ease-out 0.6s both' : 'none'
            }}
          >
            {/* What Happens Next Section */}
            <div className="card-premium-padding">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="section-title-premium mb-0">What happens next?</h2>
              </div>

              {/* ✅ PREMIUM: Enhanced timeline steps */}
              <div className="space-y-4 mb-8">
                {[
                  {
                    step: 1,
                    text: "Expert notification sent",
                    subtext: `${expertName} has been notified about your question`,
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    )
                  },
                  {
                    step: 2,
                    text: "Expert reviews your question",
                    subtext: "They'll respond within their stated response time",
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    )
                  },
                  {
                    step: 3,
                    text: "You receive the answer",
                    subtext: "Check your email for a link to view their response",
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )
                  }
                ].map((item, index) => (
                  <div 
                    key={item.step}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-subtle-indigo border border-indigo-100/50 transition-all hover:shadow-md"
                    style={{
                      animation: showContent ? `fadeInUp 0.4s ease-out ${0.7 + index * 0.1}s both` : 'none'
                    }}
                  >
                    {/* Step number with gradient */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {item.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-indigo-600">
                          {item.icon}
                        </div>
                        <p className="font-bold text-gray-900">{item.text}</p>
                      </div>
                      <p className="text-sm text-gray-600">{item.subtext}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ PREMIUM: Enhanced Pro Tip box */}
              <div 
                className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200/60 rounded-xl p-5 mb-6 spacing-md"
                style={{
                  animation: showContent ? 'fadeInUp 0.4s ease-out 1s both' : 'none',
                  boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.15)'
                }}
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      Pro Tip
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Save {expertName}'s profile for future questions. Experts love working with repeat clients who value their expertise!
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ PREMIUM: Review token link section */}
              {reviewToken ? (
                <div 
                  className="bg-gradient-subtle-purple border-2 border-purple-200/60 rounded-xl p-5 spacing-md"
                  style={{
                    animation: showContent ? 'fadeInUp 0.4s ease-out 1.1s both' : 'none'
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <p className="font-bold text-gray-900">Your Question Link</p>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Track your question and view the answer once it's ready:
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/r/${reviewToken}`}
                      className="btn-premium flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all text-sm text-center"
                    >
                      View Question & Answer →
                    </Link>
                    <button
                      onClick={handleCopyLink}
                      className="btn-premium flex-shrink-0 bg-white border-2 border-purple-300 text-purple-600 p-3 rounded-xl hover:bg-purple-50 transition-all"
                      title="Copy link"
                    >
                      {copied ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 font-semibold mt-2 text-center animate-fadeIn flex items-center justify-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Link copied to clipboard!
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    💾 Bookmark this link to check back anytime
                  </p>
                </div>
              ) : questionId && (
                <div 
                  className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-5 text-center"
                  style={{
                    animation: showContent ? 'fadeInUp 0.4s ease-out 1.1s both' : 'none'
                  }}
                >
                  <p className="text-sm text-gray-700 mb-2">
                    Your question ID: <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-300">{questionId}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    You'll receive an email with a link to view your answer
                  </p>
                </div>
              )}

              {/* ✅ PREMIUM: Enhanced CTA buttons */}
              <div 
                className="space-y-3 mt-8"
                style={{
                  animation: showContent ? 'fadeInUp 0.4s ease-out 1.2s both' : 'none'
                }}
              >
                <Link
                  to={`/u/${expertHandle}`}
                  className="btn-premium btn-gradient-primary block w-full text-white font-bold py-4 px-6 rounded-xl hover:shadow-xl transition-all text-center"
                >
                  Ask {expertName} Another Question →
                </Link>
                <Link
                  to="/"
                  className="btn-premium block w-full border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-center"
                >
                  Explore Other Experts
                </Link>
              </div>
            </div>
          </div>

          {/* ✅ PREMIUM: Enhanced footer links */}
          <div 
            className="text-center mt-8 text-sm text-gray-600"
            style={{
              animation: showContent ? 'fadeInUp 0.4s ease-out 1.3s both' : 'none'
            }}
          >
            <p className="flex items-center justify-center gap-2 flex-wrap">
              <span>Need help?</span>
              <Link to="/faq" className="text-indigo-600 hover:text-indigo-700 font-semibold underline decoration-2 underline-offset-2 hover:decoration-indigo-700 transition">
                Help Center
              </Link>
              <span className="text-gray-400">•</span>
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 font-semibold underline decoration-2 underline-offset-2 hover:decoration-indigo-700 transition">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QuestionSentPage;