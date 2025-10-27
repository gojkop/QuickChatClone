import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MonitorIcon, PaperclipIcon } from '../shared/SVGIcons';
import RecordingModal from './RecordingModal';

function AdvancedOptions({ text, onTextChange, attachmentUpload, segmentUpload, onRecordingComplete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  const handleStartScreenRecording = () => {
    setShowRecordingModal(true);
  };

  const handleRecordingComplete = async (blob, duration, mode) => {
    try {
      const segmentIndex = segmentUpload.segments.length;
      await segmentUpload.uploadSegment(blob, mode, segmentIndex, duration);
      setShowRecordingModal(false);
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

  // Helper to render attachment preview based on file type
  const renderAttachmentPreview = (upload) => {
    const file = upload.file;
    const type = file.type || '';
    const name = file.name || '';

    // Create preview URL for uploaded file
    const previewUrl = upload.result?.url || (file ? URL.createObjectURL(file) : null);

    if (!previewUrl && !upload.uploading) return null;

    // Video files
    if (type.startsWith('video/')) {
      return upload.result?.url ? (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-300">
          <video
            controls
            className="w-full"
            preload="metadata"
            style={{ maxHeight: '200px' }}
          >
            <source src={upload.result.url} type={type} />
            Your browser does not support video playback.
          </video>
        </div>
      ) : null;
    }

    // Audio files
    if (type.startsWith('audio/')) {
      return upload.result?.url ? (
        <div className="mt-2 p-3 bg-gray-900 rounded-lg">
          <audio controls className="w-full" preload="metadata">
            <source src={upload.result.url} type={type} />
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : null;
    }

    // Image files
    if (type.startsWith('image/')) {
      return previewUrl ? (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-300">
          <img
            src={previewUrl}
            alt={name}
            className="w-full h-32 object-cover"
          />
        </div>
      ) : null;
    }

    // PDF files - show icon
    if (type === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
      return (
        <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-semibold text-red-700">PDF Document</span>
        </div>
      );
    }

    return null;
  };

  const hasContent = text.trim().length > 0 || attachmentUpload.uploads.length > 0;

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <span className="font-semibold text-gray-900">Advanced Options</span>
          {hasContent && !isExpanded && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
              Content added
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white">
          {/* Screen Recording */}
          {typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Screen Recording
              </label>
              <button
                onClick={handleStartScreenRecording}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
              >
                <MonitorIcon className="w-6 h-6 text-indigo-600" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Record Screen</div>
                  <div className="text-xs text-gray-600">Show what's on your screen</div>
                </div>
              </button>
            </div>
          )}

          {/* Written Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Written Details
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-sm"
              rows="3"
              maxLength="5000"
              placeholder="Add context, links, or background info..."
            />
            <div className="text-right text-xs text-gray-500 mt-1">{text.length} / 5000</div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Attach Files
              <span className="text-gray-500 font-normal ml-2">(Max 3, 5MB each)</span>
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              disabled={attachmentUpload.uploads.length >= 3}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
            
            {attachmentUpload.uploads.length > 0 && (
              <div className="mt-3 space-y-3">
                {attachmentUpload.uploads.map((upload) => (
                  <div key={upload.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                      <div className="flex-1 min-w-0 mr-3">
                        <span className="text-gray-700 truncate block font-medium">{upload.file.name}</span>
                        <span className="text-xs text-gray-500">{formatFileSize(upload.file.size)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {upload.uploading && <span className="text-xs text-indigo-600 font-semibold">Uploading...</span>}
                        {upload.error && <span className="text-xs text-red-600 font-semibold">Failed</span>}
                        {upload.result && <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>}
                        <button
                          onClick={() => attachmentUpload.removeUpload(upload.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {renderAttachmentPreview(upload)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recording Modal */}
      {showRecordingModal && (
        <RecordingModal
          mode="screen"
          onComplete={handleRecordingComplete}
          onClose={() => setShowRecordingModal(false)}
        />
      )}
    </div>
  );
}

export default AdvancedOptions;