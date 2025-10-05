import React from 'react';

// Helper to format time ago
const getTimeAgo = (timestamp) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
};

// Helper to format SLA remaining time
const formatSLA = (slaHours, createdAt) => {
  const now = Date.now() / 1000;
  const elapsed = now - createdAt;
  const slaSeconds = slaHours * 3600;
  const remaining = slaSeconds - elapsed;
  
  if (remaining <= 0) return <span className="text-red-600 font-bold">Overdue</span>;
  
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (hours > 0) {
    return <span className={hours < 2 ? 'text-orange-600 font-bold' : ''}>{hours}h</span>;
  }
  return <span className="text-orange-600 font-bold">{minutes}m</span>;
};

// Helper to format price
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

const QuestionTable = ({ questions, onAnswer, onDelete }) => {
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-1">No questions yet!</p>
        <p className="text-sm text-gray-500">Share your profile link to start receiving questions</p>
      </div>
    );
  }

  return (
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
                SLA
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {questions.map((question) => {
              const isPending = question.status === 'paid' && !question.answered_at;
              const statusConfig = {
                'paid': { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
                'answered': { label: 'Answered', color: 'bg-green-100 text-green-700' },
                'pending_payment': { label: 'Unpaid', color: 'bg-gray-100 text-gray-600' },
              };
              const status = statusConfig[question.status] || statusConfig['pending_payment'];

              return (
                <tr key={question.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
                      {isPending && (
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>
                      )}
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-1 mb-0.5">
                          {question.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{getTimeAgo(question.created_at)} ago</span>
                          {question.media_asset_id && (
                            <span className="inline-flex items-center gap-1 text-indigo-600">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </span>
                          )}
                          {question.attachments && JSON.parse(question.attachments).length > 0 && (
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
                      <div className="font-medium text-gray-900">{question.payer_name || 'Anonymous'}</div>
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
                      {isPending ? formatSLA(question.sla_hours, question.created_at) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onAnswer(question)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                      >
                        Answer
                      </button>
                      <button
                        onClick={() => onDelete(question)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete question"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
          const statusConfig = {
            'paid': { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
            'answered': { label: 'Answered', color: 'bg-green-100 text-green-700' },
            'pending_payment': { label: 'Unpaid', color: 'bg-gray-100 text-gray-600' },
          };
          const status = statusConfig[question.status] || statusConfig['pending_payment'];

          return (
            <div key={question.id} className="p-4 hover:bg-gray-50 transition">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${status.color}`}>
                      {isPending && (
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>
                      )}
                      {status.label}
                    </span>
                    {isPending && (
                      <span className="text-xs font-semibold text-gray-600">
                        {formatSLA(question.sla_hours, question.created_at)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                    {question.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{getTimeAgo(question.created_at)} ago</span>
                    {question.media_asset_id && (
                      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    {question.attachments && JSON.parse(question.attachments).length > 0 && (
                      <svg className="w-3 h-3 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(question.price_cents, question.currency)}
                  </div>
                </div>
              </div>

              {/* From Info */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">From</div>
                <div className="text-sm font-medium text-gray-900">{question.payer_name || 'Anonymous'}</div>
                <div className="text-xs text-gray-500 truncate">{question.payer_email}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAnswer(question)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                >
                  Answer
                </button>
                <button
                  onClick={() => onDelete(question)}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete question"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionTable;