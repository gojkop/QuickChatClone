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
      
<div className="grid grid-cols-5 gap-2">
  {percentages.map((percentage) => (
    <button
      key={percentage}
      type="button"
      onClick={() => onChange(percentage)}
      className={`relative py-1.5 px-2 rounded-md border transition-all text-sm font-semibold ${
        value === percentage 
          ? `${getBorder(percentage)} bg-gradient-to-br ${getGradient(percentage)}` 
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <div className={`text-center ${value === percentage ? getTextColor(percentage) : 'text-gray-700'}`}>
        {percentage}%
      </div>
      {value === percentage && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  ))}
</div>
      
      {value > 0 && (
<div className="mt-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
  <p className="text-xs text-gray-600">
    💝 {value}% of earnings donated to selected charity
  </p>
</div>
      )}
    </div>
  );
}

export default CharityDonationSelector;