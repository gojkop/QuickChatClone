import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MonitorIcon, PaperclipIcon } from '../shared/SVGIcons';
import RecordingModal from './RecordingModal';

function AdvancedOptions({ text, onTextChange, attachmentUpload, segmentUpload, onRecordingComplete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScreenRecordModal, setShowScreenRecordModal] = useState(false);

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

  const handleScreenRecordingComplete = async (blob, duration, mode) => {
    try {
      const segmentIndex = segmentUpload.segments.length;
      await segmentUpload.uploadSegment(blob, mode, segmentIndex, duration);
      
      onRecordingComplete({
        blob,
        duration,
        mode,
        blobUrl: URL.createObjectURL(blob)
      });
      
      setShowScreenRecordModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const hasContent = text.trim().length > 0 || attachmentUpload.uploads.length > 0;
  const isScreenRecordingAvailable = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getDisplayMedia;

  return (
    <>
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
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
            {isScreenRecordingAvailable && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Screen Recording
                </label>
                <button
                  onClick={() => setShowScreenRecordModal(true)}
                  className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
                >
                  <MonitorIcon className="w-6 h-6 text-indigo-600" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">Record Screen</div>
                    <div className="text-xs text-gray-600">Show what's on your screen with audio</div>
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
                <div className="mt-3 space-y-2">
                  {attachmentUpload.uploads.map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex-1 min-w-0 mr-3">
                        <span className="text-gray-700 truncate block">{upload.file.name}</span>
                        <span className="text-xs text-gray-500">{formatFileSize(upload.file.size)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {upload.uploading && <span className="text-xs text-indigo-600">Uploading...</span>}
                        {upload.error && <span className="text-xs text-red-600">Failed</span>}
                        {upload.result && (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <button
                          onClick={() => attachmentUpload.removeUpload(upload.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Screen Recording Modal */}
      {showScreenRecordModal && (
        <RecordingModal
          mode="screen"
          onComplete={handleScreenRecordingComplete}
          onClose={() => setShowScreenRecordModal(false)}
        />
      )}
    </>
  );
}

export default AdvancedOptions;
