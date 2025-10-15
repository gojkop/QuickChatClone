// src/components/dashboard/QuestionContextBanner.jsx
// ULTRA COMPACT MOBILE VERSION - Minimal space usage

import React from 'react';
import SLACountdown from './SLACountdown';

const formatPrice = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

function QuestionContextBanner({ question, expert }) {
  const hasMedia = question?.recording_segments?.length > 0 || question?.media_asset;
  const hasAttachments = (() => {
    try {
      if (typeof question?.attachments === 'string' && question.attachments.trim()) {
        return JSON.parse(question.attachments).length > 0;
      }
      return Array.isArray(question?.attachments) && question.attachments.length > 0;
    } catch {
      return false;
    }
  })();

  return (
    <div className="space-y-3">
      {/* SLA Countdown - Already compact */}
      <SLACountdown question={question} expert={expert} />

      {/* MOBILE: Ultra compact earnings + question summary */}
      <div className="sm:hidden bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600">You'll earn:</span>
          <span className="text-lg font-black text-indigo-600">
            {formatPrice(question.price_cents)}
          </span>
        </div>
        
        {(hasMedia || hasAttachments) && (
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {hasMedia && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Media</span>
              </div>
            )}
            {hasAttachments && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Files</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP: Full informative banner */}
      <div className="hidden sm:block bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">You'll earn from this answer:</p>
            <p className="text-2xl font-black text-indigo-600">
              {formatPrice(question.price_cents)}
            </p>
          </div>
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {(hasMedia || hasAttachments) && (
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Question includes:</p>
            <div className="flex items-center gap-4 text-sm">
              {hasMedia && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Video/Audio recording</span>
                </div>
              )}
              {hasAttachments && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span>Attached files</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionContextBanner;