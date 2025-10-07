// src/hooks/useRecordingSegmentUpload.js
// COMPLETE FIXED VERSION - Replace entire file with this

import { useState, useCallback } from 'react';

export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);

  const uploadSegment = useCallback(async (blob, mode, segmentIndex, duration) => {
    const segmentId = `${Date.now()}-${segmentIndex}`;

    console.log('🚀 Starting upload:', {
      segmentId,
      mode,
      segmentIndex,
      duration,
      blobSize: blob.size,
      blobType: blob.type,
    });

    // Validate blob
    if (!blob || blob.size === 0) {
      throw new Error('Invalid blob - size is 0 bytes');
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
      // Step 1: Get upload URL from backend
      console.log('📡 Requesting upload URL...');
      
      const urlResponse = await fetch('/api/media/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxDurationSeconds: 90,
        }),
      });

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { data: uploadData } = await urlResponse.json();
      const { uploadURL, uid } = uploadData;

      console.log('✅ Got upload URL:', { uid });

      // Step 2: Upload directly to Cloudflare
      console.log('📤 Uploading to Cloudflare...');
      
      setSegments(prev => prev.map(s =>
        s.id === segmentId ? { ...s, progress: 10 } : s
      ));

      // ✅ CRITICAL: Clean POST with NO headers
      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: blob, // Raw blob only
        // DO NOT set any headers - browser handles it
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Cloudflare error:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      console.log('✅ Upload successful!');

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
    if (!segment) {
      console.warn('⚠️ Segment not found:', segmentId);
      return;
    }

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
    console.log('🗑️ Removing segment:', segmentId);
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  }, []);

  const getSuccessfulSegments = useCallback(() => {
    return segments
      .filter(s => s.result)
      .map(s => s.result)
      .sort((a, b) => a.segmentIndex - b.segmentIndex);
  }, [segments]);

  const reset = useCallback(() => {
    console.log('🔄 Reset all segments');
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