import { useState } from 'react';

// Helper function to convert blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // ⭐ FIX: Ensure we have the complete result
      const result = reader.result;
      console.log('FileReader result type:', typeof result);
      console.log('FileReader result length:', result ? result.length : 0);
      console.log('FileReader result preview:', result ? result.substring(0, 100) : 'null');
      
      if (!result) {
        reject(new Error('FileReader returned empty result'));
        return;
      }
      
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('FileReader failed: ' + reader.error));
    };
    // ⭐ CRITICAL: Use readAsDataURL (not readAsText or readAsBinaryString)
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
      
      console.log('Full base64DataUrl length:', base64DataUrl.length);
      console.log('Base64DataUrl starts with:', base64DataUrl.substring(0, 50));
      
      // ⭐ FIX: More robust splitting
      const parts = base64DataUrl.split(',');
      console.log('Split parts count:', parts.length);
      
      if (parts.length !== 2) {
        throw new Error(`Invalid data URL format. Expected 2 parts, got ${parts.length}`);
      }
      
      const base64Data = parts[1];
      
      if (!base64Data || base64Data.length < 100) {
        throw new Error(`Base64 data too short: ${base64Data ? base64Data.length : 0} bytes`);
      }
      
      console.log('Base64 data length:', base64Data.length);
      console.log('Base64 data preview:', base64Data.substring(0, 100));
      
      const response = await fetch('/api/media/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64: base64Data,
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