import React, { useState, useEffect } from 'react';

function TitleInput({ value, onChange }) {
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const safeValue = value || '';

  useEffect(() => {
    if (safeValue.length > 0 && safeValue.length < 5) {
      setError('Title should be at least 5 characters');
    } else {
      setError('');
    }
  }, [safeValue]);

  return (
    <div>
      <label 
        htmlFor="question-title" 
        className="flex items-center text-sm font-bold text-gray-900 mb-3 tracking-tight"
      >
        <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Question Title
        </span>
        <span className="ml-2 text-xs px-2 py-0.5 bg-red-50 text-red-600 font-semibold rounded-full border border-red-100">
          Required
        </span>
      </label>
      
      <div className="relative">
        <input
          type="text"
          id="question-title"
          name="title"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3.5 
            border-2 rounded-xl
            font-medium text-base
            transition-all duration-300 ease-out
            ${error 
              ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
              : isFocused
                ? 'border-indigo-400 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 shadow-lg shadow-indigo-100/50'
                : 'border-gray-200 bg-gray-50/30 hover:border-gray-300 hover:bg-white hover:shadow-md'
            }
            focus:outline-none
          `}
          placeholder="e.g., Review my landing page copy for SaaS product"
          maxLength={200}
          autoComplete="off"
          autoCapitalize="sentences"
          spellCheck="true"
        />
        
        {/* Focus indicator line */}
        {isFocused && !error && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
          />
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 mt-2.5 px-3 py-2 bg-red-50 border border-red-100 rounded-lg animate-fadeIn">
          <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs text-red-700 font-semibold">{error}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">
          {safeValue.length > 0 && (
            <span className={safeValue.length >= 5 ? 'text-emerald-600 font-semibold' : ''}>
              {safeValue.length >= 5 ? '✓' : '○'} {safeValue.length} characters
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 font-medium">
          {200 - safeValue.length} remaining
        </div>
      </div>
    </div>
  );
}

export default TitleInput;