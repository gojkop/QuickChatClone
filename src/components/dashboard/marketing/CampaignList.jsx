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
        <p className="text-gray-600">Track which marketing efforts drive revenue</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-4">Create your first campaign to start tracking marketing performance</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Visits</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Conv. Rate</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{campaign.name}</p>
                      <p className="text-sm text-gray-600">{campaign.utm_source}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{campaign.total_visits}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{campaign.total_questions}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      campaign.conversion_rate >= 5 ? 'bg-green-100 text-green-700' :
                      campaign.conversion_rate >= 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {campaign.conversion_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-bold">€{campaign.total_revenue}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleCopyUrl(campaign)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
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