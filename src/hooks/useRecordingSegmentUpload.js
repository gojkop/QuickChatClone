// src/hooks/useRecordingSegmentUpload.js
import { useState } from 'react';

// Helper function MUST be defined BEFORE the hook
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

  const uploadSegment = async (blob, mode, segmentIndex, duration = 0) => {
    const uploadId = `${Date.now()}-${segmentIndex}`;

    setSegments(prev => [...prev, {
      id: uploadId,
      blob,
      mode,
      segmentIndex,
      uploading: true,
      error: null,
      result: null,
    }]);

    try {
      const base64 = await blobToBase64(blob);
      
      console.log('Uploading segment with duration:', duration);

      const response = await fetch('/api/media/upload-recording-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordingBlob: base64,
          recordingMode: mode,
          segmentIndex: segmentIndex,
          duration: duration,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Upload failed (${response.status})`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error('Backend returned non-JSON response:', errorText.substring(0, 500));
          errorMessage = `Server error (${response.status}). Check backend logs.`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Segment uploaded successfully:', result);

      setSegments(prev => prev.map(seg => 
        seg.id === uploadId
          ? { ...seg, uploading: false, result: result.data }
          : seg
      ));

      return result.data;

    } catch (error) {
      console.error('Upload error:', error);
      
      setSegments(prev => prev.map(seg =>
        seg.id === uploadId
          ? { ...seg, uploading: false, error: error.message }
          : seg
      ));
      
      throw error;
    }
  };

  const retrySegment = async (segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment || !segment.blob) return;

    setSegments(prev => prev.map(s =>
      s.id === segmentId
        ? { ...s, uploading: true, error: null }
        : s
    ));

    try {
      await uploadSegment(segment.blob, segment.mode, segment.segmentIndex);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const removeSegment = (segmentId) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  };

  const getSuccessfulSegments = () => {
    return segments
      .filter(s => s.result)
      .map(s => s.result);
  };

  const hasUploading = segments.some(s => s.uploading);
  const hasErrors = segments.some(s => s.error);

  return {
    segments,
    uploadSegment,
    retrySegment,
    removeSegment,
    getSuccessfulSegments,
    hasUploading,
    hasErrors,
  };
}