import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Minimalist AI Coach - Inline collapsible panel
 * Shows after title field, integrates with form
 */
export const InlineAICoach = ({ 
  questionTitle, 
  questionText,
  expertId,
  expertProfile,
  onApplySuggestions 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [step, setStep] = useState('idle'); 
  // Steps: idle, tier1-loading, tier1-feedback, tier2-loading, coaching, completed
  
  const [tier1Result, setTier1Result] = useState(null);
  const [tier2Result, setTier2Result] = useState(null);
  const [clarificationResponses, setClarificationResponses] = useState({});

  const handleStartCoaching = async () => {
    if (!questionTitle?.trim()) {
      alert('Please enter a question title first');
      return;
    }

    setIsExpanded(true);
    setStep('tier1-loading');

    try {
      // Call MOCK Tier 1 endpoint
      const response = await fetch('/api/ai/coach/quick-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: questionTitle,
          fingerprint: btoa(navigator.userAgent + Date.now()),
          expertId: expertId
        })
      });

      if (!response.ok) throw new Error('Validation failed');
      
      const validation = await response.json();
      setTier1Result(validation);

      // Check if has issues
      if (validation.feedback && validation.feedback.length > 0) {
        setStep('tier1-feedback');
      } else {
        // Passed Tier 1, auto-proceed to Tier 2
        await proceedToTier2();
      }

    } catch (error) {
      console.error('Tier 1 failed:', error);
      alert('Validation failed. Please try again.');
      setIsExpanded(false);
      setStep('idle');
    }
  };

  const proceedToTier2 = async () => {
    setStep('tier2-loading');

    try {
      // Call MOCK Tier 2 endpoint
      const response = await fetch('/api/ai/coach/analyze-and-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: tier1Result?.sessionId || `temp_${Date.now()}`,
          expertProfile: expertProfile,
          questionContext: {
            title: questionTitle,
            text: questionText
          }
        })
      });

      if (!response.ok) throw new Error('Coaching failed');
      
      const coaching = await response.json();
      setTier2Result(coaching);
      setStep('coaching');

    } catch (error) {
      console.error('Tier 2 failed:', error);
      alert('AI coaching failed. Please try again.');
      setIsExpanded(false);
      setStep('idle');
    }
  };

  const handleApplyImprovements = () => {
    // Build improved text from clarifications
    if (Object.keys(clarificationResponses).length > 0) {
      const clarificationText = Object.entries(clarificationResponses)
        .filter(([_, answer]) => answer?.trim())
        .map(([id, answer]) => {
          const clarification = tier2Result?.clarifications?.find(c => c.id === id);
          return `\n\n**${clarification?.question}**\n${answer}`;
        })
        .join('');

      // Apply to parent form
      onApplySuggestions({
        additionalContext: clarificationText
      });
    }

    setStep('completed');
  };

  const handleReset = () => {
    setIsExpanded(false);
    setStep('idle');
    setTier1Result(null);
    setTier2Result(null);
    setClarificationResponses({});
  };

  // Collapsed state
  if (!isExpanded) {
    return (
      <div className="my-4">
        <button
          onClick={handleStartCoaching}
          disabled={!questionTitle?.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Sparkles className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-gray-900">Get AI Feedback</span>
          <span className="text-xs text-gray-500">(optional)</span>
        </button>
      </div>
    );
  }

  // Expanded panel
  return (
    <div className="my-4 bg-white border-2 border-purple-300 rounded-xl shadow-lg overflow-hidden animate-slideDown">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="text-sm font-bold text-white">AI Question Coach</h3>
          {step === 'completed' && (
            <span className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
              ✓ Applied
            </span>
          )}
        </div>
        <button
          onClick={handleReset}
          className="p-1 hover:bg-white/20 rounded-lg transition"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tier 1 Loading */}
        {step === 'tier1-loading' && (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Validating your question...</p>
            <p className="text-xs text-gray-500 mt-1">This takes ~1 second</p>
          </div>
        )}

        {/* Tier 1 Feedback */}
        {step === 'tier1-feedback' && tier1Result && (
          <div>
            <div className="flex items-start gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Quick improvements suggested
                </h4>
                <p className="text-xs text-gray-600">
                  Clarity Score: {tier1Result.validation?.clarityScore || 0}/100
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {tier1Result.feedback.map((item, idx) => (
                <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-medium text-yellow-900">{item.message}</p>
                  {item.suggestion && (
                    <p className="text-xs text-yellow-700 mt-1">💡 {item.suggestion}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                I'll fix it
              </button>
              <button
                onClick={proceedToTier2}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition"
              >
                Get AI Help Anyway
              </button>
            </div>
          </div>
        )}

        {/* Tier 2 Loading */}
        {step === 'tier2-loading' && (
          <div>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-800">Question validated! Analyzing...</p>
            </div>

            <div className="text-center py-6">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-medium text-gray-700">AI is analyzing your question...</p>
              <p className="text-xs text-gray-500 mt-1">This takes 3-5 seconds</p>
              
              <div className="mt-4 max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
                <div className="bg-purple-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Coaching Dialog */}
        {step === 'coaching' && tier2Result && (
          <div>
            {/* Summary */}
            <div className="mb-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                <p className="text-xs text-gray-700">{tier2Result.analysis?.summary}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Clarity:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[150px]">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${tier2Result.analysis?.clarity || 0}%` }}
                  />
                </div>
                <span className="font-medium">{tier2Result.analysis?.clarity || 0}/100</span>
              </div>
            </div>

            {/* Clarifications */}
            {tier2Result.clarifications && tier2Result.clarifications.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-900 mb-2">
                  Help the expert understand better:
                </h4>
                
                <div className="space-y-3">
                  {tier2Result.clarifications.map((q) => (
                    <div key={q.id} className="border border-gray-200 rounded-lg p-3">
                      <label className="block mb-2">
                        <span className="text-xs font-medium text-gray-900">{q.question}</span>
                        {q.optional && (
                          <span className="text-xs text-gray-500 ml-1">(optional)</span>
                        )}
                      </label>
                      <textarea
                        placeholder="Your answer..."
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        rows={2}
                        value={clarificationResponses[q.id] || ''}
                        onChange={(e) => setClarificationResponses(prev => ({
                          ...prev,
                          [q.id]: e.target.value
                        }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">💡 {q.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachment suggestions */}
            {tier2Result.attachmentSuggestions && tier2Result.attachmentSuggestions.length > 0 && (
              <div className="mb-4 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                <h4 className="text-xs font-semibold text-yellow-900 mb-1">💡 Would help:</h4>
                <ul className="list-disc list-inside text-xs space-y-0.5 text-yellow-800">
                  {tier2Result.attachmentSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Skip
              </button>
              <button
                onClick={handleApplyImprovements}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition"
              >
                Apply to Form
              </button>
            </div>
          </div>
        )}

        {/* Completed */}
        {step === 'completed' && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Improvements Applied!
            </h4>
            <p className="text-xs text-gray-600 mb-4">
              Your clarifications have been added to the context field
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineAICoach;