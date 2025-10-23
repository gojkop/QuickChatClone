import React, { useState, useRef } from 'react';
import { VideoIcon, MicIcon } from '../shared/SVGIcons';
import RecordingModal from './RecordingModal';

function QuickRecordButton({ type, onComplete, segmentUpload }) {
  const [showModal, setShowModal] = useState(false);

  const handleStartRecording = () => {
    setShowModal(true);
  };

  const handleRecordingComplete = async (blob, duration, mode) => {
    try {
      const segmentIndex = segmentUpload.segments.length;
      await segmentUpload.uploadSegment(blob, mode, segmentIndex, duration);
      
      onComplete({
        blob,
        duration,
        mode,
        blobUrl: URL.createObjectURL(blob)
      });
      
      setShowModal(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={handleStartRecording}
        className="quick-record-btn"
      >
        <div className="quick-record-icon">
          {type === 'video' ? (
            <VideoIcon className="w-8 h-8 text-indigo-600" />
          ) : (
            <MicIcon className="w-8 h-8 text-indigo-600" />
          )}
        </div>
        <div className="text-left flex-1">
          <div className="font-bold text-gray-900 text-lg mb-1">
            {type === 'video' ? 'Record Video' : 'Record Audio'}
          </div>
          <div className="text-sm text-gray-600">
            {type === 'video' 
              ? 'Show your face or what you\'re working on'
              : 'Voice-only recording'}
          </div>
        </div>
      </button>

      {showModal && (
        <RecordingModal
          mode={type}
          onComplete={handleRecordingComplete}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default QuickRecordButton;