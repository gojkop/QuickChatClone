import React, { useState, useEffect } from 'react';

const FirstTimeUserTips = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has asked before
    const hasAskedBefore = localStorage.getItem('mindpick_asked_before');
    if (!hasAskedBefore) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('mindpick_asked_before', 'true');
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 mb-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-3xl">
          💡
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-blue-900 mb-3 text-lg">
            First time asking a question? Here's how to get the best answer:
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">✅</span>
              <span><strong>Keep it under 90 seconds total</strong> - Be concise and focused</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">✅</span>
              <span><strong>Show, don't just tell</strong> - Use video or screen share to demonstrate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">✅</span>
              <span><strong>Be specific</strong> - Explain exactly what you need help with</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">✅</span>
              <span><strong>Add context</strong> - Include relevant files or written details if helpful</span>
            </li>
          </ul>
          <button 
            onClick={handleDismiss}
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Got it, let's start!
          </button>
        </div>
        <button 
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FirstTimeUserTips;