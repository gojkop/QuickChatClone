// src/components/dashboardv2/widgets/SocialImpactWidget.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, TrendingUp, Award } from 'lucide-react';

/**
 * SocialImpactWidget - Shows charity contribution stats
 * Takes up 1x2 space in the Bento Grid (tall card)
 */
function SocialImpactWidget({
  totalDonated = 0,
  charityPercentage = 0,
  selectedCharity = null
}) {
  const navigate = useNavigate();

  // Format currency
  const formatCurrency = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const hasImpact = totalDonated > 0 || charityPercentage > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-gradient-to-br from-pink-50 to-rose-100 rounded-lg shadow-sm">
          <Heart size={16} className="text-rose-600" strokeWidth={2.5} fill="currentColor" />
        </div>
        <h3 className="text-xs font-bold text-gray-900">Social Impact</h3>
      </div>

      {!hasImpact ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-3">
            <Heart size={32} className="text-rose-500" strokeWidth={2} />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">Start Making Impact</h4>
          <p className="text-xs text-gray-600 mb-3">
            Donate a % of your earnings to charity
          </p>
          <button
            onClick={() => navigate('/dashboard/profile#social-impact')}
            className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg text-xs font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-sm"
          >
            Set Up Donations
          </button>
        </div>
      ) : (
        /* Active Impact */
        <div className="flex-1 flex flex-col">
          {/* Total Donated - Hero Stat */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-3 mb-3 border border-rose-100">
            <p className="text-xs text-gray-600 mb-1">Total Impact</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-3xl font-black text-rose-600">
                {formatCurrency(totalDonated)}
              </h3>
              <TrendingUp size={16} className="text-rose-500" />
            </div>
            <p className="text-xs text-gray-600 mt-1">donated to charity</p>
          </div>

          {/* Current Settings */}
          <div className="space-y-2 mb-3">
            {/* Charity Percentage */}
            <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
              <span className="text-xs text-gray-700">Your contribution</span>
              <span className="text-sm font-bold text-rose-600">{charityPercentage}%</span>
            </div>

            {/* Selected Charity */}
            {selectedCharity && (
              <div className="p-2 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-rose-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {selectedCharity.name || 'Selected Charity'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedCharity.category || 'Making a difference'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate('/dashboard/profile#social-impact')}
            className="mt-auto w-full py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
          >
            Manage Impact →
          </button>
        </div>
      )}
    </div>
  );
}

export default SocialImpactWidget;