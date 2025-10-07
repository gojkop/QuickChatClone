// ============================================================================
// FILE 1: api/media/get-upload-url.js
// ============================================================================
// CREATE THIS NEW FILE
// Purpose: Generates TUS upload URLs from Cloudflare Stream

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { maxDurationSeconds = 90 } = req.body;

    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_STREAM_API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_STREAM_API_TOKEN) {
      console.error('Missing Cloudflare credentials');
      throw new Error('Cloudflare credentials not configured');
    }

    console.log('Requesting Direct Creator Upload URL...', {
      accountId: CLOUDFLARE_ACCOUNT_ID.substring(0, 8) + '...',
      maxDuration: maxDurationSeconds
    });

    // Request a Direct Creator Upload URL from Cloudflare
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds,
          requireSignedURLs: false,
          // ⭐ YOUR DOMAINS - NO PROTOCOL! Cloudflare rejects http:// or https://
          allowedOrigins: [
            'localhost:3000',
            'localhost:3001', 
            'quickchat-deploy.vercel.app',
            '*.vercel.app', // All Vercel deployments (including previews)
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudflare API error:', errorData);
      throw new Error(errorData.errors?.[0]?.message || 'Failed to get upload URL');
    }

    const data = await response.json();
    
    console.log('✅ Upload URL generated successfully:', {
      uid: data.result.uid,
      uploadURL: data.result.uploadURL.substring(0, 50) + '...',
    });

    return res.status(200).json({
      success: true,
      data: {
        uploadURL: data.result.uploadURL, // TUS endpoint URL
        uid: data.result.uid, // Video UID for later reference
      },
    });

  } catch (error) {
    console.error('❌ Get upload URL error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to get upload URL',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// ============================================================================
// FILE 2: src/hooks/useRecordingSegmentUpload.js
// ============================================================================
// REPLACE YOUR EXISTING FILE with this TUS implementation

import { useState, useCallback } from 'react';
import * as tus from 'tus-js-client';

/**
 * Hook for uploading video/audio segments using TUS protocol
 * Uploads directly to Cloudflare Stream, bypassing Vercel's 4.5MB limit
 */
export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);
  // segments: [{ id, blob, mode, segmentIndex, duration, uploading, progress, error, result, uploadInstance }]

  /**
   * Upload a recording segment using TUS protocol
   * @param {Blob} blob - The video/audio blob to upload
   * @param {string} mode - 'video', 'audio', 'screen', or 'screen-camera'
   * @param {number} segmentIndex - Index of this segment (0, 1, 2, etc.)
   * @param {number} duration - Duration in seconds
   */
  const uploadSegment = useCallback(async (blob, mode, segmentIndex, duration) => {
    const segmentId = `${Date.now()}-${segmentIndex}`;

    console.log('🚀 Starting TUS upload:', {
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
      uploadInstance: null,
    }]);

    try {
      // Step 1: Get TUS upload URL from Cloudflare via our Vercel endpoint
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

      // Step 2: Upload directly to Cloudflare using TUS
      return new Promise((resolve, reject) => {
        const upload = new tus.Upload(blob, {
          uploadUrl: uploadURL, // Use pre-created upload URL from Cloudflare
          resume: false, // Don't try to resume - this is a fresh upload
          removeFingerprintOnSuccess: true, // Clean up after completion
          retryDelays: [0, 3000, 5000, 10000, 20000], // Retry strategy
          chunkSize: 5242880, // 5MB chunks
          // No metadata - Cloudflare Direct Upload already has it

          onError: (error) => {
            console.error('❌ TUS upload error:', {
              segmentId,
              error: error.message,
              details: error,
            });
            
            setSegments(prev => prev.map(segment =>
              segment.id === segmentId
                ? { ...segment, uploading: false, error: error.message }
                : segment
            ));
            
            reject(error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
            
            console.log('📊 Upload progress:', {
              segmentId,
              percentage,
              bytesUploaded,
              bytesTotal,
            });
            
            setSegments(prev => prev.map(segment =>
              segment.id === segmentId
                ? { ...segment, progress: percentage }
                : segment
            ));
          },
          onSuccess: () => {
            console.log('✅ TUS upload complete:', {
              segmentId,
              uid,
              duration,
            });

            // Get Cloudflare Account ID from environment (Vite uses VITE_ prefix)
            const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
            
            // Construct the result object
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

            resolve(result);
          },
        });

        // Store upload instance for potential cancellation
        setSegments(prev => prev.map(segment =>
          segment.id === segmentId
            ? { ...segment, uploadInstance: upload }
            : segment
        ));

        // Start the upload
        console.log('⬆️ Starting TUS upload to Cloudflare...');
        upload.start();
      });

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
   * Cancel an in-progress upload
   */
  const cancelSegment = useCallback((segmentId) => {
    const segment = segments.find(s => s.id === segmentId);
    
    if (segment?.uploadInstance) {
      segment.uploadInstance.abort();
      console.log('🛑 Upload cancelled:', segmentId);
    }

    setSegments(prev => prev.filter(s => s.id !== segmentId));
  }, [segments]);

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
    // Cancel any in-progress uploads
    segments.forEach(segment => {
      if (segment.uploadInstance) {
        segment.uploadInstance.abort();
      }
    });
    console.log('🔄 Reset: cleared all segments');
    setSegments([]);
  }, [segments]);

  /**
   * Check if all uploads are complete
   */
  const allUploadsComplete = segments.length > 0 && 
    segments.every(s => s.result || s.error);

  /**
   * Check if any uploads are in progress
   */
  const hasUploadsInProgress = segments.some(s => s.uploading);

  // Expose hasUploading for backward compatibility with your existing code
  const hasUploading = hasUploadsInProgress;

  return {
    segments,
    uploadSegment,
    retrySegment,
    cancelSegment,
    removeSegment,
    getSuccessfulSegments,
    reset,
    allUploadsComplete,
    hasUploadsInProgress,
    hasUploading, // Backward compatibility
  };
}