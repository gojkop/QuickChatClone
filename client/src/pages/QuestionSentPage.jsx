import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function QuestionSentPage() {
  const location = useLocation();
  // In a real app, you might get expert details from the URL or a state management library
  const expertName = "the expert"; 
  const expertSLA = "48 hours";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="p-8 rounded-2xl bg-white/70 backdrop-blur-lg shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <svg className="w-20 h-20 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your question has been sent!</h1>
          <p className="mt-4 text-lg text-gray-700">
            We've securely delivered your question to <span className="font-semibold">{expertName}</span>.
          </p>
          <div className="mt-6 p-4 bg-white/50 rounded-lg border">
            <p className="text-sm text-gray-800">
              You can expect a reply within <span className="font-semibold">{expertSLA}</span>.
            </p>
            <p className="mt-2 text-xs text-gray-600">
              We'll send you an email with a secure link to view the answer as soon as it's ready.
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center space-y-4">
            <Link to="/" className="w-full max-w-xs text-lg font-bold py-3 px-4 rounded-lg text-indigo-600 bg-white border border-indigo-600 hover:bg-indigo-50">
              Back to Home
            </Link>
            <p className="text-sm text-gray-600 mt-6">
              Are you an expert? <Link to="/signin" className="text-indigo-600 hover:underline font-medium">Get your own QuickChat link!</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionSentPage;