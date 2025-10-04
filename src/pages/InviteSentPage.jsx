import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

function InviteSentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expertName, setExpertName] = useState('the expert');
  const [method, setMethod] = useState('email');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setExpertName(params.get('expert') || 'the expert');
    setMethod(params.get('method') || 'email');
  }, [location.search]);

  const getMethodInfo = () => {
    switch (method) {
      case 'email':
        return {
          icon: (
            <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          title: 'Question Sent!',
          description: `We've sent your question to ${expertName} along with an invitation to answer on QuickChat.`,
          nextSteps: [
            'They\'ll receive your question and an invitation to join QuickChat',
            'Once they sign up and view your question, we\'ll notify you',
            'You\'ll receive their answer via email when they respond'
          ]
        };
      case 'linkedin':
        return {
          icon: (
            <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          ),
          title: 'Ready to Send!',
          description: `You have a message ready for ${expertName} on LinkedIn.`,
          nextSteps: [
            'Send them the message you copied on LinkedIn',
            'They\'ll use the link to see your question and join QuickChat',
            'You\'ll be notified when they view and respond to your question'
          ]
        };
      case 'social':
        return {
          icon: (
            <svg className="w-16 h-16 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          ),
          title: 'Message Ready!',
          description: `Send the message to ${expertName} on your preferred platform.`,
          nextSteps: [
            'Share the message you copied on Instagram, Twitter, or DM',
            'They\'ll join QuickChat using your unique invitation link',
            'We\'ll email you when they view your question and send their answer'
          ]
        };
      default:
        return {
          icon: (
            <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Question Ready!',
          description: `Share your question with ${expertName}.`,
          nextSteps: [
            'Send them the message however you prefer',
            'They\'ll join QuickChat to see your question',
            'You\'ll be notified when they answer'
          ]
        };
    }
  };

  const methodInfo = getMethodInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
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
                {methodInfo.title}
              </h1>
              <p className="text-indigo-100">
                {methodInfo.description}
              </p>
            </div>

            <div className="p-8">
              <div className="flex justify-center mb-6">
                {methodInfo.icon}
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">What happens next?</h2>
                <div className="space-y-3">
                  {methodInfo.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">💡 Tip</p>
                    <p className="text-sm text-amber-700">
                      The sooner {expertName} joins, the faster you'll get your answer. Consider following up if you don't hear back within a few days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/invite"
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

export default InviteSentPage;