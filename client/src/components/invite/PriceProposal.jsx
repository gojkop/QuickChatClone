import React, { useState } from 'react';

function PriceProposal({ onPriceChange }) {
  const [priceOption, setPriceOption] = useState('expert-decides');
  const [proposedPrice, setProposedPrice] = useState(75);

  const handleOptionChange = (option) => {
    setPriceOption(option);
    if (option === 'expert-decides') {
      onPriceChange({ type: 'expert-decides', amount: null });
    } else {
      onPriceChange({ type: 'propose', amount: proposedPrice });
    }
  };

  const handlePriceChange = (value) => {
    const price = Number(value);
    setProposedPrice(price);
    if (priceOption === 'propose') {
      onPriceChange({ type: 'propose', amount: price });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Price Proposal</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Optional</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Expert Decides */}
        <button
          type="button"
          onClick={() => handleOptionChange('expert-decides')}
          className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all text-left ${
            priceOption === 'expert-decides' 
              ? 'border-indigo-600 bg-indigo-50' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              priceOption === 'expert-decides' 
                ? 'border-indigo-600 bg-indigo-600' 
                : 'border-gray-300'
            }`}>
              {priceOption === 'expert-decides' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-sm font-bold text-gray-900">Expert Decides</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            They'll set their own price when accepting
          </p>
        </button>

        {/* Propose Price */}
        <button
          type="button"
          onClick={() => handleOptionChange('propose')}
          className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all text-left ${
            priceOption === 'propose' 
              ? 'border-violet-600 bg-violet-50' 
              : 'border-gray-300 hover:border-gray-400 bg-white'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              priceOption === 'propose' 
                ? 'border-violet-600 bg-violet-600' 
                : 'border-gray-300'
            }`}>
              {priceOption === 'propose' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <span className="text-sm font-bold text-gray-900">Propose Price</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Suggest a specific amount
          </p>
        </button>
      </div>

      {/* Price Input - Shows when "Propose Price" is selected */}
      {priceOption === 'propose' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your proposed price
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-semibold">
              €
            </span>
            <input
              type="number"
              value={proposedPrice}
              onChange={(e) => handlePriceChange(e.target.value)}
              min="25"
              step="25"
              className="w-full pl-9 pr-16 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-violet-300 focus:border-violet-500 focus:outline-none transition font-semibold"
            />
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 text-sm">
              EUR
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            {[50, 75, 100, 150].map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePriceChange(amount)}
                className={`flex-1 text-xs py-2 rounded-lg border transition ${
                  proposedPrice === amount
                    ? 'bg-violet-100 border-violet-300 text-violet-700 font-semibold'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                €{amount}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceProposal;