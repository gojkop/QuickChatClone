import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Circle, Sparkles, Copy, Check } from 'lucide-react';
import {
  calculateProfileStrength,
  getEfficiencyLevel,
  getProgressBarColor,
  generateChecklist,
  getMotivationalMessage
} from '@/utils/profileStrength';

function ProfileCompletionCard({ expertProfile, onDismiss, onCompleteSetup }) {
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);

  const profileStrength = calculateProfileStrength(expertProfile);
  const efficiencyLevel = getEfficiencyLevel(profileStrength);
  const progressBarColor = getProgressBarColor(profileStrength);
  const checklist = generateChecklist(expertProfile);
  const motivationalMessage = getMotivationalMessage(profileStrength);

  const handleActionClick = (item) => {
    if (item.id === 'setup') {
      // Trigger onboarding modal
      if (onCompleteSetup) {
        onCompleteSetup();
      }
    } else if (item.id === 'share') {
      // Copy profile link
      const profileUrl = `https://mindpick.me/u/${expertProfile.handle}`;
      navigator.clipboard.writeText(profileUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } else if (item.route) {
      // Navigate to route
      navigate(item.route);
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(false); // Temporary dismiss
    }
  };

  const handleDismissPermanently = () => {
    if (onDismiss) {
      onDismiss(true); // Permanent dismiss
    }
  };

  // Group checklist items by category
  const quickWins = checklist.filter(item => item.category === 'quick-win');
  const standOut = checklist.filter(item => item.category === 'stand-out');
  const essential = checklist.filter(item => item.category === 'essential');

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Complete Your Profile</h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Strength Meter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Profile Strength</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${efficiencyLevel.bgColor} ${efficiencyLevel.borderColor} border`}>
            <span className="text-lg">{efficiencyLevel.emoji}</span>
            <span className={`text-xs font-semibold ${efficiencyLevel.textColor}`}>
              {efficiencyLevel.label}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${progressBarColor} transition-all duration-500 ease-out`}
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-right">
              {profileStrength}%
            </span>
          </div>
        </div>
      </div>

      {/* Essential Setup (if incomplete) */}
      {essential.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">
            ⚠️ Required Setup
          </h4>
          {essential.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onActionClick={handleActionClick}
              linkCopied={linkCopied && item.id === 'share'}
            />
          ))}
        </div>
      )}

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
            Quick Wins ({quickWins.reduce((sum, item) => {
              const time = parseInt(item.timeEstimate);
              return sum + (isNaN(time) ? 0 : time);
            }, 0)} min total)
          </h4>
          {quickWins.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onActionClick={handleActionClick}
              linkCopied={linkCopied && item.id === 'share'}
            />
          ))}
        </div>
      )}

      {/* Stand Out (Progressive Disclosure) */}
      {standOut.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
            Stand Out ({standOut.reduce((sum, item) => {
              const time = parseInt(item.timeEstimate);
              return sum + (isNaN(time) ? 0 : time);
            }, 0)} min total)
          </h4>
          {standOut.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onActionClick={handleActionClick}
              linkCopied={linkCopied && item.id === 'share'}
            />
          ))}
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-6 pt-4 border-t border-indigo-200">
        <p className="text-sm text-gray-600 text-center">
          {motivationalMessage}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <button
          onClick={handleDismissPermanently}
          className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          Don't show again
        </button>
        <button
          onClick={handleDismiss}
          className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
        >
          Remind me later
        </button>
      </div>
    </div>
  );
}

function ChecklistItem({ item, onActionClick, linkCopied }) {
  return (
    <div className="flex items-start gap-3 py-2 group">
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-0.5">
        {item.completed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`text-sm font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {item.label}
            </p>
            {item.description && (
              <p className="text-xs text-gray-500 mt-0.5">
                {item.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {item.impact && (
                <span className="text-xs font-semibold text-indigo-600">
                  {item.impact}
                </span>
              )}
              {item.timeEstimate && (
                <span className="text-xs text-gray-400">
                  • {item.timeEstimate}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          {!item.completed && (
            <button
              onClick={() => onActionClick(item)}
              className="flex-shrink-0 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-300 text-indigo-700 text-xs font-semibold rounded-lg transition-all hover:border-indigo-400 hover:shadow-sm flex items-center gap-1"
            >
              {item.id === 'share' && linkCopied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied!
                </>
              ) : item.id === 'share' ? (
                <>
                  <Copy className="w-3 h-3" />
                  {item.action}
                </>
              ) : (
                item.action
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileCompletionCard;
