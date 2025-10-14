// src/components/dashboard/QuestionContextBanner.jsx
import React, { useState, useEffect } from 'react';

const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const calculateSLARemaining = (createdAt, slaHours) => {
  const created = new Date(createdAt);
  const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
  const now = new Date();
  const remaining = deadline - now;
  
  if (remaining <= 0) return 0;
  
  return Math.ceil(remaining / (1000 * 60 * 60)); // Return hours
};

const formatTimeRemaining = (hours) => {
  if (hours <= 0) return 'Overdue';
  if (hours < 1) return 'Less than 1 hour';
  if (hours === 1) return '1 hour';
  if (hours < 24) return `${hours} hours`;
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return days === 1 ? '1 day' : `${days} days`;
  }
  
  return `${days}d ${remainingHours}h`;
};

function QuestionContextBanner({ question, expert }) {
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
  
  const hasVideo = question.recording_segments?.length > 0 || question.media_asset?.length > 0;
  const hasAttachments = question.attachments && 
    (typeof question.attachments === 'string' ? JSON.parse(question.attachments).length > 0 : question.attachments.length > 0);
  const hasDetailedText = question.text && question.text.length > 200;
  
  return (
    <div className={`p-4 sm:p-5 rounded-xl mb-4 sm:mb-6 border-2 transition-all ${
      urgency === 'overdue' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 animate-pulse' :
      urgency === 'urgent' ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300' :
      urgency === 'normal' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' :
      'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* SLA Timer */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-5 h-5 ${urgency === 'overdue' || urgency === 'urgent' ? 'text-red-600' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`font-bold text-sm sm:text-base ${urgency === 'overdue' ? 'text-red-900' : 'text-gray-900'}`}>
              {urgency === 'overdue' ? 'Overdue!' : 'Answer due in:'}
            </span>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${
            urgency === 'overdue' ? 'text-red-700' :
            urgency === 'urgent' ? 'text-orange-700' :
            urgency === 'normal' ? 'text-amber-700' :
            'text-indigo-700'
          }`}>
            {formatTimeRemaining(timeRemaining)}
          </div>
        </div>

        {/* Question Value */}
        <div className="text-left sm:text-right">
          <div className="text-xs sm:text-sm text-gray-600 mb-1 font-semibold">You'll earn</div>
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-green-200 shadow-sm">
            <span className="font-black text-green-600 text-xl sm:text-2xl">
              {formatPrice(question.price_cents, question.currency)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Quality indicators */}
      {(hasVideo || hasAttachments || hasDetailedText) && (
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="text-xs font-semibold text-gray-600 mb-2">Question includes:</div>
          <div className="flex flex-wrap gap-2">
            {hasVideo && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-gray-700 border border-gray-200 shadow-sm">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video recording
              </span>
            )}
            {hasAttachments && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-gray-700 border border-gray-200 shadow-sm">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                {typeof question.attachments === 'string' 
                  ? `${JSON.parse(question.attachments).length} file(s)` 
                  : `${question.attachments.length} file(s)`}
              </span>
            )}
            {hasDetailedText && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-semibold text-gray-700 border border-gray-200 shadow-sm">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Detailed context
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionContextBanner;