import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function QuestionSentPage() {
  const location = useLocation();
  const [questionId, setQuestionId] = useState('');
  const [expertName, setExpertName] = useState('the expert');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuestionId(params.get('question_id'));
    // In a real app, you might fetch the expert's name using the questionId
    setExpertName(params.get('expert') || 'the expert'); 
  }, [location.search]);

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
              
              {questionId && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center mb-6">
                  <p className="text-sm text-gray-600">
                    Your question ID is: <span className="font-semibold text-gray-800">{questionId}</span>
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  to="/"
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