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
  const [uploading, setUploading] = useState(false);

  const uploadSegment = async (blob, mode, segmentIndex, duration) => {
    console.log('=== UPLOAD SEGMENT CALLED ===');
    console.log('Blob size:', blob.size);
    console.log('Blob type:', blob.type);
    console.log('Mode:', mode);
    console.log('Segment index:', segmentIndex);
    console.log('Duration:', duration);
    
    const uploadId = `${Date.now()}-${segmentIndex}`;

    setSegments(prev => [...prev, {
      id: uploadId,
      blob,
      mode,
      segmentIndex,
      duration,
      uploading: true,
      error: null,
      result: null,
    }]);

    try {
      // Convert blob to base64
      const base64DataUrl = await blobToBase64(blob);
      
      // ⭐ FIX: Extract just the base64 part (remove the data URL prefix)
      const base64Data = base64DataUrl.split(',')[1];
      
      console.log('Base64 data length:', base64Data.length);
      
      // ⭐ FIX: Send the correct payload structure
      const response = await fetch('/api/media/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64: base64Data,  // ⭐ This must match what the backend expects
          recordingMode: mode,
          segmentIndex,
          duration,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

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