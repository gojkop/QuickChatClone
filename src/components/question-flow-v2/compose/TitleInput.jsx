import React, { useState, useEffect } from 'react';

function TitleInput({ value, onChange }) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (value.length > 0 && value.length < 5) {
      setError('Title should be at least 5 characters');
    } else {
      setError('');
    }
  }, [value]);

  return (
    <div>
      <label htmlFor="question-title" className="flex items-center text-sm font-semibold text-gray-900 mb-2">
        <span>Question Title</span>
        <span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="text"
        id="question-title"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base"
        placeholder="e.g., Review my landing page copy for SaaS product"
        maxLength={200}
      />
      {error && (
        <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
      <div className="text-right text-xs text-gray-500 mt-1">{value.length} / 200</div>
    </div>
  );
}

export default TitleInput;