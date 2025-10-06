import { useState } from 'react';
import * as tus from 'tus-js-client';

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

    return new Promise(async (resolve, reject) => {
      try {
        // Step 1: Get upload URL from backend
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

        // Step 2: Upload using TUS protocol
        const upload = new tus.Upload(blob, {
          endpoint: uploadURL,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            filename: `segment-${segmentIndex}-${Date.now()}.webm`,
            filetype: mode === 'video' ? 'video/webm' : 'audio/webm',
          },
          onError: (error) => {
            console.error('TUS upload error:', error);
            setSegments(prev => prev.map(seg =>
              seg.id === uploadId
                ? { ...seg, uploading: false, error: error.message }
                : seg
            ));
            setUploading(false);
            reject(error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            setSegments(prev => prev.map(seg =>
              seg.id === uploadId
                ? { ...seg, progress: parseFloat(percentage) }
                : seg
            ));
          },
          onSuccess: () => {
            console.log('Upload completed successfully');

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
            resolve(result);
          },
        });

        // Start the upload
        upload.start();

      } catch (error) {
        console.error('Upload setup error:', error);
        setSegments(prev => prev.map(seg =>
          seg.id === uploadId
            ? { ...seg, uploading: false, error: error.message }
            : seg
        ));
        setUploading(false);
        reject(error);
      }
    });
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