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
      // Get upload endpoint and token
      const configResponse = await fetch('/api/media/get-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!configResponse.ok) {
        throw new Error('Failed to get upload configuration');
      }

      const { data } = await configResponse.json();
      const { uploadEndpoint, token, accountId } = data;

      // Upload directly to Cloudflare with multipart form
      const formData = new FormData();
      formData.append('file', blob, `segment-${segmentIndex}.webm`);

      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error('Cloudflare upload failed');
      }

      const uid = uploadResult.result.uid;
      const playbackUrl = `https://customer-${accountId}.cloudflarestream.com/${uid}/manifest/video.m3u8`;

      const result = {
        uid,
        playbackUrl,
        duration: duration || uploadResult.result.duration || 0,
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