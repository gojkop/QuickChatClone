// src/components/dashboard/SLACountdown.jsx
import React, { useState, useEffect } from 'react';

const calculateSLARemaining = (createdAt, slaHours) => {
  const created = new Date(createdAt);
  const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
  const now = new Date();
  const remaining = deadline - now;
  
  if (remaining <= 0) return 0;
  
  return Math.ceil(remaining / (1000 * 60 * 60)); // Return hours
};

const formatTimeRemaining = (hours) => {
  if (hours <= 0) return 'Overdue!';
  if (hours < 1) return 'Less than 1 hour';
  if (hours === 1) return '1 hour left';
  if (hours < 24) return `${hours} hours left`;
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return days === 1 ? '1 day left' : `${days} days left`;
  }
  
  return `${days}d ${remainingHours}h left`;
};

function SLACountdown({ question, expert, className = '' }) {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateSLARemaining(question.created_at, expert?.sla_hours || question.sla_hours_snapshot)
  );
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(
        calculateSLARemaining(question.created_at, expert?.sla_hours || question.sla_hours_snapshot)
      );
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [question.created_at, expert?.sla_hours, question.sla_hours_snapshot]);
  
  const urgency = timeRemaining <= 0 ? 'overdue' : 
                  timeRemaining < 6 ? 'urgent' : 
                  timeRemaining < 24 ? 'normal' : 
                  'comfortable';
  
  return (
    <div className={`py-2.5 sm:py-3 px-4 text-center text-xs sm:text-sm font-bold transition-colors ${
      urgency === 'overdue' ? 'bg-red-100 text-red-900 animate-pulse' :
      urgency === 'urgent' ? 'bg-orange-100 text-orange-900' :
      urgency === 'normal' ? 'bg-amber-100 text-amber-900' :
      'bg-blue-100 text-blue-900'
    } ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          {urgency === 'overdue' ? '⚠️ ' : ''}
          Answer due: {formatTimeRemaining(timeRemaining)}
        </span>
      </div>
    </div>
  );
}

export default SLACountdown;