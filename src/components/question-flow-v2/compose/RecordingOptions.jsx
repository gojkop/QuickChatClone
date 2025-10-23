import React, { useState } from 'react';
import { VideoIcon, MicIcon, MonitorIcon, PaperclipIcon } from '../shared/SVGIcons';
import RecordingModal from './RecordingModal';

function RecordingOptions({ 
  segmentUpload, 
  attachmentUpload, 
  showScreenRecording = true, 
  showAttachFiles = true,
  showRecordingList = true 
}) {
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

  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files);
    
    if (newFiles.length + attachmentUpload.uploads.length > 3) {
      alert('Maximum 3 files allowed.');
      e.target.value = '';
      return;
    }

    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" is too large (max 5MB)`);
        e.target.value = '';
        return;
      }
    }

    for (const file of newFiles) {
      try {
        await attachmentUpload.uploadAttachment(file);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
    
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const hasAttachments = attachmentUpload.uploads.length > 0;
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

      {/* File Attachments - Only show if showAttachFiles is true */}
      {showAttachFiles && (
        <>
          <div>
            <label className="recording-option-btn cursor-pointer hover:border-indigo-500 hover:bg-indigo-50">
              <div className="recording-option-icon bg-green-100">
                <PaperclipIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900 text-sm">Attach Files</div>
                <div className="text-xs text-gray-600">PDFs, images, docs (max 3 files, 5MB each)</div>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                disabled={attachmentUpload.uploads.length >= 3}
                className="hidden"
              />
            </label>
          </div>

          {/* Attachments Display */}
          {hasAttachments && (
            <div className="space-y-2">
              {attachmentUpload.uploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm text-gray-700 truncate block">{upload.file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(upload.file.size)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {upload.uploading && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${upload.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-indigo-600">{upload.progress || 0}%</span>
                      </div>
                    )}
                    {upload.error && <span className="text-xs text-red-600">Failed</span>}
                    {upload.result && <span className="text-xs text-green-600 font-semibold">✓</span>}
                    <button
                      onClick={() => attachmentUpload.removeUpload(upload.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
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