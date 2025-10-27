// src/components/dashboardv2/overview/RecentActivity.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, Eye, MessageCircle, Star, Zap, User, Share2, TrendingUp, Copy, Mail, Linkedin } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { calculateProfileStrength } from '@/utils/profileStrength';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';
import { useToast } from '@/components/common/Toast';

function RecentActivity({ questions = [] }) {
  const navigate = useNavigate();
  const { expertProfile } = useProfile();
  const { showToast } = useToast();
  const [hoveredQuestion, setHoveredQuestion] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const recentQuestions = questions
    .filter(q => {
      // Include paid questions that aren't answered
      if (q.status === 'paid' && !q.answered_at) return true;
      // Include pending offers that aren't answered
      if ((q.status === 'pending_offer' || q.is_pending_offer) && !q.answered_at) return true;
      return false;
    })
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 5);

  // Calculate profile completion
  const profileStrength = calculateProfileStrength(expertProfile);
  const isProfileComplete = profileStrength >= 80;

  const getTimeLeft = (question) => {
    if (!question.sla_hours_snapshot || question.sla_hours_snapshot <= 0) {
      return null;
    }

    const now = Date.now() / 1000;
    const createdAtSeconds = question.created_at > 4102444800
      ? question.created_at / 1000
      : question.created_at;

    const elapsed = now - createdAtSeconds;
    const slaSeconds = question.sla_hours_snapshot * 3600;
    const remaining = slaSeconds - elapsed;

    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return { text: `${days}d ${remainingHours}h`, hours };
    }
    if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, hours };
    }
    return { text: `${minutes}m`, hours: 0 };
  };

  const getTimeUrgencyColor = (hours) => {
    if (hours < 6) return 'text-red-600';
    if (hours < 12) return 'text-orange-600';
    return 'text-blue-600';
  };

  const isPendingOffer = (question) => {
    return question.is_pending_offer || question.status === 'pending_offer';
  };

  const isDeepDive = (question) => {
    return question.question_tier === 'deep_dive';
  };

  const getQuestionType = (question) => {
    if (isPendingOffer(question)) return 'pending_offer';
    if (isDeepDive(question)) return 'accepted_deep_dive';
    return 'quick';
  };

  const handleCopyLink = () => {
    const profileUrl = `https://mindpick.me/u/${expertProfile.handle}`;
    navigator.clipboard.writeText(profileUrl);
    showToast('Profile link copied to clipboard!');
  };

  const handleEmailSignature = () => {
    const profileUrl = `https://mindpick.me/u/${expertProfile.handle}`;
    const signatureText = `\n\n---\nBook time with me: ${profileUrl}`;
    navigator.clipboard.writeText(signatureText);
    showToast('Email signature copied! Paste into your email settings.');
  };

  const handleLinkedInShare = () => {
    const profileUrl = `https://mindpick.me/u/${expertProfile.handle}`;
    const text = `I'm now available for quick consultations on mindPick. Book time with me here:`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank');
  };

  if (recentQuestions.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900">Recent Questions</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center mb-3">
            <MessageSquare className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-gray-700 mb-2 text-sm">
            Your inbox is ready
          </p>

          {/* Conditional CTA based on profile completion */}
          {!isProfileComplete ? (
            <>
              <p className="text-xs text-gray-600 mb-4 max-w-[200px]">
                Complete your profile to start receiving questions
              </p>
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Complete Profile →
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-600 mb-3 max-w-[200px]">
                Share your link to get your first question
              </p>

              {!showShareOptions ? (
                <button
                  onClick={() => setShowShareOptions(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors flex items-center gap-1 mx-auto"
                >
                  <Share2 className="w-3 h-3" />
                  Show Share Options
                </button>
              ) : (
                <div className="space-y-2 w-full max-w-[220px] mx-auto">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Copy className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">Copy Link</p>
                      <p className="text-[10px] text-gray-600">Share anywhere</p>
                    </div>
                  </button>

                  <button
                    onClick={handleLinkedInShare}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">Post on LinkedIn</p>
                      <p className="text-[10px] text-gray-600">Professional network</p>
                    </div>
                  </button>

                  <button
                    onClick={handleEmailSignature}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left group"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">Email Signature</p>
                      <p className="text-[10px] text-gray-600">Add to your emails</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowShareOptions(false)}
                    className="w-full text-[10px] text-gray-500 hover:text-gray-700 transition-colors py-1"
                  >
                    Hide options
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900">Recent Questions</h2>
        <span className="text-xs text-gray-500 font-medium">
          {recentQuestions.length} pending
        </span>
      </div>
      
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {recentQuestions.map((question) => {
          const questionType = getQuestionType(question);
          const timeLeft = getTimeLeft(question);

          // Visual config based on question type
          const typeConfig = {
            pending_offer: {
              borderColor: 'border-l-orange-400 hover:border-orange-300',
              bgGradient: 'bg-gradient-to-br from-orange-100 to-amber-100',
              textColor: 'text-orange-700',
              badgeBg: 'bg-gradient-to-r from-orange-100 to-amber-100',
              badgeText: 'text-orange-700',
              badgeBorder: 'border-orange-200',
              icon: Star,
              label: 'Pending Offer'
            },
            accepted_deep_dive: {
              borderColor: 'border-l-purple-400 hover:border-purple-300',
              bgGradient: 'bg-gradient-to-br from-purple-100 to-indigo-100',
              textColor: 'text-purple-700',
              badgeBg: 'bg-gradient-to-r from-purple-100 to-indigo-100',
              badgeText: 'text-purple-700',
              badgeBorder: 'border-purple-200',
              icon: Star,
              label: 'Deep Dive'
            },
            quick: {
              borderColor: 'border-l-transparent hover:border-indigo-300',
              bgGradient: 'bg-gradient-to-br from-blue-100 to-cyan-100',
              textColor: 'text-blue-700',
              badgeBg: 'bg-blue-50',
              badgeText: 'text-blue-700',
              badgeBorder: 'border-blue-200',
              icon: Zap,
              label: 'Quick'
            }
          };

          const config = typeConfig[questionType];
          const IconComponent = config.icon;

          return (
            <div
              key={question.id}
              className={`
                group relative p-2 border border-l-[3px] rounded-lg hover:shadow-md transition-all cursor-pointer
                ${config.borderColor}
                border-gray-200
              `}
              onMouseEnter={() => setHoveredQuestion(question.id)}
              onMouseLeave={() => setHoveredQuestion(null)}
              onClick={() => {
                // For pending offers, navigate to inbox (they need to be accepted first)
                if (questionType === 'pending_offer') {
                  navigate('/dashboard/inbox');
                } else {
                  navigate(`/dashboard/inbox#question-${question.id}`);
                }
              }}
            >
              <div className="flex items-start gap-2">
                {/* Type Icon */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${config.bgGradient} ${config.textColor}`}>
                  <IconComponent size={14} fill={questionType === 'pending_offer' ? 'currentColor' : 'none'} />
                </div>

                {/* Content - COMPACT */}
                <div className="flex-1 min-w-0">
                  {/* Type Badge + Question Title */}
                  <div className="flex items-start gap-1.5 mb-0.5">
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 ${config.badgeBg} ${config.badgeText} border ${config.badgeBorder} rounded text-[10px] font-bold flex-shrink-0`}>
                      <IconComponent size={8} fill={questionType === 'pending_offer' ? 'currentColor' : 'none'} />
                      <span>{config.label}</span>
                    </span>
                    <p className="text-xs text-gray-700 line-clamp-1 flex-1 min-w-0">
                      {question.title || question.question_text || question.text || 'Untitled Question'}
                    </p>
                  </div>

                  {/* Name + Email */}
                  <div className="flex items-center gap-1 text-[11px] text-gray-600 mb-1">
                    <User size={10} className="text-gray-400 flex-shrink-0" />
                    {question.user_name && (
                      <span className="font-medium truncate">{question.user_name}</span>
                    )}
                    {question.user_email && (
                      <>
                        <span className="text-gray-400">·</span>
                        <a
                          href={`mailto:${question.user_email}`}
                          className="text-indigo-600 hover:text-indigo-700 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {question.user_email}
                        </a>
                      </>
                    )}
                  </div>

                  {/* Price + Time Left */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 font-bold border border-green-200">
                      {formatCurrency(question.price_cents)}
                    </span>
                    {timeLeft && (
                      <span className={`flex items-center gap-0.5 font-semibold ${getTimeUrgencyColor(timeLeft.hours)}`}>
                        <Clock size={10} />
                        {timeLeft.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions - COMPACT */}
              {hoveredQuestion === question.id && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 animate-fadeInScale">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (questionType === 'pending_offer') {
                        navigate('/dashboard/inbox');
                      } else {
                        navigate(`/dashboard/inbox#question-${question.id}`);
                      }
                    }}
                    className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-lg transition-colors"
                    title="View details"
                  >
                    <Eye size={12} />
                  </button>
                  {questionType !== 'pending_offer' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/inbox#question-${question.id}/answer`);
                      }}
                      className="p-1 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg transition-colors"
                      title="Answer now"
                    >
                      <MessageCircle size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/dashboard/inbox')}
        className="mt-2 w-full py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
      >
        View All Questions →
      </button>
    </div>
  );
}

export default RecentActivity;