import React, { useState } from 'react';
import { VideoIcon, MicIcon, MonitorIcon } from '../shared/SVGIcons';
import RecordingModal from './RecordingModal';
import RecordingSegmentList from './RecordingSegmentList';

function RecordingOptions({ segmentUpload, attachmentUpload, showScreenRecording = true, showAttachments = true }) {
  const [showModal, setShowModal] = useState(false);
  const [recordingMode, setRecordingMode] = useState(null);

  const handleStartRecording = (mode) => {
    setRecordingMode(mode);
    setShowModal(true);
  };

  const handleRecordingComplete = async (blob, duration, mode) => {
    // Close modal immediately
    setShowModal(false);
    
    // Start upload in background
    try {
      const segmentIndex = segmentUpload.segments.length;
      await segmentUpload.uploadSegment(blob, mode, segmentIndex, duration);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const hasRecordings = segmentUpload.segments.length > 0;
  const isScreenRecordingAvailable = typeof navigator !== 'undefined' && 
    navigator.mediaDevices?.getDisplayMedia;

  // Determine grid layout based on whether screen recording is shown
  const gridCols = showScreenRecording && isScreenRecordingAvailable 
    ? 'grid-cols-1 sm:grid-cols-3' 
    : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className="space-y-4">
      {/* Recording Options Grid */}
      <div className={`grid ${gridCols} gap-3`}>
        {/* Video */}
        <button
          onClick={() => handleStartRecording('video')}
          className="recording-option-btn"
        >
          <div className="recording-option-icon bg-blue-100">
            <VideoIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 text-sm">Video</div>
            <div className="text-xs text-gray-600">Camera</div>
          </div>
        </button>

        {/* Audio */}
        <button
          onClick={() => handleStartRecording('audio')}
          className="recording-option-btn"
        >
          <div className="recording-option-icon bg-orange-100">
            <MicIcon className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 text-sm">Audio</div>
            <div className="text-xs text-gray-600">Voice only</div>
          </div>
        </button>

        {/* Screen - Only if showScreenRecording is true */}
        {showScreenRecording && isScreenRecordingAvailable && (
          <button
            onClick={() => handleStartRecording('screen')}
            className="recording-option-btn"
          >
            <div className="recording-option-icon bg-purple-100">
              <MonitorIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-sm">Screen</div>
              <div className="text-xs text-gray-600">Share screen</div>
            </div>
          </button>
        )}
      </div>

      {/* Recording Segment List */}
      {hasRecordings && (
        <RecordingSegmentList
          segments={segmentUpload.segments}
          onRemove={segmentUpload.removeSegment}
          onRetry={segmentUpload.retrySegment}
          onReorder={segmentUpload.reorderSegments}
        />
      )}

      {/* Recording Modal */}
      {showModal && (
        <RecordingModal
          mode={recordingMode}
          onComplete={handleRecordingComplete}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default RecordingOptions;