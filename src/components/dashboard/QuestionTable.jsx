import React from 'react';
import QuestionActionsDropdown from './QuestionActionsDropdown';
import EmptyQuestionState from './EmptyQuestionState';

// ✅ FIXED: Helper to check if attachments exist safely
const hasAttachments = (question) => {
  if (!question.attachments) return false;
  try {
    const parsed = typeof question.attachments === 'string' && question.attachments.trim()
      ? JSON.parse(question.attachments) 
      : question.attachments;
    return Array.isArray(parsed) && parsed.length > 0;
  } catch (e) {
    return false;
  }
};

// Helper to format time ago - FIXED
const getTimeAgo = (timestamp) => {
  const now = Date.now() / 1000;
  const timestampSeconds = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
  const diff = now - timestampSeconds;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
};

// Helper to construct full name from payer fields
const getPayerName = (question) => {
  // Extract and clean first name
  let firstName = '';
  if (Array.isArray(question.payer_first_name)) {
    // Fallback: handle array format (shouldn't happen now, but defensive)
    firstName = question.payer_first_name.find(name => name && name.trim()) || '';
  } else if (question.payer_first_name) {
    firstName = question.payer_first_name.trim();
  }
  
  // Extract and clean last name
  let lastName = '';
  if (Array.isArray(question.payer_last_name)) {
    // Fallback: handle array format (shouldn't happen now, but defensive)
    lastName = question.payer_last_name.find(name => name && name.trim()) || '';
  } else if (question.payer_last_name) {
    lastName = question.payer_last_name.trim();
  }
  
  // Combine names
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }
  
  return 'Anonymous';
};

// Helper to format SLA remaining time - with 20% threshold coloring
const formatSLA = (slaHours, createdAt) => {
  if (!slaHours || slaHours <= 0) {
    return <span className="text-gray-400">—</span>;
  }

  const now = Date.now() / 1000;
  const createdAtSeconds = createdAt > 4102444800 ? createdAt / 1000 : createdAt;
  const elapsed = now - createdAtSeconds;
  const slaSeconds = slaHours * 3600;
  const remaining = slaSeconds - elapsed;

  if (remaining <= 0) return <span className="text-red-600 font-bold">Overdue</span>;

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  // Calculate percentage of time remaining
  const percentRemaining = (remaining / slaSeconds) * 100;

  // Red color if less than 20% time remaining
  const isUrgent = percentRemaining < 20;

  if (hours > 0) {
    return <span className={isUrgent ? 'text-red-600 font-bold' : ''}>{hours}h</span>;
  }
  return <span className={isUrgent ? 'text-red-600 font-bold' : 'text-orange-600 font-bold'}>{minutes}m</span>;
};

// Helper to format price
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

// Tier Badge Component
const TierBadge = ({ tier }) => {
  if (!tier || tier === 'legacy') return null;

  const config = {
    quick_consult: {
      icon: '⚡',
      label: 'Quick',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      size: 'text-xs'
    },
    deep_dive: {
      icon: '🎯',
      label: 'Deep',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
      size: 'text-xs'
    }
  };

  const tierConfig = config[tier];
  if (!tierConfig) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${tierConfig.size} ${tierConfig.bgColor} ${tierConfig.textColor} ${tierConfig.borderColor}`}
      title={tier === 'quick_consult' ? 'Quick Consult - Fixed price' : 'Deep Dive - Negotiated price'}
    >
      <span>{tierConfig.icon}</span>
      <span>{tierConfig.label}</span>
    </span>
  );
};

const QuestionTable = ({ 
  questions, 
  onAnswer, 
  onDelete, 
  currentPage, 
  totalPages, 
  onPageChange, 
  onQuestionClick, 
  onAction,
  expertProfile,  // ✅ NEW PROP
  activeTab  // ✅ NEW PROP - to determine which empty state to show
}) => {

  // ✅ ENHANCED: Smart empty state based on tab context
  if (questions.length === 0) {
    // Show EmptyQuestionState ONLY on "pending" or "all" tabs
    // This is the activation/onboarding experience
    if (activeTab === 'pending' || activeTab === 'all') {
      return <EmptyQuestionState expertProfile={expertProfile} />;
    }
    
    // For "answered" tab with no results, show a simple message
    // (Expert already has pending questions, just hasn't answered any yet)
    if (activeTab === 'answered') {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No answered questions yet</p>
          <p className="text-sm text-gray-500">Check the "Pending" tab to answer your questions</p>
        </div>
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Time Left
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {questions.map((question) => {
                const isPending = question.status === 'paid' && !question.answered_at;
                const isHidden = question.hidden === true;
                
                let statusDisplay;
                if (question.answered_at || question.status === 'answered' || question.status === 'closed') {
                  statusDisplay = { label: 'Answered', color: 'bg-green-100 text-green-700' };
                } else if (question.status === 'paid') {
                  statusDisplay = { label: 'Pending', color: 'bg-amber-100 text-amber-700' };
                } else {
                  statusDisplay = { label: 'Unpaid', color: 'bg-gray-100 text-gray-600' };
                }

                return (
                  <tr
                    key={question.id}
                    className={`transition cursor-pointer ${
                      isHidden ? 'opacity-50' : ''
                    } ${
                      question.question_tier === 'deep_dive'
                        ? 'bg-purple-50 hover:bg-purple-100 border-l-[3px] border-l-purple-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onQuestionClick?.(question)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusDisplay.color}`}>
                          {isPending && (
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>
                          )}
                          {statusDisplay.label}
                        </span>
                        {isHidden && (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">
                            {question.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{getTimeAgo(question.created_at)}</span>
                            {(question.recording_segments?.length > 0 || question.media_asset_id) && (
                              <span className="inline-flex items-center gap-1 text-indigo-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </span>
                            )}
                            {hasAttachments(question) && (
                              <span className="inline-flex items-center gap-1 text-violet-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{getPayerName(question)}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">
                          {question.payer_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(question.price_cents, question.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold">
                        {isPending ? formatSLA(question.sla_hours_snapshot, question.created_at) : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <QuestionActionsDropdown 
                          question={question} 
                          onAction={onAction}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {questions.map((question) => {
            const isPending = question.status === 'paid' && !question.answered_at;
            const isHidden = question.hidden === true;
            
            let statusDisplay;
            if (question.answered_at || question.status === 'answered' || question.status === 'closed') {
              statusDisplay = { label: 'Answered', color: 'bg-green-100 text-green-700' };
            } else if (question.status === 'paid') {
              statusDisplay = { label: 'Pending', color: 'bg-amber-100 text-amber-700' };
            } else {
              statusDisplay = { label: 'Unpaid', color: 'bg-gray-100 text-gray-600' };
            }

            return (
              <div
                key={question.id}
                className={`p-4 transition cursor-pointer ${
                  isHidden ? 'opacity-50' : ''
                } ${
                  question.question_tier === 'deep_dive'
                    ? 'bg-purple-50 hover:bg-purple-100 border-l-[3px] border-l-purple-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onQuestionClick?.(question)}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${statusDisplay.color}`}>
                        {isPending && (
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>
                        )}
                        {statusDisplay.label}
                      </span>
                      {isPending && (
                        <span className="text-xs font-semibold text-gray-600">
                          {formatSLA(question.sla_hours_snapshot, question.created_at)}
                        </span>
                      )}
                      {isHidden && (
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                      {question.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{getTimeAgo(question.created_at)}</span>
                      {(question.recording_segments?.length > 0 || question.media_asset_id) && (
                        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      {hasAttachments(question) && (
                        <svg className="w-3 h-3 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* ✅ FIX: Prevent click propagation and add touch event handler */}
                  <div 
                    className="text-right flex-shrink-0" 
                    onClick={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                  >
                    <QuestionActionsDropdown 
                      question={question} 
                      onAction={onAction}
                    />
                  </div>
                </div>

                {/* From Info */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <div className="text-xs text-gray-500 mb-0.5">From</div>
                  <div className="text-sm font-medium text-gray-900">{getPayerName(question)}</div>
                  <div className="text-xs text-gray-500 truncate">{question.payer_email}</div>
                </div>

                {/* Price and Action Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Payment</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(question.price_cents, question.currency)}
                    </div>
                  </div>
                  {/* ✅ FIX: Conditional button text based on question status */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuestionClick?.(question);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                  >
                    {isPending ? 'View & Answer' : 'View'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition"
              aria-label="Previous page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                const showPage = 
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3;
                const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <span key={pageNum} className="px-2 text-gray-400">...</span>
                  );
                }

                if (!showPage) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold text-sm transition ${
                      pageNum === currentPage
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition"
              aria-label="Next page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionTable;