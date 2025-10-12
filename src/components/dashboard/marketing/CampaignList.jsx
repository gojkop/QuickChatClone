import React, { useState } from 'react';
import CampaignModal from './CampaignModal';

export default function CampaignList({ campaigns, onCreate }) {
  const [showModal, setShowModal] = useState(false);
  const [copiedCampaign, setCopiedCampaign] = useState(null);

  const handleCopyUrl = (campaign) => {
    navigator.clipboard.writeText(campaign.url);
    setCopiedCampaign(campaign.id);
    setTimeout(() => setCopiedCampaign(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-subtext font-medium">Track which marketing efforts drive revenue</p>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary px-4 py-2.5 text-sm gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-ink mb-2">No campaigns yet</h3>
          <p className="text-subtext mb-4 font-medium">Create your first campaign to start tracking marketing performance</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary px-4 py-2.5"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-elev-2 border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-canvas">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Visits</th>
                <th className="px-6 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Conv. Rate</th>
                <th className="px-6 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-black text-subtext uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-canvas transition-colors duration-fast">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-ink">{campaign.name}</p>
                      <p className="text-sm text-subtext capitalize">{campaign.utm_source}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ink font-bold">{campaign.total_visits}</td>
                  <td className="px-6 py-4 text-ink font-bold">{campaign.total_questions}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                      campaign.conversion_rate >= 5 ? 'bg-green-100 text-green-700' :
                      campaign.conversion_rate >= 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {campaign.conversion_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink font-black">€{campaign.total_revenue}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleCopyUrl(campaign)}
                      className="text-primary hover:text-indigo-700 font-bold text-sm transition-colors duration-fast"
                    >
                      {copiedCampaign === campaign.id ? '✓ Copied!' : 'Copy Link'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={onCreate}
      />
    </div>
  );
}