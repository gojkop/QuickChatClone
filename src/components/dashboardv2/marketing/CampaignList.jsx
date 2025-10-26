import React, { useState, useMemo } from 'react';
import CampaignModal from './CampaignModal';
import CampaignCard from './CampaignCard';
import CampaignDetailsModal from './CampaignDetailsModal';
import BetaFeatureModal from './BetaFeatureModal';

export default function CampaignList({ campaigns, onCreate }) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [betaFeatureName, setBetaFeatureName] = useState('');

  const campaignsWithBadges = useMemo(() => {
    if (campaigns.length === 0) return [];
    
    const sorted = [...campaigns].sort((a, b) => b.total_revenue - a.total_revenue);
    const topThreshold = Math.ceil(sorted.length * 0.2);
    const topPerformers = sorted.slice(0, topThreshold).map(c => c.id);
    
    return campaigns.map(c => ({
      ...c,
      isTopPerformer: topPerformers.includes(c.id),
    }));
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    let filtered = campaignsWithBadges;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.utm_source.toLowerCase().includes(query) ||
        c.utm_campaign.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [campaignsWithBadges, filterStatus, searchQuery]);

  const handleArchive = (campaign) => {
    setBetaFeatureName('Campaign archiving');
    setShowBetaModal(true);
  };

  const handlePause = (campaign) => {
    setBetaFeatureName(campaign.status === 'active' ? 'Campaign pause' : 'Campaign resume');
    setShowBetaModal(true);
  };

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-ink mb-1">Campaigns</h2>
          <p className="text-sm text-subtext font-medium">Track which marketing efforts drive revenue</p>
        </div>
        <button
          data-new-campaign-btn
          onClick={() => setShowModal(true)}
          className="px-3 py-2 text-xs font-bold bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface rounded-lg border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['active', 'paused', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all duration-base capitalize ${
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-canvas text-subtext hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {searchQuery && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-subtext font-medium">
              {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {campaigns.length === 0 ? (
        <div className="bg-surface rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-ink mb-1">No campaigns yet</h3>
          <p className="text-sm text-subtext mb-4 max-w-md mx-auto">
            Create your first campaign to start tracking marketing performance.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-indigo-700"
          >
            Create First Campaign
          </button>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-surface rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-ink mb-1">No campaigns found</h3>
          <p className="text-sm text-subtext mb-3">
            Try adjusting your filters or search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('active');
            }}
            className="text-sm text-primary hover:text-indigo-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onArchive={handleArchive}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={onCreate}
      />
            {/* Campaign Details Modal */}
      <CampaignDetailsModal
        campaign={selectedCampaign}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCampaign(null);
        }}
        onArchive={handleArchive}
        onPause={handlePause}
      />
   
          <BetaFeatureModal
        isOpen={showBetaModal}
        onClose={() => setShowBetaModal(false)}
        featureName={betaFeatureName}
      />
       </div>
  );
}