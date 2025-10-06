// ============================================
// FILE: src/hooks/useRecordingSegmentUpload.js
// Hook for uploading multiple recording segments
// ============================================
import { useState } from 'react';

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);

  const uploadSegment = async (blob, mode, segmentIndex) => {
    const segmentId = `segment-${Date.now()}-${segmentIndex}`;

    // Add to segments list
    setSegments(prev => [...prev, {
      id: segmentId,
      index: segmentIndex,
      uploading: true,
      progress: 0,
      error: null,
      result: null,
    }]);

    try {
      // Convert blob to base64
      const base64 = await blobToBase64(blob);

      // Upload to API
      const response = await fetch('/api/media/upload-recording-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordingBlob: base64,
          recordingMode: mode,
          segmentIndex: segmentIndex,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      // Update segment state
      setSegments(prev => prev.map(segment => 
        segment.id === segmentId
          ? { ...segment, uploading: false, progress: 100, result: result.data }
          : segment
      ));

      return result.data;

    } catch (error) {
      setSegments(prev => prev.map(segment =>
        segment.id === segmentId
          ? { ...segment, uploading: false, error: error.message }
          : segment
      ));
      throw error;
    }
  };

  const retrySegment = async (segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;

    setSegments(prev => prev.map(s =>
      s.id === segmentId
        ? { ...s, uploading: true, error: null, progress: 0 }
        : s
    ));

    console.log('Retry segment:', segmentId);
  };

  const removeSegment = (segmentId) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  };

  const reset = () => {
    setSegments([]);
  };

  const getSuccessfulSegments = () => {
    return segments
      .filter(s => s.result)
      .map(s => s.result)
      .sort((a, b) => a.segmentIndex - b.segmentIndex);
  };

  return {
    segments,
    uploadSegment,
    retrySegment,
    removeSegment,
    reset,
    getSuccessfulSegments,
    hasUploading: segments.some(s => s.uploading),
    hasErrors: segments.some(s => s.error),
  };
}