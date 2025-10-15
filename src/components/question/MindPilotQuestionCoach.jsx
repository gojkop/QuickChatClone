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
  // COLLAPSED STATE (CTA BUTTON) - UPDATED WITH ANIMATIONS
  // ============================================================================
  if (!isExpanded) {
    return (
      <div className="my-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Animated AI Button */}
          <button
            onClick={handleStartCoaching}
            disabled={!questionTitle?.trim()}
            className="group relative inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-xl group-hover:bg-blue-400/40 transition-all duration-500"></div>
            
            {/* Animated sparkles icon */}
            <span className="relative text-2xl animate-pulse group-hover:scale-110 transition-transform duration-300">
              ✨
            </span>
            
            <span className="relative font-bold">Get mindPilot Feedback</span>
            
            {/* Subtle dot animation */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </button>
          
          {/* Helper text - responsive */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="hidden sm:inline">💡</span>
            <span className="sm:hidden">AI-powered • Optional</span>
            <span className="hidden sm:inline">AI-powered improvement (optional)</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EXPANDED PANEL - UPDATED WITH LIGHT, CLEAN DESIGN
  // ============================================================================
  return (
    <div className="my-6">
      {/* Clean white card with subtle shadow */}
      <div className="bg-white border-2 border-indigo-200 rounded-2xl shadow-xl overflow-hidden animate-slideDown">
        {/* Header - Clean gradient */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">✨</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">mindPilot Question Coach</h3>
                <p className="text-xs text-gray-600">AI-powered guidance</p>
              </div>
            </div>
            {step === 'completed' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                ✓ Applied
              </span>
            )}
            <button
              onClick={handleReset}
              className="p-2 hover:bg-white/50 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content - Light background */}
        <div className="p-6 bg-white">
          {/* ============================================================ */}
          {/* TIER 1 LOADING */}
          {/* ============================================================ */}
          {step === 'tier1-loading' && (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <span className="text-5xl animate-pulse">🧠</span>
                <div className="absolute inset-0 animate-ping">
                  <span className="text-5xl opacity-20">🧠</span>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Analyzing your question...
              </p>
              <p className="text-sm text-gray-600">This takes ~1 second</p>
            </div>
          )}

          {/* ============================================================ */}
          {/* TIER 1 FEEDBACK */}
          {/* ============================================================ */}
          {step === 'tier1-feedback' && tier1Result && (
            <div>
              <div className="flex items-start gap-4 mb-6">
                <span className="text-3xl">🎯</span>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Quick improvements suggested
                  </h4>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700">Clarity Score:</span>
                    <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${tier1Result.validation?.clarityScore || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {tier1Result.validation?.clarityScore || 0}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {tier1Result.feedback.map((item, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${
                      item.severity === 'high' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 mb-1">
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

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  I'll fix it
                </button>
                <button
                  onClick={proceedToTier2}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg transition"
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
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-6 flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="text-sm font-bold text-green-900">Validation Complete</p>
                  <p className="text-xs text-green-700">mindPilot is now analyzing your question</p>
                </div>
              </div>

              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <span className="text-5xl animate-pulse">✨</span>
                  <div className="absolute inset-0 animate-ping">
                    <span className="text-5xl opacity-20">✨</span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  AI is analyzing your question...
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  This takes 3-5 seconds
                </p>
                
                <div className="max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
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
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🧠</span>
                  <h4 className="text-base font-bold text-gray-900">
                    mindPilot Analysis
                  </h4>
                </div>

                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
                  <p className="text-sm text-gray-800">
                    {tier2Result.analysis?.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-700">Question Clarity:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${tier2Result.analysis?.clarity || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {tier2Result.analysis?.clarity || 0}/100
                  </span>
                </div>
              </div>

              {/* Clarifications */}
              {tier2Result.clarifications && tier2Result.clarifications.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🧭</span>
                    <h4 className="text-sm font-bold text-gray-900">
                      mindPilot suggests clarifying:
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {tier2Result.clarifications.map((q) => (
                      <div 
                        key={q.id} 
                        className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl"
                      >
                        <label className="block mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {q.question}
                          </span>
                          {q.optional && (
                            <span className="text-xs text-gray-500 ml-2">
                              (optional)
                            </span>
                          )}
                        </label>
                        <textarea
                          placeholder="Your answer..."
                          className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                          value={clarificationResponses[q.id] || ''}
                          onChange={(e) => setClarificationResponses(prev => ({
                            ...prev,
                            [q.id]: e.target.value
                          }))}
                        />
                        <div className="flex items-start gap-2 mt-2">
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
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <h4 className="text-sm font-bold text-yellow-900 mb-2">
                        These attachments would help:
                      </h4>
                      <ul className="space-y-1">
                        {tier2Result.attachmentSuggestions.map((s, i) => (
                          <li key={i} className="text-sm text-yellow-800">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleApplyImprovements}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg transition"
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
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⭐</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Improvements Applied!
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                Your clarifications have been added to the context field
              </p>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <span className="text-lg">✨</span>
                <span className="text-sm font-bold text-indigo-900">Enhanced by mindPilot</span>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
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