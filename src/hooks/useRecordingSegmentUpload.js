import { useState } from 'react';

// Helper function
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
  const [uploading, setUploading] = useState(false);

  const uploadSegment = async (blob, mode, segmentIndex, duration) => {
    const uploadId = `${Date.now()}-${segmentIndex}`;

    setSegments(prev => [...prev, {
      id: uploadId,
      segmentIndex,
      uploading: true,
      progress: 0,
      error: null,
      result: null,
    }]);

    setUploading(true);

    try {
      // Convert to base64
      const base64Data = await blobToBase64(blob);

      // Upload through backend
      const response = await fetch('/api/media/upload-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData: base64Data,
          mode,
          segmentIndex,
          duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.clone().json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setSegments(prev => prev.map(seg =>
        seg.id === uploadId
          ? { ...seg, uploading: false, progress: 100, result: result.data }
          : seg
      ));

      setUploading(false);
      return result.data;

    } catch (error) {
      console.error('Upload error:', error);
      
      setSegments(prev => prev.map(seg =>
        seg.id === uploadId
          ? { ...seg, uploading: false, error: error.message }
          : seg
      ));

      setUploading(false);
      throw error;
    }
  };

  const retrySegment = (uploadId) => {
    setSegments(prev => prev.map(s =>
      s.id === uploadId
        ? { ...s, error: 'Please re-record this segment' }
        : s
    ));
  };

  const removeSegment = (uploadId) => {
    setSegments(prev => prev.filter(s => s.id !== uploadId));
  };

  const getSuccessfulSegments = () => {
    return segments
      .filter(s => s.result)
      .map(s => s.result)
      .sort((a, b) => a.segmentIndex - b.segmentIndex);
  };

  const reset = () => {
    setSegments([]);
    setUploading(false);
  };

  return {
    segments,
    uploading,
    uploadSegment,
    retrySegment,
    removeSegment,
    getSuccessfulSegments,
    reset,
  };
}