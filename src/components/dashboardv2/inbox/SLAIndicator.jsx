import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Zap } from 'lucide-react';

function SLAIndicator({ question, showLabel = true, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Check if this is a pending offer - use offer_expires_at instead of SLA
      const isPendingOffer = question.is_pending_offer || question.status === 'pending_offer';

      if (isPendingOffer && question.offer_expires_at) {
        // For pending offers, calculate time until offer expires
        const now = Date.now() / 1000;
        const expiresAtSeconds = question.offer_expires_at > 4102444800
          ? question.offer_expires_at / 1000
          : question.offer_expires_at;

        const remaining = expiresAtSeconds - now;
        return remaining;
      }

      // For regular questions, use SLA calculation
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

  const getStyles = () => {
    if (isCritical) return {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: AlertTriangle,
      progressBg: 'bg-red-500',
    };
    if (isUrgent) return {
      bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: Clock,
      progressBg: 'bg-orange-500',
    };
    return {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: Zap,
      progressBg: 'bg-blue-500',
    };
  };

  const styles = getStyles();
  const Icon = styles.icon;

  // Calculate progress percentage based on question type
  const isPendingOffer = question.is_pending_offer || question.status === 'pending_offer';
  let progressPercentage;

  if (isPendingOffer && question.offer_expires_at && question.created_at) {
    // For pending offers: progress from created_at to offer_expires_at (24h window)
    const createdAtSeconds = question.created_at > 4102444800 ? question.created_at / 1000 : question.created_at;
    const expiresAtSeconds = question.offer_expires_at > 4102444800 ? question.offer_expires_at / 1000 : question.offer_expires_at;
    const totalTime = expiresAtSeconds - createdAtSeconds;
    progressPercentage = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));
  } else {
    // For regular questions: progress based on SLA
    progressPercentage = Math.max(0, Math.min(100, (timeLeft / (question.sla_hours_snapshot * 3600)) * 100));
  }

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

  if (compact) {
    return (
      <span className={`badge-premium ${styles.bg} ${styles.border} ${styles.text} border`}>
        <Icon size={12} className={`icon-container ${isCritical ? 'animate-pulse-premium' : ''}`} />
        <span className="font-bold">{formatTime()}</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${styles.bg} ${styles.border} ${styles.text} transition-all duration-300 shadow-sm`}>
      <Icon 
        size={14} 
        className={`icon-container ${isCritical ? 'animate-pulse-premium' : ''}`}
      />
      
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold whitespace-nowrap">
            {formatTime()} left
          </span>
          {/* Progress bar */}
          <div className="w-16 h-1.5 bg-white/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${styles.progressBg}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
      
      {!showLabel && (
        <span className="text-xs font-bold">
          {formatTime()}
        </span>
      )}
    </div>
  );
}

export default SLAIndicator;