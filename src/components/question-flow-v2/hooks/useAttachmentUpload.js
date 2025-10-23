// src/hooks/useAttachmentUpload.js
// ENHANCED VERSION with Progress Tracking

import { useState, useCallback } from 'react';

export function useAttachmentUpload() {
  const [uploads, setUploads] = useState([]);

  const uploadAttachment = useCallback(async (file) => {
    const uploadId = `${Date.now()}-${Math.random()}`;

    console.log('📎 Starting attachment upload:', {
      uploadId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Add to uploads list
    setUploads(prev => [...prev, {
      id: uploadId,
      file,
      uploading: true,
      progress: 0,
      error: null,
      result: null,
    }]);

    try {
      // Convert file to base64
      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, progress: 20 } : u
      ));

      const base64 = await fileToBase64(file);

      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, progress: 50 } : u
      ));

      console.log('📤 Uploading to backend...');

      const response = await fetch('/api/media/upload-attachment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          data: base64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, progress: 90 } : u
      ));

      const result = await response.json();
      console.log('✅ Attachment uploaded:', result.data);

      const attachmentResult = {
        name: file.name,
        type: file.type,
        data: result.data.data || base64,
        url: result.data.url,
        size: file.size,
      };

      setUploads(prev => prev.map(u =>
        u.id === uploadId
          ? { ...u, uploading: false, progress: 100, result: attachmentResult }
          : u
      ));

      return attachmentResult;
    } catch (error) {
      console.error('❌ Attachment upload failed:', error);
      
      setUploads(prev => prev.map(u =>
        u.id === uploadId
          ? { ...u, uploading: false, error: error.message }
          : u
      ));
      
      throw error;
    }
  }, []);

  const retryUpload = useCallback(async (uploadId) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload) {
      console.warn('⚠️ Upload not found:', uploadId);
      return;
    }

    console.log('🔄 Retrying upload:', uploadId);

    setUploads(prev => prev.map(u =>
      u.id === uploadId
        ? { ...u, uploading: true, error: null, progress: 0 }
        : u
    ));

    try {
      await uploadAttachment(upload.file);
    } catch (error) {
      console.error('❌ Retry failed:', error);
    }
  }, [uploads, uploadAttachment]);

  const removeUpload = useCallback((uploadId) => {
    console.log('🗑️ Removing upload:', uploadId);
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  }, []);

  const reset = useCallback(() => {
    console.log('🔄 Reset all uploads');
    setUploads([]);
  }, []);

  return {
    uploads,
    uploadAttachment,
    retryUpload,
    removeUpload,
    reset,
  };
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}