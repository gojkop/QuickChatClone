import React, { useState } from 'react';

function ExpertMessageInput({ value, onChange, compact = false }) {
  const [isFocused, setIsFocused] = useState(false);
  const safeValue = value || '';

  if (compact) {
    return (
      <div className="spacing-md">
        <label htmlFor="expert-message" className="label-premium">
          <span>Message to Expert</span>
          <span className="optional-badge">(Optional)</span>
        </label>
        <div className="relative">
          <textarea
            id="expert-message"
            name="message"
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Why is this question important or urgent?"
            rows={3}
            maxLength={500}
            className="input-premium w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-sm resize-none"
            autoComplete="off"
            autoCapitalize="sentences"
            spellCheck="true"
            style={{ letterSpacing: '0.01em' }}
          />
          {isFocused && (
            <div 
              className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-15 blur pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}
        </div>
        <div className="text-right text-xs font-medium text-gray-600 mt-2">
          {safeValue.length} / 500
        </div>
      </div>
    );
  }

  return (
    <div className="spacing-md">
      <label htmlFor="expert-message" className="label-premium">
        <span className="heading-gradient-primary">Message to Expert</span>
        <span className="optional-badge">(Optional but recommended)</span>
      </label>
      <div className="relative">
        <textarea
          id="expert-message"
          name="message"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Why is this question urgent or important to you? Any specific context the expert should know?"
          rows={4}
          maxLength={1000}
          className="input-premium w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-base resize-none"
          autoComplete="off"
          autoCapitalize="sentences"
          spellCheck="true"
          style={{ letterSpacing: '0.01em', lineHeight: '1.6' }}
        />
        {isFocused && (
          <div 
            className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl opacity-15 blur pointer-events-none"
            style={{ zIndex: -1 }}
          />
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mt-2">
        <p className="text-xs text-gray-600 body-text-premium">
          💡 Help the expert understand your needs
        </p>
        <span className="text-xs text-gray-600 font-medium">{safeValue.length} / 1000</span>
      </div>
    </div>
  );
}

export default ExpertMessageInput;