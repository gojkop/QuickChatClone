import { useState } from 'react';

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

      // Step 2: Upload directly to Cloudflare using TUS protocol
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      // TUS upload doesn't return JSON, just check status
      // The video ID (uid) was already provided in step 1

      // Extract account ID from upload URL
      const accountId = uploadURL.split('/')[4];
      const playbackUrl = `https://customer-${accountId}.cloudflarestream.com/${uid}/manifest/video.m3u8`;

      const result = {
        uid,
        playbackUrl,
        duration: duration || 0,
        mode,
        size: blob.size,
        segmentIndex,
      };

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

    setSegments(prev => prev.map(s =>
      s.id === uploadId
        ? { ...s, uploading: true, error: null, progress: 0 }
        : s
    ));

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