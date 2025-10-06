import { useState } from 'react';

export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const uploadSegment = async (blob, mode, segmentIndex, duration) => {
    const uploadId = `${Date.now()}-${segmentIndex}`;

    // Add to segments list with pending status
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
      // Step 1: Get upload URL from our backend
      const urlResponse = await fetch('/api/media/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
        }),
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { data } = await urlResponse.json();
      const { uid, uploadURL } = data;

      // Step 2: Upload directly to Cloudflare
      const formData = new FormData();
      formData.append('file', blob, `segment-${segmentIndex}-${Date.now()}.webm`);

      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload to Cloudflare failed');
      }

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error('Cloudflare upload failed');
      }

      // Build playback URL
      const CLOUDFLARE_ACCOUNT_ID = uploadURL.split('/')[4]; // Extract from upload URL
      const playbackUrl = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/manifest/video.m3u8`;

      const result = {
        uid,
        playbackUrl,
        duration: duration || 0,
        mode,
        size: blob.size,
        segmentIndex,
      };

      // Update segment status
      setSegments(prev => prev.map(seg =>
        seg.id === uploadId
          ? { ...seg, uploading: false, progress: 100, result }
          : seg
      ));

      setUploading(false);
      return result;

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

  const retrySegment = async (uploadId) => {
    const segment = segments.find(s => s.id === uploadId);
    if (!segment) return;

    // Reset and retry
    setSegments(prev => prev.map(s =>
      s.id === uploadId
        ? { ...s, uploading: true, error: null, progress: 0 }
        : s
    ));

    // You'd need to store the original blob to retry
    // For now, just show error that retry needs re-recording
    setSegments(prev => prev.map(s =>
      s.id === uploadId
        ? { ...s, uploading: false, error: 'Please re-record this segment' }
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