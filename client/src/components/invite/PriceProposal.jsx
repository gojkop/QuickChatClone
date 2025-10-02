import React, { useState } from 'react';

function PriceProposal({ onPriceChange }) {
  const [priceOption, setPriceOption] = useState('expert-decides'); // 'propose' or 'expert-decides'
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Price Proposal</h3>
      <p className="text-gray-600 text-sm mb-6">
        Suggest a price for your question, or let the expert decide
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Let Expert Decide */}
        <label 
          className={`relative flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all ${
            priceOption === 'expert-decides' 
              ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="radio"
            name="price-option"
            value="expert-decides"
            checked={priceOption === 'expert-decides'}
            onChange={() => handleOptionChange('expert-decides')}
            className="sr-only"
          />
          
          {/* Radio indicator */}
          <div className="absolute top-5 right-5">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              priceOption === 'expert-decides' 
                ? 'border-indigo-600 bg-indigo-600' 
                : 'border-gray-300'
            }`}>
              {priceOption === 'expert-decides' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Expert Decides</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            The expert will set their own price when accepting your invitation
          </p>
        </label>

        {/* Propose Price */}
        <label 
          className={`relative flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all ${
            priceOption === 'propose' 
              ? 'border-violet-600 bg-violet-50 shadow-sm' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="radio"
            name="price-option"
            value="propose"
            checked={priceOption === 'propose'}
            onChange={() => handleOptionChange('propose')}
            className="sr-only"
          />
          
          {/* Radio indicator */}
          <div className="absolute top-5 right-5">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              priceOption === 'propose' 
                ? 'border-violet-600 bg-violet-600' 
                : 'border-gray-300'
            }`}>
              {priceOption === 'propose' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Propose Price</span>
          </div>
          
          {/* Price Input */}
          <div className={`mt-3 transition-opacity ${priceOption === 'propose' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-semibold">
                €
              </span>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                disabled={priceOption !== 'propose'}
                min="25"
                step="25"
                className="w-full pl-9 pr-16 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-violet-300 focus:border-violet-500 focus:outline-none transition disabled:bg-gray-100 font-semibold text-lg"
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 text-sm">
                EUR
              </span>
            </div>
            <div className="flex justify-between mt-2 px-1">
              <button
                type="button"
                onClick={() => handlePriceChange(50)}
                disabled={priceOption !== 'propose'}
                className="text-xs text-gray-500 hover:text-violet-600 disabled:hover:text-gray-500 transition"
              >
                €50
              </button>
              <button
                type="button"
                onClick={() => handlePriceChange(75)}
                disabled={priceOption !== 'propose'}
                className="text-xs text-gray-500 hover:text-violet-600 disabled:hover:text-gray-500 transition"
              >
                €75
              </button>
              <button
                type="button"
                onClick={() => handlePriceChange(100)}
                disabled={priceOption !== 'propose'}
                className="text-xs text-gray-500 hover:text-violet-600 disabled:hover:text-gray-500 transition"
              >
                €100
              </button>
              <button
                type="button"
                onClick={() => handlePriceChange(150)}
                disabled={priceOption !== 'propose'}
                className="text-xs text-gray-500 hover:text-violet-600 disabled:hover:text-gray-500 transition"
              >
                €150
              </button>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}

export default PriceProposal;