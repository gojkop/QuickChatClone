import React from 'react';

function ExpertMessageInput({ value, onChange, compact = false }) {
  // ✅ FIX: Ensure value is always a string
  const safeValue = value || '';

  if (compact) {
    return (
      <div>
        <label htmlFor="expert-message" className="block text-sm font-semibold text-gray-900 mb-2">
          Message to Expert
          <span className="text-gray-500 font-normal ml-2">(Optional)</span>
        </label>
        <textarea
          id="expert-message"
          name="message"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Why is this question important or urgent?"
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition text-sm resize-none"
          autoComplete="off"
          autoCapitalize="sentences"
          spellCheck="true"
        />
        <div className="text-right text-xs text-gray-500 mt-1">{safeValue.length} / 500</div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="expert-message" className="block text-sm font-semibold text-gray-900 mb-2">
        Message to Expert
        <span className="text-gray-500 font-normal ml-2">(Optional but recommended)</span>
      </label>
      <textarea
        id="expert-message"
        name="message"
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Why is this question urgent or important to you? Any specific context the expert should know?"
        rows={4}
        maxLength={1000}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition text-base resize-none"
        autoComplete="off"
        autoCapitalize="sentences"
        spellCheck="true"
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mt-1">
        <p className="text-xs text-gray-600">
          Help the expert understand why you need their expertise
        </p>
        <span className="text-xs text-gray-500 font-medium">{safeValue.length} / 1000</span>
      </div>
    </div>
  );
}

export default ExpertMessageInput;