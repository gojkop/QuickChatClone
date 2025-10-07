// src/hooks/useRecordingSegmentUpload.js
import { useState, useCallback } from 'react';

/**
 * Hook for uploading video/audio segments to Cloudflare Stream
 * Uses Direct Creator Upload (simple POST)
 */
export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);

  const uploadSegment = useCallback(async (blob, mode, segmentIndex, duration) => {
    const segmentId = `${Date.now()}-${segmentIndex}`;

    console.log('🚀 Starting upload:', {
      segmentId,
      mode,
      duration,
      blobSize: blob.size,
      blobType: blob.type,
    });

    // CRITICAL: Verify blob is valid
    if (!blob || blob.size === 0) {
      throw new Error('Invalid blob - size is 0 bytes. Recording may have failed.');
    }

    // Add to segments list
    setSegments(prev => [...prev, {
      id: segmentId,
      blob,
      mode,
      segmentIndex,
      duration,
      uploading: true,
      progress: 0,
      error: null,
      result: null,
    }]);

    try {
      // Step 1: Get upload URL from YOUR backend
      console.log('📡 Requesting upload URL...');
      
      const urlResponse = await fetch('/api/media/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxDurationSeconds: 90,
          metadata: {
            mode,
            segmentIndex,
            duration
          }
        }),
      });

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { data: uploadData } = await urlResponse.json();
      const { uploadURL, uid } = uploadData;

      console.log('✅ Got upload URL for video:', uid);

      // Step 2: Upload DIRECTLY to Cloudflare
      // ⚠️ CRITICAL: Send raw blob, no TUS headers for Direct Creator Upload
      console.log('📤 Uploading to Cloudflare Stream...');
      
      setSegments(prev => prev.map(s =>
        s.id === segmentId ? { ...s, progress: 10 } : s
      ));

      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: blob, // ✅ Raw blob - NO FormData, NO JSON
        // ⚠️ Don't set Content-Type - let browser set it with boundary
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Cloudflare upload failed:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      console.log('✅ Upload complete!');

      // Step 3: Build result
      const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
      
      const result = {
        uid,
        playbackUrl: accountId 
          ? `https://customer-${accountId}.cloudflarestream.com/${uid}/manifest/video.m3u8`
          : null,
        duration,
        mode,
        size: blob.size,
        segmentIndex,
      };

      setSegments(prev => prev.map(s =>
        s.id === segmentId
          ? { ...s, uploading: false, progress: 100, result }
          : s
      ));

      console.log('✅ Segment uploaded:', result);
      return result;

    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      setSegments(prev => prev.map(s =>
        s.id === segmentId
          ? { ...s, uploading: false, error: error.message }
          : s
      ));
      
      throw error;
    }
  }, []);

  const retrySegment = useCallback(async (segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;

    console.log('🔄 Retrying segment:', segmentId);

    setSegments(prev => prev.map(s =>
      s.id === segmentId
        ? { ...s, uploading: true, error: null, progress: 0 }
        : s
    ));

    try {
      await uploadSegment(segment.blob, segment.mode, segment.segmentIndex, segment.duration);
    } catch (error) {
      console.error('❌ Retry failed:', error);
    }
  }, [segments, uploadSegment]);

  const removeSegment = useCallback((segmentId) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  }, []);

  const getSuccessfulSegments = useCallback(() => {
    return segments
      .filter(s => s.result)
      .map(s => s.result)
      .sort((a, b) => a.segmentIndex - b.segmentIndex);
  }, [segments]);

  const reset = useCallback(() => {
    setSegments([]);
  }, []);

  const hasUploading = segments.some(s => s.uploading);
  const hasErrors = segments.some(s => s.error);

  return {
    segments,
    uploadSegment,
    retrySegment,
    removeSegment,
    getSuccessfulSegments,
    reset,
    hasUploading,
    hasErrors,
  };
}