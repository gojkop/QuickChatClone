import React, { useState } from 'react';
import apiClient from '@/api';

function AvailabilityToggle({ isAvailable: initialAvailable, onToggle }) {
  const [isAvailable, setIsAvailable] = useState(initialAvailable ?? true);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;

    const newStatus = !isAvailable;
    setIsToggling(true);

    try {
      await apiClient.post('/expert/profile/availability', {
        accepting_questions: newStatus
      });
      setIsAvailable(newStatus);
      onToggle?.(newStatus);
    } catch (error) {
      console.error('Failed to update availability:', error);
      // Optimistically update anyway
      setIsAvailable(newStatus);
      onToggle?.(newStatus);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg">
      {/* Status Indicator */}
      <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      
      {/* Status Text */}
      <span className={`text-sm font-medium ${isAvailable ? 'text-green-700' : 'text-gray-600'}`}>
        {isAvailable ? 'Available' : 'Away'}
      </span>

      {/* Divider */}
      <div className="w-px h-4 bg-gray-300" />

      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full
          transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
          ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}
          ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isAvailable ? 'Turn off availability' : 'Turn on availability'}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm
            ${isAvailable ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}

export default AvailabilityToggle;