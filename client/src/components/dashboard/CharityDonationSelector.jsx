// client/src/components/dashboard/CharityDonationSelector.jsx
import React from 'react';

function CharityDonationSelector({ value, onChange }) {
  const percentages = [0, 25, 50, 75, 100];
  
  const getGradient = (percentage) => {
    if (percentage === 0) return 'from-gray-100 to-gray-100';
    if (percentage === 25) return 'from-yellow-50 to-amber-50';
    if (percentage === 50) return 'from-orange-50 to-red-50';
    if (percentage === 75) return 'from-pink-50 to-rose-50';
    return 'from-purple-50 to-fuchsia-50';
  };

  const getBorder = (percentage) => {
    if (percentage === 0) return 'border-gray-300';
    if (percentage === 25) return 'border-yellow-300';
    if (percentage === 50) return 'border-orange-300';
    if (percentage === 75) return 'border-pink-300';
    return 'border-purple-300';
  };

  const getTextColor = (percentage) => {
    if (percentage === 0) return 'text-gray-700';
    if (percentage === 25) return 'text-yellow-700';
    if (percentage === 50) return 'text-orange-700';
    if (percentage === 75) return 'text-pink-700';
    return 'text-purple-700';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <label className="text-sm font-bold text-gray-900">
          Charity Donation Percentage
        </label>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {percentages.map((percentage) => (
          <button
            key={percentage}
            type="button"
            onClick={() => onChange(percentage)}
            className={`relative py-3 px-2 rounded-lg border-2 transition-all ${
              value === percentage 
                ? `${getBorder(percentage)} bg-gradient-to-br ${getGradient(percentage)} shadow-md` 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className={`text-lg font-bold ${value === percentage ? getTextColor(percentage) : 'text-gray-600'}`}>
                {percentage}%
              </div>
              {value === percentage && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {value > 0 && (
        <div className={`mt-3 p-3 rounded-lg bg-gradient-to-br ${getGradient(value)} border ${getBorder(value)}`}>
          <p className={`text-sm font-medium ${getTextColor(value)}`}>
            💝 {value}% of your earnings will go to your selected charity
          </p>
        </div>
      )}
    </div>
  );
}

export default CharityDonationSelector;