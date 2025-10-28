// src/hooks/useRecordingSegmentUpload.js
// COMPLETE VERSION - Video to Stream, Audio to R2

import { useState, useCallback } from 'react';

export function useRecordingSegmentUpload() {
  const [segments, setSegments] = useState([]);

  const uploadSegment = useCallback(async (blob, mode, segmentIndex, duration, blobUrl = null) => {
    const segmentId = `${Date.now()}-${segmentIndex}`;

    console.log('🚀 Starting upload:', {
      segmentId,
      mode,
      segmentIndex,
      duration,
      blobSize: blob.size,
      blobType: blob.type,
      hasBlobUrl: !!blobUrl,
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
      // ⭐ ROUTE BASED ON MODE
      if (mode === 'audio') {
        // === AUDIO UPLOAD TO R2 ===
        console.log('🎤 Uploading audio to R2...');
        
        setSegments(prev => prev.map(s =>
          s.id === segmentId ? { ...s, progress: 10 } : s
        ));

        const uploadResponse = await fetch('/api/media/upload-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'audio/webm',
          },
          body: blob,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ R2 audio upload error:', errorText);
          throw new Error(`Audio upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const audioResult = await uploadResponse.json();
        console.log('✅ Audio uploaded to R2:', audioResult.data);

        const result = {
          uid: audioResult.data.uid,
          playbackUrl: audioResult.data.playbackUrl,
          blobUrl, // Preserve blobUrl for immediate playback
          duration,
          mode: 'audio',
          size: blob.size,
          segmentIndex,
        };

        setSegments(prev => prev.map(s =>
          s.id === segmentId
            ? { ...s, uploading: false, progress: 100, result }
            : s
        ));

        console.log('✅ Audio segment complete:', result);
        return result;
      }

      // === VIDEO/SCREEN UPLOAD TO STREAM (EXISTING CODE - UNCHANGED) ===
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

      // Step 2: Upload to Cloudflare using FormData
      console.log('📤 Uploading to Cloudflare...');
      
      setSegments(prev => prev.map(s =>
        s.id === segmentId ? { ...s, progress: 10 } : s
      ));

      // ✅ CRITICAL: Cloudflare expects FormData with 'file' field
      const formData = new FormData();
      formData.append('file', blob, `segment-${segmentIndex}.webm`);

      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: formData,
        // ⚠️ DO NOT set Content-Type - browser sets it with boundary
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Cloudflare error:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      console.log('✅ Upload successful!');

      // Step 2.5: Enable downloads for this video
      try {
        console.log('🔓 Enabling downloads for video:', uid);
        const enableResponse = await fetch('/api/media/enable-downloads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: uid }),
        });

        if (enableResponse.ok) {
          const enableResult = await enableResponse.json();
          if (enableResult.downloadsEnabled) {
            console.log('✅ Downloads enabled for video:', uid);
          } else {
            console.warn('⚠️ Downloads could not be enabled, but video uploaded successfully');
          }
        }
      } catch (error) {
        // Don't fail the upload if downloads can't be enabled
        console.warn('⚠️ Failed to enable downloads:', error.message);
      }

      // Step 3: Build result
      const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;

      const result = {
        uid,
        playbackUrl: accountId
          ? `https://customer-${accountId}.cloudflarestream.com/${uid}/manifest/video.m3u8`
          : null,
        blobUrl, // Preserve blobUrl for immediate playback while Stream processes
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