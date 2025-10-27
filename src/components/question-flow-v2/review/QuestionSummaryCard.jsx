import React from 'react';
import { EditIcon } from '../shared/SVGIcons';

function QuestionSummaryCard({ composeData, onEdit }) {
  if (!composeData) {
    return null;
  }

  const { title, recordings, attachments, text } = composeData;

  // Helper to render recording segment preview
  const renderRecordingPreview = (recording) => {
    const mode = recording.mode || 'video';
    // Use blobUrl for immediate playback, fallback to playbackUrl/url after Stream processing
    const url = recording.blobUrl || recording.playbackUrl || recording.url;

    if (!url) {
      return null;
    }

    // Audio recording
    if (mode === 'audio') {
      return (
        <div className="mt-2 p-3 bg-gray-900 rounded-lg">
          <audio controls className="w-full" preload="metadata" src={url}>
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    // Video/Screen recording
    return (
      <div className="mt-2 rounded-lg overflow-hidden border border-gray-300 bg-black">
        <video
          controls
          className="w-full"
          preload="metadata"
          style={{ maxHeight: '250px' }}
          src={url}
        >
          Your browser does not support video playback.
        </video>
      </div>
    );
  };

  // Helper to render attachment preview based on MIME type
  const renderAttachmentPreview = (attachment) => {
    const type = attachment.type || '';
    const url = attachment.url || '';
    const name = attachment.name || attachment.filename || 'Attachment';

    // Video files
    if (type.startsWith('video/')) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-300 bg-black">
          <video
            controls
            className="w-full"
            preload="metadata"
            style={{ maxHeight: '200px' }}
          >
            <source src={url} type={type} />
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    // Audio files
    if (type.startsWith('audio/')) {
      return (
        <div className="mt-2 p-3 bg-gray-900 rounded-lg">
          <audio controls className="w-full" preload="metadata">
            <source src={url} type={type} />
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    // Image files
    if (type.startsWith('image/')) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-300">
          <img
            src={url}
            alt={name}
            className="w-full h-32 object-cover"
          />
        </div>
      );
    }

    // PDF files - clickable to view
    if (type === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2 hover:bg-red-100 transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-700">PDF Document</div>
            <div className="text-xs text-red-600">Click to view</div>
          </div>
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ) : null;
    }

    // Other files - clickable to download
    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700">File attachment</div>
            <div className="text-xs text-gray-600">Click to download</div>
          </div>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      );
    }

    return null;
  };

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
          <div className="space-y-3">
            {recordings.map((recording, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg border border-gray-200/50 overflow-hidden"
              >
                <div className="flex items-center gap-2.5 text-sm text-gray-700 px-3 py-2.5">
                  <div className="w-2 h-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
                  <span className="capitalize font-medium">{recording.mode || 'recording'}</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-semibold">{Math.floor(recording.duration || 0)}s</span>
                </div>
                {renderRecordingPreview(recording)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {attachments && attachments.length > 0 && (
        <div className="spacing-sm">
          <p className="text-sm font-semibold text-gray-700 mb-2.5">Attachments</p>
          <div className="space-y-3">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-lg p-3 border border-blue-200/50"
              >
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <svg className="w-4 h-4 flex-shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="truncate font-medium">{attachment.name || attachment.filename || 'Attachment'}</span>
                </div>
                {renderAttachmentPreview(attachment)}
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