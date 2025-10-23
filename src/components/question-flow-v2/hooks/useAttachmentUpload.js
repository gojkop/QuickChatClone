// src/hooks/useAttachmentUpload.js
// FIXED VERSION - Uses FormData instead of JSON with base64

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
      // Update progress - preparing
      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, progress: 10 } : u
      ));

      console.log('📤 Uploading to backend using FormData...');

      // ✅ FIX: Use FormData instead of JSON with base64
      const formData = new FormData();
      formData.append('file', file);  // Backend expects 'file' field

      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, progress: 30 } : u
      ));

      const response = await fetch('/api/media/upload-attachment', {
        method: 'POST',
        // ✅ FIX: Don't set Content-Type - browser sets it with boundary
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, progress: 90 } : u
      ));

      const result = await response.json();
      console.log('✅ Attachment uploaded:', result);

      // Build attachment result
      const attachmentResult = {
        name: file.name,
        filename: file.name,  // Some backends use 'filename'
        type: file.type,
        size: file.size,
        url: result.url || result.data?.url,  // Handle different response formats
        ...result.data,  // Include any other data from response
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