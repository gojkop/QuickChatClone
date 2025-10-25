import React, { useState } from 'react';

export function QuestionCoachDialog({ 
  analysis, 
  clarifications,
  attachmentSuggestions,
  expertName,
  onComplete,
  onSkip
}) {
  const [responses, setResponses] = useState({});
  const [showClarifications, setShowClarifications] = useState(true);
  
  const handleResponse = (clarificationId, value) => {
    setResponses({
      ...responses,
      [clarificationId]: value
    });
  };
  
  const hasResponses = Object.keys(responses).some(key => responses[key]?.trim());
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">🤖</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          AI Question Coach
        </h2>
        <p className="text-sm text-gray-600">
          Help {expertName} give you the best answer
        </p>
      </div>

      {/* Clarity Score */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Question clarity:</span>
          <span className="text-sm font-bold text-gray-900">{analysis.clarity}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${analysis.clarity}%` }}
          />
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-indigo-900 uppercase mb-2">
          What we understand:
        </h3>
        <p className="text-sm text-gray-700">{analysis.summary}</p>
      </div>
      
      {/* Clarifying questions */}
      {clarifications && clarifications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Quick clarifications to improve your answer:
            </h3>
            <button
              onClick={() => setShowClarifications(!showClarifications)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showClarifications ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showClarifications && (
            <div className="space-y-4">
              {clarifications.map((c, index) => (
                <div key={c.id} className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <label className="block">
                        <span className="font-semibold text-sm text-gray-900">
                          {c.question}
                        </span>
                        {c.optional && (
                          <span className="text-xs text-gray-500 ml-2">(optional)</span>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-1 mb-2">
                        💡 {c.why}
                      </p>
                    </div>
                  </div>
                  <textarea
                    placeholder="Your answer..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                    rows={2}
                    value={responses[c.id] || ''}
                    onChange={(e) => handleResponse(c.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Attachment suggestions */}
      {attachmentSuggestions && attachmentSuggestions.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                💡 These attachments would help:
              </h3>
              <ul className="space-y-1">
                {attachmentSuggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                    <span className="text-yellow-600 flex-shrink-0">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => onComplete(responses)}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300"
        >
          {hasResponses ? 'Continue with Improvements' : 'Continue to Review'}
        </button>
        <button
          onClick={onSkip}
          className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Skip AI Coaching
        </button>
      </div>
      
      <p className="text-xs text-center text-gray-500">
        Your responses will be added to your question context to help the expert understand better.
      </p>
    </div>
  );
}