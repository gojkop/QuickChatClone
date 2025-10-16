import React, { useState } from 'react';
import { copyWithFallback } from '@/utils/shareHelpers';

export default function CampaignCard({ campaign, onArchive, onViewDetails }) {
  const [showCopied, setShowCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopyUrl = async () => {
    const success = await copyWithFallback(campaign.url);
    if (success) {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const getConversionBadgeColor = (rate) => {
    if (rate >= 5) return 'bg-green-100 text-green-700 border-green-200';
    if (rate >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getPerformanceBadge = () => {
    // Top performer if in top 20% by revenue
    if (campaign.isTopPerformer) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200">
          ⭐ Top Performer
        </span>
      );
    }
    
    // Needs attention if conversion rate is low
    if (campaign.conversion_rate < 2 && campaign.total_visits > 10) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-red-50 text-red-700 border border-red-200">
          ⚠️ Needs Attention
        </span>
      );
    }
    
    return null;
  };

  const getSourceIcon = (source) => {
    const icons = {
      linkedin: '💼',
      twitter: '🐦',
      email: '📧',
      instagram: '📸',
      youtube: '🎥',
      facebook: '👥',
    };
    return icons[source.toLowerCase()] || '🔗';
  };

  return (
    <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 hover:shadow-elev-3 transition-all duration-base overflow-hidden group">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-elev-1">
              {getSourceIcon(campaign.utm_source)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-ink mb-1 truncate">{campaign.name}</h4>
              <p className="text-sm text-subtext font-medium capitalize">
                {campaign.utm_source} • {campaign.utm_campaign}
              </p>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-subtext hover:text-ink hover:bg-canvas rounded-lg transition-colors duration-fast"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-elev-4 border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onViewDetails(campaign);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-ink hover:bg-canvas transition-colors duration-fast"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    onArchive(campaign);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-error hover:bg-red-50 transition-colors duration-fast"
                >
                  Archive Campaign
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Performance Badge */}
        <div className="mt-3 flex gap-2">
          {getPerformanceBadge()}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${getConversionBadgeColor(campaign.conversion_rate)}`}>
            {campaign.conversion_rate}% conversion
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 sm:p-6 bg-canvas">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-bold text-subtext uppercase tracking-wide mb-1">Visits</p>
            <p className="text-2xl font-black text-ink">{campaign.total_visits}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-subtext uppercase tracking-wide mb-1">Questions</p>
            <p className="text-2xl font-black text-ink">{campaign.total_questions}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-subtext uppercase tracking-wide mb-1">Revenue</p>
            <p className="text-2xl font-black text-ink">€{campaign.total_revenue}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3">
        <button
          onClick={handleCopyUrl}
          className="btn btn-primary flex-1 px-4 py-2.5 text-sm gap-2"
        >
          {showCopied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>

        <button
          onClick={() => onViewDetails(campaign)}
          className="btn btn-secondary px-4 py-2.5 text-sm whitespace-nowrap"
        >
          View Stats
        </button>
      </div>

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}