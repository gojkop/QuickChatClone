// src/components/dashboard/SLACountdown.jsx
// MOBILE OPTIMIZED: Compressed design that's still informative

import React, { useState, useEffect } from 'react';

function SLACountdown({ question, expert, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('normal'); // 'normal', 'warning', 'urgent', 'overdue'

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!question?.created_at || !question?.sla_hours_snapshot) {
        return null;
      }

      const createdAt = new Date(question.created_at);
      const slaHours = question.sla_hours_snapshot;
      const deadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setStatus('overdue');
        return { hours: 0, minutes: 0, isOverdue: true };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Set status based on time remaining
      const percentRemaining = (diff / (slaHours * 60 * 60 * 1000)) * 100;
      if (percentRemaining <= 10) {
        setStatus('urgent');
      } else if (percentRemaining <= 25) {
        setStatus('warning');
      } else {
        setStatus('normal');
      }

      return { hours, minutes, isOverdue: false };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [question]);

  if (!timeLeft) return null;

  const statusConfig = {
    normal: {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      icon: '⏰',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      timeColor: 'text-blue-700'
    },
    warning: {
      bg: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      icon: '⚠️',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
      timeColor: 'text-amber-700'
    },
    urgent: {
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-200',
      icon: '🚨',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      timeColor: 'text-red-700'
    },
    overdue: {
      bg: 'from-red-100 to-rose-100',
      border: 'border-red-300',
      icon: '⏱️',
      iconBg: 'bg-red-200',
      iconColor: 'text-red-700',
      textColor: 'text-red-900',
      timeColor: 'text-red-800'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`bg-gradient-to-r ${config.bg} border ${config.border} rounded-lg overflow-hidden ${className}`}>
      {/* Mobile-optimized layout */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          {/* Icon - smaller on mobile */}
          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-xl sm:text-2xl">{config.icon}</span>
          </div>

          {/* Content - compact on mobile */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <h4 className={`text-xs sm:text-sm font-bold ${config.textColor}`}>
                {timeLeft.isOverdue ? 'SLA Overdue' : 'Answer Due'}
              </h4>
              {!timeLeft.isOverdue && (
                <span className={`text-xs ${config.timeColor} font-semibold`}>
                  in {timeLeft.hours}h {timeLeft.minutes}m
                </span>
              )}
            </div>
            
            <p className={`text-xs ${config.timeColor} leading-snug`}>
              {timeLeft.isOverdue ? (
                'Please respond as soon as possible'
              ) : status === 'urgent' ? (
                'Urgent: Less than 10% time remaining'
              ) : status === 'warning' ? (
                'Respond soon to meet your SLA commitment'
              ) : (
                `${question.sla_hours_snapshot}h SLA commitment`
              )}
            </p>
          </div>

          {/* Progress indicator - only on desktop */}
          {!timeLeft.isOverdue && (
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="w-16 h-2 bg-white rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    status === 'urgent' ? 'bg-red-600' :
                    status === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, 
                      ((timeLeft.hours * 60 + timeLeft.minutes) / (question.sla_hours_snapshot * 60)) * 100
                    ))}%`
                  }}
                />
              </div>
              <span className={`text-[10px] font-semibold ${config.timeColor}`}>
                {Math.floor(((timeLeft.hours * 60 + timeLeft.minutes) / (question.sla_hours_snapshot * 60)) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SLACountdown;