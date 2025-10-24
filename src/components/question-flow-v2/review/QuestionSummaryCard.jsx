import React from 'react';
import { EditIcon } from '../shared/SVGIcons';

function QuestionSummaryCard({ composeData, onEdit }) {
  if (!composeData) {
    return null;
  }

  const { title, recordings, attachments, text } = composeData;

  return (
    <div className="review-card-glass rounded-2xl p-6 spacing-md">
      <div className="flex items-center justify-between mb-5">
        <h3 className="heading-gradient-primary" style={{ fontSize: '1.125rem' }}>
          Your Question
        </h3>
        <button
          onClick={onEdit}
          className="btn-premium flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
        >
          <EditIcon className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Title */}
      <div className="spacing-sm">
        <p className="text-sm font-semibold text-gray-700 mb-2">Question Title</p>
        <p className="text-base text-gray-900 font-medium" style={{ lineHeight: '1.6' }}>
          {title || 'No title provided'}
        </p>
      </div>

      {/* Recordings */}
      {recordings && recordings.length > 0 && (
        <div className="spacing-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2.5">Recordings</p>
          <div className="space-y-2">
            {recordings.map((recording, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2.5 text-sm text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg px-3 py-2.5 border border-gray-200/50"
              >
                <div className="w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
                <span className="capitalize font-medium">{recording.mode || 'recording'}</span>
                <span className="text-gray-400">•</span>
                <span className="font-semibold">{Math.floor(recording.duration || 0)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {attachments && attachments.length > 0 && (
        <div className="spacing-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2.5">Attachments</p>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2.5 text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-lg px-3 py-2.5 border border-blue-200/50"
              >
                <svg className="w-4 h-4 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="truncate font-medium">{attachment.name || attachment.filename || 'Attachment'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Written Details */}
      {text && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2.5">Written Details</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap body-text-premium">
            {text}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!title && (!recordings || recordings.length === 0) && (!attachments || attachments.length === 0) && !text && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 italic">No content added yet</p>
        </div>
      )}
    </div>
  );
}

export default QuestionSummaryCard;