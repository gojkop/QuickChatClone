import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function InviteSentPage() {
  const location = useLocation();
  const expertName = new URLSearchParams(location.search).get('expert') || 'the expert';

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 shadow-lg mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            Invitation Sent!
          </h1>
          
          {/* Description */}
          <p className="text-lg text-gray-700 mb-2">
            Your question has been sent to{' '}
            <span className="font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {expertName}
            </span>
          </p>
          
          <p className="text-gray-600 mb-8">
            We'll invite them to join QuickChat and answer your question. You'll receive an email once they respond.
          </p>

          {/* Info Card */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-indigo-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-indigo-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>The expert will receive your invitation via email</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>If they accept, they'll set up their QuickChat profile</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>You'll be notified when they answer your question</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/" 
              className="flex-1 py-3 px-6 text-center text-gray-700 font-semibold border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Home
            </Link>
            <Link 
              to="/invite" 
              className="flex-1 py-3 px-6 text-center text-white font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:shadow-lg transition"
            >
              Invite Another Expert
            </Link>
          </div>

          {/* Footer Note */}
          <p className="mt-8 text-sm text-gray-500">
            Are you an expert?{' '}
            <Link to="/signin" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Get your own QuickChat link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default InviteSentPage;