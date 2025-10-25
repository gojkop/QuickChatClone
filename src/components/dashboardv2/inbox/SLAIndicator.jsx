import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

function SLAIndicator({ question, showLabel = true }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!question.sla_hours_snapshot || question.sla_hours_snapshot <= 0) {
        return null;
      }

      const now = Date.now() / 1000;
      const createdAtSeconds = question.created_at > 4102444800 
        ? question.created_at / 1000 
        : question.created_at;
      
      const elapsed = now - createdAtSeconds;
      const slaSeconds = question.sla_hours_snapshot * 3600;
      const remaining = slaSeconds - elapsed;

      return remaining;
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [question]);

  if (timeLeft === null || timeLeft <= 0) {
    return null;
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  const isUrgent = hours < 12;
  const isCritical = hours < 6;

  const getColor = () => {
    if (isCritical) return 'text-red-600 bg-red-50 border-red-200';
    if (isUrgent) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isUrgent) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / (question.sla_hours_snapshot * 3600)) * 100));

  const formatTime = () => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${getColor()} transition-colors`}>
      {isCritical ? (
        <AlertTriangle size={14} className="flex-shrink-0 animate-pulse" />
      ) : (
        <Clock size={14} className="flex-shrink-0" />
      )}
      
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold whitespace-nowrap">
            {formatTime()} left
          </span>
          {/* Progress bar */}
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
      
      {!showLabel && (
        <span className="text-xs font-semibold">
          {formatTime()}
        </span>
      )}
    </div>
  );
}

export default SLAIndicator;