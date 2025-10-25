import React, { useState } from 'react';
import apiClient from '@/api';
import { Wifi, WifiOff } from 'lucide-react';

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
    <div className={`
      flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300
      ${isAvailable 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
        : 'bg-white border border-gray-200'
      }
    `}>
      {/* Status Indicator with icon */}
      <div className="flex items-center gap-2">
        {isAvailable ? (
          <Wifi size={16} className="text-green-600 animate-pulse-premium" />
        ) : (
          <WifiOff size={16} className="text-gray-400" />
        )}
        <span className={`text-sm font-semibold ${isAvailable ? 'text-green-700' : 'text-gray-600'}`}>
          {isAvailable ? 'Available' : 'Away'}
        </span>
      </div>

      {/* Divider */}
      <div className={`w-px h-4 ${isAvailable ? 'bg-green-300' : 'bg-gray-300'}`} />

      {/* Toggle Switch - Premium */}
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full
          transition-all duration-300 focus-ring
          ${isAvailable 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-success' 
            : 'bg-gray-300'
          }
          ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        `}
        title={isAvailable ? 'Turn off availability' : 'Turn on availability'}
        aria-label={isAvailable ? 'Turn off availability' : 'Turn on availability'}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-all duration-300 shadow-md
            ${isAvailable ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
}

export default AvailabilityToggle;