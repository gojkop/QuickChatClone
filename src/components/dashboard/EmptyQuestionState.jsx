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

  // Share button handlers
  const handleLinkedInShare = () => {
    const text = 'Ask me questions on mindPick!';
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleTwitterShare = () => {
    const text = 'Ask me questions on mindPick! 🧠';
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleEmailShare = () => {
    const subject = 'Ask me questions on mindPick';
    const body = `Hi,\n\nI'm now answering questions on mindPick. Got a question? Ask me here:\n\n${profileUrl}\n\nLooking forward to helping!`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Web Share API for mobile (with fallback)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ask me on mindPick',
          text: 'Ask me questions on mindPick!',
          url: profileUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  if (!expertProfile) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
      <div className="p-8 md:p-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">
            Ready to receive your first question?
          </h2>
          
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Share your personal link and start earning from your expertise
          </p>
        </div>

        {/* Profile Link Hero */}
        {profileUrl && isComplete ? (
          <div className="bg-white rounded-xl border-2 border-indigo-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Personal Link</p>
                <p className="text-sm md:text-base font-mono font-semibold text-indigo-600 truncate">
                  mindpick.me/u/{expertProfile.handle}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handlePreview}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-indigo-600 font-bold rounded-lg border-2 border-indigo-200 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">Preview</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Profile Completion Checklist */}
        {!isComplete && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Complete your profile to activate your link
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  You're {percentage}% ready to start receiving questions
                </p>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Checklist Items */}
                <div className="space-y-2">
                  {items.map(item => (
                    <button
                      key={item.key}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 bg-white hover:bg-amber-50 rounded-lg border border-amber-200 transition-all text-left group"
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        item.completed 
                          ? 'bg-green-500' 
                          : 'bg-gray-200 group-hover:bg-amber-200'
                      }`}>
                        {item.completed ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 group-hover:bg-amber-500 rounded-full transition-colors" />
                        )}
                      </div>
                      <span className={`flex-1 text-sm font-medium ${
                        item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {item.label}
                      </span>
                      {!item.completed && (
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Quick Share Actions */}
        {isComplete && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share your link
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* LinkedIn */}
              <button
                onClick={handleLinkedInShare}
                className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">LinkedIn</span>
              </button>

              {/* Twitter/X */}
              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-black hover:bg-opacity-5 border-2 border-gray-200 hover:border-black rounded-xl transition-all group"
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">Twitter</span>
              </button>

              {/* Email */}
              <button
                onClick={handleEmailShare}
                className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-400 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">Email</span>
              </button>

              {/* Mobile Share or Copy */}
              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 p-4 bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-400 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">More</span>
              </button>
            </div>
          </div>
        )}

        {/* Best Practices Section */}
        {isComplete && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Quick tips to get your first question
            </h3>
            
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span>Add your link to your <strong>LinkedIn profile headline</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span>Include it in your <strong>email signature</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span>Post about your expertise on <strong>Twitter/LinkedIn</strong> regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-0.5">•</span>
                <span>Share in relevant <strong>communities and forums</strong></span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyQuestionState;