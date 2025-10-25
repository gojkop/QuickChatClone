import React, { useState, useEffect } from 'react';
import apiClient from '@/api';
import { Wifi, WifiOff } from 'lucide-react';

function AvailabilityToggle({ isAvailable: initialAvailable, onToggle }) {
  const [isAvailable, setIsAvailable] = useState(initialAvailable ?? true);
  const [isToggling, setIsToggling] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => setShowFeedback(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

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
      setShowFeedback(true);
    } catch (error) {
      console.error('Failed to update availability:', error);
      // Optimistically update anyway
      setIsAvailable(newStatus);
      onToggle?.(newStatus);
      setShowFeedback(true);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative">
      <div className={`
        flex items-center gap-1.5 sm:gap-2.5 px-1.5 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300
        ${isAvailable
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
          : 'bg-white border border-gray-200'
        }
      `}>
        {/* Status Indicator with icon */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isAvailable ? (
            <Wifi size={12} className="text-green-600 animate-pulse-premium sm:w-4 sm:h-4" />
          ) : (
            <WifiOff size={12} className="text-gray-400 sm:w-4 sm:h-4" />
          )}
          <span className={`text-[10px] sm:text-sm font-semibold whitespace-nowrap ${isAvailable ? 'text-green-700' : 'text-gray-600'}`}>
            {isAvailable ? 'Available' : 'Away'}
          </span>
        </div>

        {/* Divider - hidden on mobile */}
        <div className={`hidden sm:block w-px h-4 ${isAvailable ? 'bg-green-300' : 'bg-gray-300'}`} />

        {/* Toggle Switch - Premium */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`
            relative inline-flex h-3.5 w-6 sm:h-5 sm:w-9 items-center rounded-full
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
              inline-block h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 transform rounded-full bg-white transition-all duration-300 shadow-md
              ${isAvailable ? 'translate-x-3 sm:translate-x-5' : 'translate-x-0.5'}
            `}
          />
        </button>
      </div>

      {/* Feedback Toast */}
      {showFeedback && (
        <div className="absolute top-full mt-2 right-0 z-50 animate-fadeInUp">
          <div className={`
            px-4 py-2.5 rounded-lg shadow-lg border backdrop-blur-sm whitespace-nowrap
            ${isAvailable
              ? 'bg-green-50/95 border-green-200 text-green-800'
              : 'bg-gray-50/95 border-gray-200 text-gray-800'
            }
          `}>
            <div className="flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span className="text-sm font-medium">
                You are now {isAvailable ? 'available' : 'away'} to receive questions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailabilityToggle;