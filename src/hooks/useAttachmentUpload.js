// ============================================
// FILE: src/hooks/useAttachmentUpload.js
// Hook for progressive attachment upload
// ============================================
import { useState } from 'react';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useAttachmentUpload() {
  const [uploads, setUploads] = useState([]);

  const uploadAttachment = async (file) => {
    const uploadId = `${Date.now()}-${file.name}`;

    setUploads(prev => [...prev, {
      id: uploadId,
      file,
      uploading: true,
      progress: 0,
      error: null,
      result: null,
    }]);

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch('/api/media/upload-attachment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: {
            name: file.name,
            type: file.type,
            data: base64.split(',')[1],
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      setUploads(prev => prev.map(upload => 
        upload.id === uploadId
          ? { ...upload, uploading: false, progress: 100, result: result.data }
          : upload
      ));

      return result.data;

    } catch (error) {
      setUploads(prev => prev.map(upload =>
        upload.id === uploadId
          ? { ...upload, uploading: false, error: error.message }
          : upload
      ));
      throw error;
    }
  };

  const retryUpload = async (uploadId) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload || !upload.file) return;

    setUploads(prev => prev.map(u =>
      u.id === uploadId
        ? { ...u, uploading: true, error: null, progress: 0 }
        : u
    ));

    try {
      await uploadAttachment(upload.file);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const removeUpload = (uploadId) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  };

  const reset = () => {
    setUploads([]);
  };

  return {
    uploads,
    uploadAttachment,
    retryUpload,
    removeUpload,
    reset,
  };
}