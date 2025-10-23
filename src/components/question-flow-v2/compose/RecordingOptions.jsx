import React, { useState } from 'react';
import { VideoIcon, MicIcon, MonitorIcon, PaperclipIcon, CheckCircleIcon, TrashIcon } from '../shared/SVGIcons';
import RecordingModal from './RecordingModal';

function RecordingOptions({ segmentUpload, attachmentUpload }) {
  const [showModal, setShowModal] = useState(false);
  const [recordingMode, setRecordingMode] = useState(null);

  const handleStartRecording = (mode) => {
    setRecordingMode(mode);
    setShowModal(true);
  };

  const handleRecordingComplete = async (blob, duration, mode) => {
    try {
      const segmentIndex = segmentUpload.segments.length;
      await segmentUpload.uploadSegment(blob, mode, segmentIndex, duration);
      setShowModal(false);
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

  const hasRecordings = segmentUpload.segments.length > 0;
  const hasAttachments = attachmentUpload.uploads.length > 0;
  const isScreenRecordingAvailable = typeof navigator !== 'undefined' && 
    navigator.mediaDevices?.getDisplayMedia;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Add Media & Files
        <span className="text-gray-500 font-normal ml-2">(Choose all that apply)</span>
      </label>

      {/* Recording Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

        {/* Screen */}
        {isScreenRecordingAvailable && (
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

      {/* File Attachments */}
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

      {/* Recordings Display */}
      {hasRecordings && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900">
              {segmentUpload.segments.length} recording{segmentUpload.segments.length > 1 ? 's' : ''} added
            </span>
          </div>
          {segmentUpload.hasUploading && (
            <p className="text-xs text-indigo-700 font-medium">Uploading in background...</p>
          )}
        </div>
      )}

      {/* Attachments Display */}
      {hasAttachments && (
        <div className="space-y-2">
          {attachmentUpload.uploads.map((upload) => (
            <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="flex-1 min-w-0 mr-3">
                <span className="text-sm text-gray-700 truncate block font-medium">{upload.file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(upload.file.size)}</span>
              </div>
              <div className="flex items-center gap-2">
                {upload.uploading && <span className="text-xs text-indigo-600 font-medium">Uploading...</span>}
                {upload.error && <span className="text-xs text-red-600 font-medium">Failed</span>}
                {upload.result && (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                )}
                <button
                  onClick={() => attachmentUpload.removeUpload(upload.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="text-xs font-semibold hidden sm:inline">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
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