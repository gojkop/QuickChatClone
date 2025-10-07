// client/src/components/dashboard/SocialImpactStats.jsx
import React from 'react';

function SocialImpactStats({ totalDonated, charityPercentage, selectedCharity, onOpenSettings }) {
  const charityNames = {
    'unicef': 'UNICEF',
    'doctors-without-borders': 'Doctors Without Borders',
    'malala-fund': 'Malala Fund',
    'wwf': 'WWF',
    'charity-water': 'charity: water'
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 via-red-400 to-purple-400 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Your Social Impact</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Total Donated</div>
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            ${totalDonated.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Current Rate</div>
          <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {charityPercentage}%
          </div>
        </div>
      </div>

      {selectedCharity && charityPercentage > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700">
              Supporting <span className="font-bold text-purple-700">{charityNames[selectedCharity]}</span>
            </span>
          </div>
        </div>
      )}

      {charityPercentage === 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm font-semibold text-gray-700">
              Make a difference with every answer
            </p>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Donate a percentage of your earnings to causes you care about
          </p>
          <button
            onClick={onOpenSettings}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            type="button"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Set Up Donations
          </button>
        </div>
      )}
    </div>
  );
}

export default SocialImpactStats;