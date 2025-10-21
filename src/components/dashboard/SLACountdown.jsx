// src/components/dashboard/SLACountdown.jsx
// ULTRA COMPACT MOBILE: Single line design, full info on desktop

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertOctagon, Timer } from 'lucide-react';


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
    icon: Clock,
    iconColor: 'text-blue-600',
    textColor: 'text-blue-900',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700'
  },
  warning: {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    textColor: 'text-amber-900',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700'
  },
  urgent: {
    bg: 'from-red-50 to-rose-50',
    border: 'border-red-200',
    icon: AlertOctagon,
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700'
  },
  overdue: {
    bg: 'from-red-100 to-rose-100',
    border: 'border-red-300',
    icon: Timer,
    iconColor: 'text-red-700',
    textColor: 'text-red-900',
    badgeBg: 'bg-red-200',
    badgeText: 'text-red-800'
  }
};

  const config = statusConfig[status];

  return (
    <div className={`bg-gradient-to-r ${config.bg} border ${config.border} rounded-lg overflow-hidden ${className}`}>
      {/* MOBILE: Ultra compact single line */}
      <div className="sm:hidden px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
            <config.icon className={`w-4 h-4 flex-shrink-0 ${config.iconColor}`} />
          <span className={`text-xs font-bold ${config.textColor} truncate`}>
            {timeLeft.isOverdue ? 'SLA Overdue' : 'Due'}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 ${config.badgeBg} rounded-md flex-shrink-0`}>
          <svg className={`w-3 h-3 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-xs font-bold ${config.badgeText} whitespace-nowrap`}>
            {timeLeft.isOverdue ? 'Respond ASAP' : `${timeLeft.hours}h ${timeLeft.minutes}m`}
          </span>
        </div>
      </div>

      {/* DESKTOP: Full informative design */}
      <div className="hidden sm:block p-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-12 h-12 ${config.badgeBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <config.icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-bold ${config.textColor} leading-tight`}>
                {timeLeft.isOverdue ? 'SLA Overdue' : 'Answer Due'}
              </h4>
              {!timeLeft.isOverdue && (
                <span className={`text-xs ${config.badgeText} font-semibold px-2 py-0.5 ${config.badgeBg} rounded whitespace-nowrap`}>
                  {timeLeft.hours}h {timeLeft.minutes}m
                </span>
              )}
            </div>
            
            <p className={`text-xs ${config.textColor} leading-snug mt-1 opacity-90`}>
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

          {/* Progress indicator */}
          {!timeLeft.isOverdue && (
            <div className="flex flex-col items-end gap-1">
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
              <span className={`text-[10px] font-semibold ${config.badgeText}`}>
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