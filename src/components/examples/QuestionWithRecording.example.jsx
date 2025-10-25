import React, { useState } from 'react';
import { useRecordingSegments } from '@/hooks/useRecordingSegments';

/**
 * EXAMPLE: How to lazy-load recording segments for a question
 *
 * This pattern ensures recording segments are only fetched when needed,
 * dramatically improving initial page load performance.
 *
 * Usage:
 * 1. Display question details immediately (from paginated /me/questions - max 10 per page)
 * 2. Only fetch recording segments when user expands/views the question
 * 3. Cache the segments for subsequent views
 */
function QuestionWithRecording({ question }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only fetch segments when expanded (lazy loading)
  const {
    data: recordingSegments,
    isLoading: segmentsLoading,
    error: segmentsError,
  } = useRecordingSegments(
    isExpanded ? question.id : null, // Only fetch if expanded
    { enabled: isExpanded && question.has_recording }
  );

  return (
    <div className="border rounded-lg p-4">
      {/* Question details - always visible */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{question.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{question.text}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>From: {question.payer_first_name} {question.payer_last_name}</span>
            <span>Status: {question.status}</span>
            {question.has_recording && (
              <span className="text-indigo-600">📹 Has recording</span>
            )}
          </div>
        </div>

        {question.has_recording && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            {isExpanded ? 'Hide Recording' : 'View Recording'}
          </button>
        )}
      </div>

      {/* Recording segments - lazy loaded */}
      {isExpanded && question.has_recording && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-3">Recording Segments</h4>

          {segmentsLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-gray-500 mt-2">Loading recording...</p>
            </div>
          )}

          {segmentsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              Failed to load recording: {segmentsError.message}
            </div>
          )}

          {!segmentsLoading && !segmentsError && recordingSegments && (
            <div className="space-y-2">
              {recordingSegments.length === 0 ? (
                <p className="text-gray-500 text-sm">No recording segments available</p>
              ) : (
                recordingSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-700 font-semibold">
                          {segment.segment_index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Segment {segment.segment_index + 1}
                        </p>
                        <p className="text-xs text-gray-500">
                          Duration: {segment.duration_sec}s • Mode: {segment.metadata?.mode || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={segment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Play
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionWithRecording;
