// ============================================================================
// FILE: src/hooks/useRecordingSegmentUpload.js
// ============================================================================
// REPLACE ENTIRE FILE - Custom chunked uploader (no tus-js-client dependency)

import { useState, useCallback } from 'react';

/**
 * Hook for uploading video/audio segments using custom chunked upload
 * Uploads directly to Cloudflare Stream, bypassing Vercel's 4.5MB limit
 * NO TUS CLIENT LIBRARY - uses raw fetch for full control
 */
export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);

  /**
   * Upload entire blob in one request using TUS protocol
   * Cloudflare Direct Creator Upload expects full file, not chunks
   */
  const uploadEntireFile = async (blob, uploadURL, segmentId, onProgress) => {
    const totalSize = blob.size;

    console.log(`📤 Uploading entire file: ${totalSize} bytes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);

    // Simulate progress (we can't track real progress with single upload)
    onProgress(0, 0, totalSize);

    const response = await fetch(uploadURL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/offset+octet-stream',
        'Upload-Offset': '0',
        'Tus-Resumable': '1.0.0',
      },
      body: blob, // Send entire blob at once
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    onProgress(100, totalSize, totalSize);
    console.log('✅ Upload complete: 100%');
  };

  /**
   * Upload a recording segment
   */
  const uploadSegment = useCallback(async (blob, mode, segmentIndex, duration) => {
    const segmentId = `${Date.now()}-${segmentIndex}`;

    console.log('🚀 Starting custom chunked upload:', {
      segmentId,
      mode,
      segmentIndex,
      duration,
      blobSize: blob.size,
      blobType: blob.type,
    });

    // Add to segments list with initial state
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
      // Step 1: Get upload URL from Cloudflare
      console.log('📡 Requesting upload URL from Cloudflare...');
      
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

      console.log('✅ Got upload URL:', {
        uid,
        uploadURL: uploadURL.substring(0, 50) + '...',
      });

      // Step 2: Upload entire file at once
      await uploadEntireFile(
        blob,
        uploadURL,
        segmentId,
        (percentage, bytesUploaded, bytesTotal) => {
          setSegments(prev => prev.map(segment =>
            segment.id === segmentId
              ? { ...segment, progress: percentage }
              : segment
          ));
        }
      );

      // Step 3: Success!
      const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
      
      const result = {
        uid,
        playbackUrl: accountId 
          ? `https://customer-${accountId}.cloudflarestream.com/${uid}/manifest/video.m3u8`
          : `https://cloudflarestream.com/${uid}/manifest/video.m3u8`,
        duration,
        mode,
        size: blob.size,
        segmentIndex,
      };

      setSegments(prev => prev.map(segment =>
        segment.id === segmentId
          ? { ...segment, uploading: false, progress: 100, result }
          : segment
      ));

      console.log('✅ Upload complete:', result);
      return result;

    } catch (error) {
      console.error('❌ Upload segment error:', error);
      
      setSegments(prev => prev.map(segment =>
        segment.id === segmentId
          ? { ...segment, uploading: false, error: error.message }
          : segment
      ));
      
      throw error;
    }
  }, []);

  /**
   * Retry a failed segment upload
   */
  const retrySegment = useCallback(async (segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) {
      console.warn('⚠️ Segment not found for retry:', segmentId);
      return;
    }

    console.log('🔄 Retrying segment:', segmentId);

    // Reset error state
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

  /**
   * Remove a segment from the list
   */
  const removeSegment = useCallback((segmentId) => {
    console.log('🗑️ Removing segment:', segmentId);
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  }, []);

  /**
   * Get all successfully uploaded segments
   */
  const getSuccessfulSegments = useCallback(() => {
    return segments
      .filter(s => s.result)
      .map(s => s.result)
      .sort((a, b) => a.segmentIndex - b.segmentIndex);
  }, [segments]);

  /**
   * Reset all segments
   */
  const reset = useCallback(() => {
    console.log('🔄 Reset: cleared all segments');
    setSegments([]);
  }, []);

  /**
   * Check if all uploads are complete
   */
  const allUploadsComplete = segments.length > 0 && 
    segments.every(s => s.result || s.error);

  /**
   * Check if any uploads are in progress
   */
  const hasUploadsInProgress = segments.some(s => s.uploading);

  // Expose hasUploading for backward compatibility
  const hasUploading = hasUploadsInProgress;

  return {
    segments,
    uploadSegment,
    retrySegment,
    removeSegment,
    getSuccessfulSegments,
    reset,
    allUploadsComplete,
    hasUploadsInProgress,
    hasUploading,
  };
}