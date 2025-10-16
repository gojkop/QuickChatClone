import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyQuestionState = ({ expertProfile }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  // Construct profile URL
  const profileUrl = expertProfile?.handle 
    ? `${window.location.origin}/u/${expertProfile.handle}`
    : '';

  // Profile completion logic
  const getProfileCompleteness = () => {
    if (!expertProfile) return { items: [], percentage: 0, isComplete: true };

    const items = [
      {
        key: 'handle',
        label: 'Handle claimed',
        completed: !!expertProfile.handle,
        action: () => navigate('#profile-settings')
      },
      {
        key: 'avatar',
        label: 'Profile photo added',
        completed: !!expertProfile.avatar_url,
        action: () => navigate('#profile-settings')
      },
      {
        key: 'price',
        label: 'Price set',
        completed: (expertProfile.price_cents > 0) || (expertProfile.priceUsd > 0),
        action: () => navigate('#profile-settings')
      },
      {
        key: 'sla',
        label: 'Response time commitment',
        completed: (expertProfile.sla_hours > 0) || (expertProfile.slaHours > 0),
        action: () => navigate('#profile-settings')
      },
      {
        key: 'bio',
        label: 'Bio written (50+ characters)',
        completed: !!expertProfile.bio && expertProfile.bio.trim().length >= 50,
        action: () => navigate('#profile-settings')
      },
      {
        key: 'public',
        label: 'Profile set to public',
        completed: expertProfile.isPublic === true || expertProfile.public === true,
        action: () => navigate('#profile-settings')
      },
      {
        key: 'accepting',
        label: 'Available to accept questions',
        completed: expertProfile.accepting_questions === true,
        action: () => navigate('#profile-settings')
      }
    ];

    const completedCount = items.filter(item => item.completed).length;
    const percentage = Math.round((completedCount / items.length) * 100);
    const isComplete = percentage === 100;

    return { items, percentage, isComplete };
  };

  const { items, percentage, isComplete } = getProfileCompleteness();

  // Auto-show checklist if profile incomplete
  useEffect(() => {
    if (!isComplete) {
      setShowChecklist(true);
    }
  }, [isComplete]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle preview
  const handlePreview = () => {
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  if (!expertProfile) return null;

  // Check if expert has answered questions before (for conditional messaging)
  const hasAnsweredBefore = expertProfile?.total_questions_answered > 0 || 
                             expertProfile?.answered_count > 0 ||
                             false; // Default to false if fields don't exist

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Hero Section - More Compact */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {hasAnsweredBefore 
              ? "Ready for more questions?" 
              : "Ready to receive your first question?"}
          </h2>
          
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            {hasAnsweredBefore
              ? "Share your link to keep growing your audience"
              : "Share your personal link and start earning from your expertise"}
          </p>
        </div>

        {/* Profile Link Hero - More Compact */}
        {profileUrl && isComplete ? (
          <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-0.5">Your Personal Link</p>
                <p className="text-sm font-mono font-semibold text-indigo-900 truncate">
                  mindpick.me/u/{expertProfile.handle}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handlePreview}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-indigo-600 font-semibold text-sm rounded-lg border border-indigo-200 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Profile Completion Checklist - More Compact */}
        {!isComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Complete your profile to activate your link
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  You're {percentage}% ready to start receiving questions
                </p>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Checklist Items - More Compact */}
                <div className="space-y-1.5">
                  {items.map(item => (
                    <button
                      key={item.key}
                      onClick={item.action}
                      className="w-full flex items-center gap-2.5 p-2 bg-white hover:bg-amber-50 rounded-md border border-amber-100 transition-all text-left group"
                    >
                      <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        item.completed 
                          ? 'bg-green-500' 
                          : 'bg-gray-200 group-hover:bg-amber-200'
                      }`}>
                        {item.completed ? (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-gray-400 group-hover:bg-amber-500 rounded-full transition-colors" />
                        )}
                      </div>
                      <span className={`flex-1 text-xs font-medium ${
                        item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {item.label}
                      </span>
                      {!item.completed && (
                        <svg className="w-3 h-3 text-gray-400 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Growth Strategy Section - Conditional Content */}
        {isComplete && (
          <div className="mb-5">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {hasAnsweredBefore ? "Keep growing your audience" : "Where to add your link"}
            </h3>
            
            {hasAnsweredBefore ? (
              // Experienced Expert Growth Strategy
              <div className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span><strong>Share insights</strong> from questions you've answered</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span><strong>Post about topics</strong> you frequently help with</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span><strong>Engage with your niche community</strong> on social media</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>Your mindPick link is in your <strong>bio/signature</strong></span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-purple-900 mb-1">Example Post:</p>
                      <p className="text-xs text-purple-800 italic">
                        "I've answered 10+ questions about [topic] this month. Common theme: [pattern]. 
                        Got similar challenges? Link in bio."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // New Expert Setup Guide
              <div className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-indigo-900 mb-3">Add your link permanently to:</p>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span><strong>LinkedIn headline</strong> (e.g., "Product Manager | Ask me questions on mindPick")</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span><strong>Email signature</strong> (add a line with your mindPick link)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span><strong>Twitter/X bio</strong> (include in your profile description)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span><strong>Personal website</strong> or portfolio (add a "Ask Me" section)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-amber-900 mb-1">Important:</p>
                      <p className="text-xs text-amber-800">
                        Don't spam your link. Share valuable content about your expertise and mention 
                        you take questions on mindPick when relevant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyQuestionState;