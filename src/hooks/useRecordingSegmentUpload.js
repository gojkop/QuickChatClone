// src/hooks/useRecordingSegmentUpload.js
import { useState } from 'react';

export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);

  const uploadSegment = async (blob, mode, segmentIndex) => {
    const uploadId = `${Date.now()}-${segmentIndex}`;

    // Add to segments list
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
      // Convert blob to base64
      const base64 = await blobToBase64(blob);

      // ⭐ FIX: Get duration from blob if available
      let duration = 0;
      if (blob.type.startsWith('video/') || blob.type.startsWith('audio/')) {
        try {
          duration = await getBlobDuration(blob);
        } catch (e) {
          console.warn('Could not determine blob duration:', e);
        }
      }

      console.log('Uploading segment:', { mode, segmentIndex, size: blob.size, duration });

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

      // ⭐ BETTER ERROR HANDLING
      if (!response.ok) {
        let errorMessage = `Upload failed (${response.status})`;
        
        try {
          // Try to parse as JSON
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If not JSON, get the text (probably HTML error page)
          const errorText = await response.text();
          console.error('Backend returned non-JSON response:', errorText.substring(0, 500));
          errorMessage = `Server error (${response.status}). Check backend logs.`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Segment uploaded successfully:', result);

      // Update segment state
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

    // Reset error state
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

// Helper function
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}