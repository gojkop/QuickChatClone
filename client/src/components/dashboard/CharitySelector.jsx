// client/src/components/dashboard/CharitySelector.jsx
import React from 'react';

function CharitySelector({ value, onChange, donationPercentage }) {
  const charities = [
    { id: 'unicef', name: 'UNICEF', icon: '👶', color: 'blue' },
    { id: 'doctors-without-borders', name: 'Doctors Without Borders', icon: '🏥', color: 'red' },
    { id: 'malala-fund', name: 'Malala Fund', icon: '📚', color: 'pink' },
    { id: 'wwf', name: 'WWF', icon: '🐼', color: 'green' },
    { id: 'charity-water', name: 'charity: water', icon: '💧', color: 'cyan' }
  ];

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
      red: isSelected ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-300',
      pink: isSelected ? 'border-pink-400 bg-pink-50' : 'border-gray-200 hover:border-pink-300',
      green: isSelected ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300',
      cyan: isSelected ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200 hover:border-cyan-300'
    };
    return colors[color];
  };

  if (donationPercentage === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Set a donation percentage above to select a charity
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {charities.map((charity) => (
        <button
          key={charity.id}
          type="button"
          onClick={() => onChange(charity.id)}
          className={`relative p-4 rounded-lg border-2 transition-all text-left ${getColorClasses(charity.color, value === charity.id)}`}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{charity.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-sm">{charity.name}</div>
            </div>
            {value === charity.id && (
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export default CharitySelector;