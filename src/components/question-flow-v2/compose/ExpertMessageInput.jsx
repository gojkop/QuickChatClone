import React from 'react';

function ExpertMessageInput({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        Message to Expert
        <span className="text-gray-500 font-normal ml-2">(Optional but recommended)</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Why is this question urgent or important to you? Any specific context the expert should know?"
        rows={4}
        maxLength={1000}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition text-sm resize-none"
      />
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-600">
          Help the expert understand why you need their expertise
        </p>
        <span className="text-xs text-gray-500">{value.length} / 1000</span>
      </div>
    </div>
  );
}

export default ExpertMessageInput;