import React, { useState } from 'react';
import { copyWithFallback } from '@/utils/shareHelpers';

export default function CampaignDetailsModal({ campaign, isOpen, onClose, onEdit, onArchive, onPause }) {
  const [showCopied, setShowCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !campaign) return null;

  const handleCopyUrl = async () => {
    const success = await copyWithFallback(campaign.url);
    if (success) {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const avgRevenuePerQuestion = campaign.total_questions > 0 
    ? (campaign.total_revenue / campaign.total_questions).toFixed(2)
    : '0.00';

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || colors.active;
  };

  const getSourceIcon = (source) => {
    // Reuse the same icon logic from CampaignCard
    const icons = {
      linkedin: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      twitter: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    };
    return icons[source.toLowerCase()] || (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="bg-surface rounded-xl shadow-elev-4 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    {getSourceIcon(campaign.utm_source)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-ink mb-1 truncate">{campaign.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <span className="text-sm text-subtext">
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-subtext hover:text-ink transition-colors p-2 hover:bg-canvas rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-6">
                {['overview', 'utm', 'actions'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 text-sm font-bold capitalize border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-subtext hover:text-ink'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-canvas rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-xs font-bold text-subtext uppercase">Visits</span>
                      </div>
                      <p className="text-2xl font-black text-ink">{campaign.total_visits}</p>
                    </div>

                    <div className="bg-canvas rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-xs font-bold text-subtext uppercase">Questions</span>
                      </div>
                      <p className="text-2xl font-black text-ink">{campaign.total_questions}</p>
                    </div>

                    <div className="bg-canvas rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-bold text-subtext uppercase">Revenue</span>
                      </div>
                      <p className="text-2xl font-black text-ink">€{campaign.total_revenue}</p>
                    </div>

                    <div className="bg-canvas rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs font-bold text-subtext uppercase">Conv. Rate</span>
                      </div>
                      <p className="text-2xl font-black text-ink">{campaign.conversion_rate}%</p>
                    </div>
                  </div>

                  {/* Performance Insights */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-ink mb-3">Performance Insights</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-subtext font-medium">Avg Revenue per Question</span>
                        <span className="font-bold text-ink">€{avgRevenuePerQuestion}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-subtext font-medium">Conversion Rate</span>
                        <span className={`font-bold ${
                          campaign.conversion_rate >= 5 ? 'text-green-700' :
                          campaign.conversion_rate >= 3 ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {campaign.conversion_rate}%
                          {campaign.conversion_rate >= 5 ? ' 🎯 Excellent' : 
                           campaign.conversion_rate >= 3 ? ' ⚠️ Average' :
                           ' 📉 Needs Work'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking URL */}
                  <div className="bg-canvas rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-ink">Campaign URL</h3>
                      <button
                        onClick={handleCopyUrl}
                        className="px-3 py-1.5 text-xs font-medium text-primary hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {showCopied ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <code className="text-sm text-subtext break-all font-mono bg-white p-3 rounded border border-gray-200 block">
                      {campaign.url}
                    </code>
                  </div>
                </div>
              )}

              {/* UTM Tab */}
              {activeTab === 'utm' && (
                <div className="space-y-4">
                  <div className="bg-canvas rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-bold text-ink mb-3">UTM Parameters</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-subtext uppercase">Source</label>
                        <p className="text-sm text-ink font-medium mt-1">{campaign.utm_source}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-subtext uppercase">Campaign</label>
                        <p className="text-sm text-ink font-medium mt-1">{campaign.utm_campaign}</p>
                      </div>
                      {campaign.utm_medium && (
                        <div>
                          <label className="text-xs font-bold text-subtext uppercase">Medium</label>
                          <p className="text-sm text-ink font-medium mt-1">{campaign.utm_medium}</p>
                        </div>
                      )}
                      {campaign.utm_content && (
                        <div>
                          <label className="text-xs font-bold text-subtext uppercase">Content</label>
                          <p className="text-sm text-ink font-medium mt-1">{campaign.utm_content}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Pro Tip</h4>
                    <p className="text-sm text-blue-800">
                      UTM parameters help you track exactly where your traffic comes from. 
                      Use consistent naming conventions across campaigns for better reporting.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions Tab */}
              {activeTab === 'actions' && (
                <div className="space-y-3">
                  <button
                    onClick={handleCopyUrl}
                    className="w-full p-4 bg-canvas hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-ink text-sm">Copy Campaign URL</p>
                      <p className="text-xs text-subtext">Share this tracking link</p>
                    </div>
                  </button>

                  {campaign.status === 'active' && (
                    <button
                      onClick={() => {
                        onPause(campaign);
                        onClose();
                      }}
                      className="w-full p-4 bg-canvas hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-ink text-sm">Pause Campaign</p>
                        <p className="text-xs text-subtext">Temporarily stop tracking</p>
                      </div>
                    </button>
                  )}

                  {campaign.status === 'paused' && (
                    <button
                      onClick={() => {
                        onPause(campaign);
                        onClose();
                      }}
                      className="w-full p-4 bg-canvas hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-ink text-sm">Resume Campaign</p>
                        <p className="text-xs text-subtext">Start tracking again</p>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onArchive(campaign);
                      onClose();
                    }}
                    className="w-full p-4 bg-canvas hover:bg-red-50 border border-gray-200 rounded-lg text-left transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-ink text-sm">Archive Campaign</p>
                      <p className="text-xs text-subtext">Hide from active list (data preserved)</p>
                    </div>
                  </button>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-bold text-amber-900 mb-1">⚠️ About Archiving</h4>
                    <p className="text-sm text-amber-800">
                      Archived campaigns are hidden from your active list but all data is preserved. 
                      They're still included in historical reports and "All Time" statistics.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-canvas">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}