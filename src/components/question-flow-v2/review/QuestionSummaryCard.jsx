import React from 'react';
import { EditIcon } from '../shared/SVGIcons';

function QuestionSummaryCard({ composeData, onEdit }) {
  if (!composeData) {
    return null;
  }

  const { title, recordings, attachments, text } = composeData;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Your Question</h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          <EditIcon className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Title */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-1">Question Title</p>
        <p className="text-base text-gray-900">{title || 'No title provided'}</p>
      </div>

      {/* Recordings */}
      {recordings && recordings.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Recordings</p>
          <div className="space-y-2">
            {recordings.map((recording, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <span className="capitalize">{recording.mode || 'recording'}</span>
                <span>•</span>
                <span>{Math.floor(recording.duration || 0)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {attachments && attachments.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Attachments</p>
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="truncate">{attachment.name || attachment.filename || 'Attachment'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Written Details */}
      {text && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Written Details</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{text}</p>
        </div>
      )}

      {/* Empty state */}
      {!title && (!recordings || recordings.length === 0) && (!attachments || attachments.length === 0) && !text && (
        <p className="text-sm text-gray-500 italic">No content added yet</p>
      )}
    </div>
  );
}

export default QuestionSummaryCard;