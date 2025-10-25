import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, DollarSign, ArrowRight } from 'lucide-react';

function ActionRequired({ urgentCount = 0, pendingOffersCount = 0 }) {
  const navigate = useNavigate();

  if (urgentCount === 0 && pendingOffersCount === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🔥 Action Required
      </h2>

      <div className="space-y-3">
        {urgentCount > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-900 mb-1">
                  {urgentCount} Question{urgentCount > 1 ? 's' : ''} Expiring Soon (&lt;12h)
                </div>
                <button
                  onClick={() => navigate('/dashboard/inbox')}
                  className="text-sm font-semibold text-red-700 hover:text-red-800 inline-flex items-center gap-1 group"
                >
                  View Urgent Questions
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingOffersCount > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <DollarSign size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-amber-900 mb-1">
                  {pendingOffersCount} Deep Dive Offer{pendingOffersCount > 1 ? 's' : ''} Pending Review
                </div>
                <button
                  onClick={() => navigate('/dashboard/inbox')}
                  className="text-sm font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 group"
                >
                  Review Offers
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionRequired;