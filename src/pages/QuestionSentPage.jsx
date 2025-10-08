import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function QuestionSentPage() {
  const location = useLocation();
  const [questionId, setQuestionId] = useState('');
  const [reviewToken, setReviewToken] = useState('');
  const [expertHandle, setExpertHandle] = useState('');
  const [expertName, setExpertName] = useState('the expert');
  const [copied, setCopied] = useState(false);

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
  }, [location.search]);

  const reviewUrl = reviewToken ? `${window.location.origin}/review/${reviewToken}` : '';

  const handleCopyLink = () => {
    if (reviewUrl) {
      navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50">
      <main className="container mx-auto px-4 py-20 pt-32">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6 animate-bounce">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-6 text-center">
              <h1 className="text-3xl font-black text-white mb-2">
                Your Question is on its Way!
              </h1>
              <p className="text-indigo-100">
                The expert has been notified and you'll receive their answer via email.
              </p>
            </div>

            <div className="p-8">
               <div className="flex justify-center mb-6">
                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">What happens next?</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      1
                    </div>
                    <p className="text-gray-700 pt-0.5">The expert has been notified of your question.</p>
                  </div>
                   <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      2
                    </div>
                    <p className="text-gray-700 pt-0.5">They will review it and respond within their stated response time.</p>
                  </div>
                   <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      3
                    </div>
                    <p className="text-gray-700 pt-0.5">You'll receive an email with a link to the answer as soon as it's ready.</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">💡 Pro Tip</p>
                    <p className="text-sm text-amber-700">
                      Save the expert's profile page for easy access to ask them another question in the future.
                    </p>
                  </div>
                </div>
              </div>

              {reviewToken ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700 mb-3 text-center">
                    You can see your question and answer (once it is available) at this location:
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/review/${reviewToken}`}
                      className="flex-1 bg-white border border-indigo-200 text-indigo-600 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-50 transition text-sm truncate text-center"
                    >
                      View Question & Answer
                    </Link>
                    <button
                      onClick={handleCopyLink}
                      className="flex-shrink-0 bg-white border border-indigo-200 text-indigo-600 p-3 rounded-lg hover:bg-indigo-50 transition"
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
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Bookmark this link to check back for the answer
                  </p>
                </div>
              ) : questionId && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    Your question ID: <span className="font-semibold text-gray-800">{questionId}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    You'll receive an email with a link to view your answer
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  to={`/u/${expertHandle}`}
                  className="block w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-center"
                >
                  Ask Another Question
                </Link>
                <Link
                  to="/"
                  className="block w-full border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 transition text-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 text-sm text-gray-600">
            <p>
              Questions? Check our{' '}
              <Link to="/faq" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Help Center
              </Link>
              {' '}or{' '}
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default QuestionSentPage;