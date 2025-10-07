import React from 'react';

export function ValidationFeedback({ 
  feedback, 
  clarityScore, 
  onRetry, 
  onContinue, 
  onRequestCoaching 
}) {
  const hasIssues = feedback && feedback.length > 0;
  const hasCriticalIssues = feedback?.some(f => f.severity === 'high');

  return (
    <div className="space-y-4">
      {/* Clarity Score */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Question Clarity</span>
          <span className="text-sm font-bold text-gray-900">{clarityScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              clarityScore >= 70 ? 'bg-green-500' :
              clarityScore >= 40 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${clarityScore}%` }}
          />
        </div>
      </div>

      {/* Feedback Items */}
      {hasIssues && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Suggestions to improve your question:</h3>
          
          {feedback.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                item.severity === 'high' 
                  ? 'bg-red-50 border-red-500'
                  : item.severity === 'medium'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {item.severity === 'high' && (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {item.severity === 'medium' && (
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {item.severity === 'low' && (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {item.message}
                  </p>
                  {item.suggestion && (
                    <p className="text-xs text-gray-600">
                      💡 {item.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Coaching Option - ✅ ALWAYS SHOW (removed condition) */}
      {!hasCriticalIssues && (
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border-2 border-indigo-200 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-900 mb-1">
                {clarityScore >= 80 
                  ? 'Want even more specific guidance?' 
                  : 'Want help making this even better?'}
              </h3>
              <p className="text-xs text-indigo-700">
                Our AI coach can analyze your question and suggest specific clarifications that will help the expert give you the best possible answer.
              </p>
            </div>
          </div>
          <button
            onClick={onRequestCoaching}
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Get AI Coaching (Free)
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Edit Question
        </button>
        
        {!hasCriticalIssues && (
          <button
            onClick={onContinue}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
          >
            Continue Anyway
          </button>
        )}
      </div>

      {hasCriticalIssues && (
        <p className="text-xs text-center text-gray-600">
          Please address the critical issues above before continuing
        </p>
      )}
    </div>
  );
}