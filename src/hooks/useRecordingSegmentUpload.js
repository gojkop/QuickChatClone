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
    // Step 1: Get presigned upload URL
    const urlResponse = await fetch('/api/media/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segmentIndex,
        mode,
        duration,
      }),
    });

    if (!urlResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { data: { uploadUrl, fileName } } = await urlResponse.json();

    // Step 2: Upload directly to R2
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/webm',
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error('R2 upload failed');
    }

    console.log('✅ Uploaded to R2:', fileName);

    // Step 3: Trigger Stream transcoding
    const streamResponse = await fetch('/api/media/trigger-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        segmentIndex,
        mode,
        duration,
      }),
    });

    if (!streamResponse.ok) {
      throw new Error('Stream trigger failed');
    }

    const result = await streamResponse.json();

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