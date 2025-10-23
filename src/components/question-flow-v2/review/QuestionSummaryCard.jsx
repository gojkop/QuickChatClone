import React from 'react';
import { EditIcon } from '../shared/SVGIcons';

function QuestionSummaryCard({ composeData, onEdit }) {
  const { title, recordings = [], attachments = [], text } = composeData;
  
  const hasRecordings = recordings.length > 0;
  const hasAttachments = attachments.length > 0;
  const hasText = text && text.trim().length > 0;

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = recordings.reduce((sum, r) => sum + (r.duration || 0), 0);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900">Your Question</h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm text-gray-700"
        >
          <EditIcon className="w-4 h-4" />
          <span>Edit</span>
        </button>
      </div>

      {/* Title */}
      <div className="bg-gray-50 rounded-lg p-3 mb-2.5 border border-gray-200">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Question Title</div>
        <div className="font-semibold text-gray-900 text-base">{title}</div>
      </div>

      {/* Content Summary */}
      <div className="space-y-2">
        {/* Recordings */}
        {hasRecordings && (
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {recordings.length} Recording{recordings.length > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-600">
                  Total: {formatTime(totalDuration)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Written Context */}
        {hasText ? (
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 mb-1">Written Details</div>
                <div className="text-xs text-gray-700 line-clamp-2 break-words">{text}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 text-center">
            <div className="text-xs text-gray-500">No additional written context</div>
          </div>
        )}

        {/* Attachments */}
        {hasAttachments ? (
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {attachments.length} File{attachments.length > 1 ? 's' : ''} Attached
                </div>
                <div className="space-y-0.5">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="text-xs text-gray-700 truncate">
                      📎 {file.name || file.filename || `Attachment ${idx + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 text-center">
            <div className="text-xs text-gray-500">No files attached</div>
          </div>
        )}
      </div>

      {/* All Ready Badge */}
      {(hasRecordings || hasText || hasAttachments) && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2.5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-green-900">Ready to send!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionSummaryCard;