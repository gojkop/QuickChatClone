import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { MindPilotButton } from '@/components/mindpilot/MindPilotButton';
import { MindPilotCard } from '@/components/mindpilot/MindPilotCard';
import { MindPilotAlert } from '@/components/mindpilot/MindPilotAlert';
import { MindPilotIcon } from '@/components/mindpilot/MindPilotIcon';
import { MindPilotBadge } from '@/components/mindpilot/MindPilotBadge';
import { MindPilotProgress } from '@/components/mindpilot/MindPilotProgress';
import { MINDPILOT_ICONS } from '@/components/mindpilot/index';

/**
 * mindPilot Question Coach - Inline collapsible AI guidance
 * Helps users improve questions before submission
 */
export const MindPilotQuestionCoach = ({ 
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

      if (validation.feedback && validation.feedback.length > 0) {
        setStep('tier1-feedback');
      } else {
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
      alert('mindPilot coaching failed. Please try again.');
      setIsExpanded(false);
      setStep('idle');
    }
  };

  const handleApplyImprovements = () => {
    if (Object.keys(clarificationResponses).length > 0) {
      const clarificationText = Object.entries(clarificationResponses)
        .filter(([_, answer]) => answer?.trim())
        .map(([id, answer]) => {
          const clarification = tier2Result?.clarifications?.find(c => c.id === id);
          return `\n\n**${clarification?.question}**\n${answer}`;
        })
        .join('');

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

  // ============================================================================
  // COLLAPSED STATE (CTA BUTTON) - MATCHED TO PAGE STYLE
  // ============================================================================
  if (!isExpanded) {
    return (
      <div className="my-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          {/* Animated AI Button - sized to match page buttons */}
          <button
            onClick={handleStartCoaching}
            disabled={!questionTitle?.trim()}
            className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 bg-blue-400/20 rounded-lg blur-lg group-hover:bg-blue-400/40 transition-all duration-500"></div>
            
            {/* Animated sparkles icon */}
            <span className="relative text-lg animate-pulse group-hover:scale-110 transition-transform duration-300">
              ✨
            </span>
            
            <span className="relative font-semibold">Get mindPilot Feedback</span>
            
            {/* Subtle dot animation */}
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
          </button>
          
          {/* Helper text - responsive and compact */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="hidden sm:inline">💡</span>
            <span className="sm:hidden">AI • Optional</span>
            <span className="hidden sm:inline">AI-powered (optional)</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EXPANDED PANEL - MATCHED TO PAGE STYLE
  // ============================================================================
  return (
    <div className="my-4">
      {/* Card sized to match existing components */}
      <div className="bg-white border-2 border-indigo-200 rounded-xl shadow-sm overflow-hidden animate-slideDown">
        {/* Header - compact */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-pulse">✨</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">mindPilot Question Coach</h3>
                <p className="text-xs text-gray-600">AI-powered guidance</p>
              </div>
            </div>
            {step === 'completed' && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                ✓ Applied
              </span>
            )}
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-white/50 rounded-lg transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content - matched padding */}
        <div className="p-4 sm:p-5 bg-white">
          {/* ============================================================ */}
          {/* TIER 1 LOADING */}
          {/* ============================================================ */}
          {step === 'tier1-loading' && (
            <div className="text-center py-8">
              <div className="relative inline-block mb-3">
                <span className="text-4xl animate-pulse">🧠</span>
                <div className="absolute inset-0 animate-ping">
                  <span className="text-4xl opacity-20">🧠</span>
                </div>
              </div>
              <p className="text-base font-semibold text-gray-900 mb-1">
                Analyzing your question...
              </p>
              <p className="text-xs text-gray-600">This takes ~1 second</p>
            </div>
          )}

          {/* ============================================================ */}
          {/* TIER 1 FEEDBACK */}
          {/* ============================================================ */}
          {step === 'tier1-feedback' && tier1Result && (
            <div>
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Quick improvements suggested
                  </h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-gray-700">Clarity Score:</span>
                    <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${tier1Result.validation?.clarityScore || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {tier1Result.validation?.clarityScore || 0}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {tier1Result.feedback.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      item.severity === 'high' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-900 mb-0.5">
                      {item.message}
                    </p>
                    {item.suggestion && (
                      <p className="text-xs text-gray-700">
                        💡 {item.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  I'll fix it
                </button>
                <button
                  onClick={proceedToTier2}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-lg hover:shadow-md transition"
                >
                  Get Coaching Anyway
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TIER 2 LOADING */}
          {/* ============================================================ */}
          {step === 'tier2-loading' && (
            <div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4 flex items-center gap-2">
                <span className="text-lg">✓</span>
                <div>
                  <p className="text-xs font-semibold text-green-900">Validation Complete</p>
                  <p className="text-xs text-green-700">mindPilot is analyzing your question</p>
                </div>
              </div>

              <div className="text-center py-8">
                <div className="relative inline-block mb-3">
                  <span className="text-4xl animate-pulse">✨</span>
                  <div className="absolute inset-0 animate-ping">
                    <span className="text-4xl opacity-20">✨</span>
                  </div>
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">
                  AI is analyzing your question...
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  This takes 3-5 seconds
                </p>
                
                <div className="max-w-xs mx-auto bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* COACHING DIALOG */}
          {/* ============================================================ */}
          {step === 'coaching' && tier2Result && (
            <div>
              {/* Summary */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🧠</span>
                  <h4 className="text-sm font-semibold text-gray-900">
                    mindPilot Analysis
                  </h4>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                  <p className="text-sm text-gray-800">
                    {tier2Result.analysis?.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-700">Question Clarity:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${tier2Result.analysis?.clarity || 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {tier2Result.analysis?.clarity || 0}/100
                  </span>
                </div>
              </div>

              {/* Clarifications */}
              {tier2Result.clarifications && tier2Result.clarifications.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🧭</span>
                    <h4 className="text-sm font-semibold text-gray-900">
                      mindPilot suggests clarifying:
                    </h4>
                  </div>
                  
                  <div className="space-y-3">
                    {tier2Result.clarifications.map((q) => (
                      <div 
                        key={q.id} 
                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <label className="block mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {q.question}
                          </span>
                          {q.optional && (
                            <span className="text-xs text-gray-500 ml-1">
                              (optional)
                            </span>
                          )}
                        </label>
                        <textarea
                          placeholder="Your answer..."
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                          rows={2}
                          value={clarificationResponses[q.id] || ''}
                          onChange={(e) => setClarificationResponses(prev => ({
                            ...prev,
                            [q.id]: e.target.value
                          }))}
                        />
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <span className="text-sm">💡</span>
                          <p className="text-xs text-gray-600">{q.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachment suggestions */}
              {tier2Result.attachmentSuggestions && 
               tier2Result.attachmentSuggestions.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <div>
                      <h4 className="text-xs font-semibold text-yellow-900 mb-1">
                        These attachments would help:
                      </h4>
                      <ul className="space-y-0.5">
                        {tier2Result.attachmentSuggestions.map((s, i) => (
                          <li key={i} className="text-xs text-yellow-800">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleApplyImprovements}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-lg hover:shadow-md transition"
                >
                  Apply to Form
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* COMPLETED */}
          {/* ============================================================ */}
          {step === 'completed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">⭐</span>
              </div>
              <h4 className="text-base font-semibold text-gray-900 mb-2">
                Improvements Applied!
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Your clarifications have been added to the context field
              </p>
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <span className="text-base">✨</span>
                <span className="text-xs font-semibold text-indigo-900">Enhanced by mindPilot</span>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindPilotQuestionCoach;