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
  // COLLAPSED STATE (CTA BUTTON)
  // ============================================================================
  if (!isExpanded) {
    return (
      <div className="my-6">
        <div className="flex items-center gap-3">
          <MindPilotButton
            variant="secondary"
            size="md"
            icon={MINDPILOT_ICONS.SPARKLES}
            onClick={handleStartCoaching}
            disabled={!questionTitle?.trim()}
            className="flex-shrink-0"
          >
            Get mindPilot Feedback
          </MindPilotButton>
          
          <div className="flex items-center gap-2">
            <MindPilotIcon variant="lightbulb" size="sm" />
            <span className="text-xs text-slate-600">
              AI-powered question improvement (optional)
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EXPANDED PANEL
  // ============================================================================
  return (
    <div className="my-6">
      <MindPilotCard
        className="relative overflow-visible animate-slideDown"
      >
        {/* Header with branding */}
        <div className="absolute -top-3 left-6">
          <MindPilotBadge icon="sparkles">
            mindPilot Question Coach
          </MindPilotBadge>
        </div>

        {/* Close button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-lg transition"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        {/* Content */}
        <div className="mt-6">
          {/* ============================================================ */}
          {/* TIER 1 LOADING */}
          {/* ============================================================ */}
          {step === 'tier1-loading' && (
            <div className="text-center py-8">
              <MindPilotIcon 
                variant="brain" 
                size="xl" 
                className="animate-pulse mb-4" 
              />
              <p className="text-base font-semibold text-slate-100 mb-2">
                mindPilot is validating...
              </p>
              <p className="text-sm text-slate-400">This takes ~1 second</p>
            </div>
          )}

          {/* ============================================================ */}
          {/* TIER 1 FEEDBACK */}
          {/* ============================================================ */}
          {step === 'tier1-feedback' && tier1Result && (
            <div>
              <div className="flex items-start gap-3 mb-6">
                <MindPilotIcon variant="target" size="lg" />
                <div>
                  <h3 className="text-lg font-bold text-slate-50 mb-1">
                    Quick improvements suggested
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Clarity Score:</span>
                    <span className="font-bold text-slate-200">
                      {tier1Result.validation?.clarityScore || 0}/100
                    </span>
                  </div>
                </div>
              </div>

              <MindPilotProgress
                value={tier1Result.validation?.clarityScore || 0}
                label="Question Clarity"
                className="mb-6"
              />

              <div className="space-y-3 mb-6">
                {tier1Result.feedback.map((item, idx) => (
                  <MindPilotAlert
                    key={idx}
                    variant={item.severity === 'high' ? 'error' : 'warning'}
                    title={item.message}
                    description={item.suggestion}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <MindPilotButton
                  variant="ghost"
                  onClick={handleReset}
                  className="flex-1"
                >
                  I'll fix it
                </MindPilotButton>
                <MindPilotButton
                  variant="primary"
                  icon={MINDPILOT_ICONS.COMPASS}
                  onClick={proceedToTier2}
                  className="flex-1"
                >
                  Get Coaching Anyway
                </MindPilotButton>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TIER 2 LOADING */}
          {/* ============================================================ */}
          {step === 'tier2-loading' && (
            <div>
              <MindPilotAlert
                variant="success"
                title="Validation Complete"
                description="mindPilot is now analyzing your question"
                className="mb-6"
              />

              <div className="text-center py-8">
                <MindPilotIcon 
                  variant="sparkles" 
                  size="xl" 
                  className="animate-pulse mb-4" 
                />
                <p className="text-base font-semibold text-slate-100 mb-2">
                  AI is analyzing your question...
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  This takes 3-5 seconds
                </p>
                
                <MindPilotProgress 
                  value={60} 
                  className="max-w-xs mx-auto"
                  showPercentage={false}
                />
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
                <div className="flex items-center gap-2 mb-3">
                  <MindPilotIcon variant="brain" size="md" />
                  <h3 className="text-base font-bold text-slate-50">
                    mindPilot Analysis
                  </h3>
                </div>

                <MindPilotAlert
                  variant="info"
                  title={tier2Result.analysis?.summary}
                  className="mb-4"
                />

                <MindPilotProgress
                  value={tier2Result.analysis?.clarity || 0}
                  label="Question Clarity"
                />
              </div>

              {/* Clarifications */}
              {tier2Result.clarifications && tier2Result.clarifications.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MindPilotIcon variant="compass" size="md" />
                    <h4 className="text-sm font-bold text-slate-100">
                      mindPilot suggests clarifying:
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {tier2Result.clarifications.map((q) => (
                      <div 
                        key={q.id} 
                        className="bg-slate-900/60 border border-blue-500/30 rounded-xl p-4"
                      >
                        <label className="block mb-2">
                          <span className="text-sm font-semibold text-slate-100">
                            {q.question}
                          </span>
                          {q.optional && (
                            <span className="text-xs text-slate-500 ml-2">
                              (optional)
                            </span>
                          )}
                        </label>
                        <textarea
                          placeholder="Your answer..."
                          className="w-full p-3 bg-slate-800/60 border border-blue-500/30 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                          value={clarificationResponses[q.id] || ''}
                          onChange={(e) => setClarificationResponses(prev => ({
                            ...prev,
                            [q.id]: e.target.value
                          }))}
                        />
                        <div className="flex items-start gap-2 mt-2">
                          <MindPilotIcon variant="lightbulb" size="sm" />
                          <p className="text-xs text-slate-400">{q.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachment suggestions */}
              {tier2Result.attachmentSuggestions && 
               tier2Result.attachmentSuggestions.length > 0 && (
                <MindPilotAlert
                  variant="info"
                  icon="💡"
                  title="These attachments would help:"
                  description={
                    <ul className="mt-2 space-y-1">
                      {tier2Result.attachmentSuggestions.map((s, i) => (
                        <li key={i} className="text-sm">• {s}</li>
                      ))}
                    </ul>
                  }
                  className="mb-6"
                />
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <MindPilotButton
                  variant="ghost"
                  onClick={handleReset}
                >
                  Skip
                </MindPilotButton>
                <MindPilotButton
                  variant="primary"
                  icon={MINDPILOT_ICONS.SPARKLES}
                  onClick={handleApplyImprovements}
                  className="flex-1"
                >
                  Apply to Form
                </MindPilotButton>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* COMPLETED */}
          {/* ============================================================ */}
          {step === 'completed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <MindPilotIcon variant="star" size="lg" />
              </div>
              <h4 className="text-lg font-bold text-slate-50 mb-2">
                Improvements Applied!
              </h4>
              <p className="text-sm text-slate-400 mb-6">
                Your clarifications have been added to the context field
              </p>
              
              <MindPilotBadge icon="sparkles">
                Enhanced by mindPilot
              </MindPilotBadge>

              <div className="mt-6">
                <MindPilotButton
                  variant="ghost"
                  onClick={handleReset}
                >
                  Close
                </MindPilotButton>
              </div>
            </div>
          )}
        </div>
      </MindPilotCard>
    </div>
  );
};

export default MindPilotQuestionCoach;