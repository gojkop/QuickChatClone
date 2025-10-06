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
      // Step 1: Get signed upload URL from our backend
      const urlResponse = await fetch('/api/media/get-signed-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.clone().json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { data } = await urlResponse.json();
      const { videoId, uploadURL, accountId } = data;

      console.log('Got upload URL for video:', videoId);

      // Step 2: Upload blob directly to Cloudflare's signed URL
      const formData = new FormData();
      formData.append('file', blob, `segment-${segmentIndex}.webm`);

      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: formData,
        // No Authorization header needed - the URL itself is pre-authorized
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Cloudflare upload error:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);

      if (!uploadResult.success) {
        throw new Error('Cloudflare rejected the upload');
      }

      // Build playback URL
      const playbackUrl = `https://customer-${accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;

      const result = {
        uid: videoId,
        playbackUrl: playbackUrl,
        duration: duration || 0,
        mode: mode,
        size: blob.size,
        segmentIndex: segmentIndex,
      };

      setSegments(prev => prev.map(seg =>
        seg.id === uploadId
          ? { ...seg, uploading: false, progress: 100, result }
          : seg
      ));

      setUploading(false);
      console.log('Segment uploaded successfully:', result);
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

  const retrySegment = (uploadId) => {
    const segment = segments.find(s => s.id === uploadId);
    if (!segment) return;
    
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