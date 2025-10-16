import React, { useState, useMemo } from 'react';
import CampaignModal from './CampaignModal';
import CampaignCard from './CampaignCard';

export default function CampaignList({ campaigns, onCreate }) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');

  // Mark top performers (top 20% by revenue)
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

  // Filter and search campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaignsWithBadges;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // Search by name or source
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
    // TODO: Implement archive API call
    console.log('Archive campaign:', campaign.id);
    alert('Archive functionality coming soon!');
  };

  const handleViewDetails = (campaign) => {
    // TODO: Implement campaign details view
    console.log('View details:', campaign);
    alert('Campaign details view coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-ink mb-1">Your Campaigns</h2>
          <p className="text-subtext font-medium">Track which marketing efforts drive revenue</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary px-4 py-2.5 text-sm gap-2 shadow-elev-2 hover:shadow-elev-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium transition-all duration-base"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['active', 'paused', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-base capitalize ${
                  filterStatus === status
                    ? 'bg-primary text-white shadow-elev-2'
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
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-subtext font-medium">
              Found {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {campaigns.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-elev-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-ink mb-2">No campaigns yet</h3>
          <p className="text-subtext mb-4 font-medium max-w-md mx-auto">
            Create your first campaign to start tracking which marketing channels drive the most questions and revenue.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary px-6 py-3 shadow-elev-2 hover:shadow-elev-3"
          >
            Create First Campaign
          </button>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        // No results after filtering
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-ink mb-2">No campaigns found</h3>
          <p className="text-subtext mb-4 font-medium">
            Try adjusting your filters or search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('active');
            }}
            className="text-primary hover:text-indigo-700 font-bold text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        // Campaign Grid
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
}