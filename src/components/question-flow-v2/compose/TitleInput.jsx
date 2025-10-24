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
    <div className="spacing-md">
      <label htmlFor="question-title" className="label-premium">
        <span className="heading-gradient-primary">Question Title</span>
        <span className="required-badge">Required</span>
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
          className={`input-premium w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition-all text-base font-medium ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="e.g., Review my landing page copy for SaaS product"
          maxLength={200}
          autoComplete="off"
          autoCapitalize="sentences"
          spellCheck="true"
          style={{
            letterSpacing: '0.01em'
          }}
        />
        {isFocused && (
          <div 
            className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 blur pointer-events-none"
            style={{ zIndex: -1 }}
          />
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-red-600 font-semibold animate-fadeIn">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">
          {safeValue.length < 5 && safeValue.length > 0 && '✨ '}
          {safeValue.length >= 5 && safeValue.length < 50 && 'Looking good! '}
          {safeValue.length >= 50 && 'Great detail! '}
        </span>
        <span className="text-xs font-medium text-gray-600">{safeValue.length} / 200</span>
      </div>
    </div>
  );
}

export default TitleInput;