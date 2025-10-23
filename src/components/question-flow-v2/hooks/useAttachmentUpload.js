// ALTERNATIVE VERSION - Sends raw file (binary) like audio uploads

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
      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, progress: 20 } : u
      ));

      console.log('📤 Uploading file as binary (like audio)...');

      // ✅ ALTERNATIVE: Send raw file (like audio upload does)
      const response = await fetch('/api/media/upload-attachment', {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',  // Use file's MIME type
          'X-File-Name': encodeURIComponent(file.name),              // Pass filename in header
          'X-File-Size': file.size.toString(),                       // Pass size in header
        },
        body: file,  // ✅ Send raw file, not JSON or FormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorText;
        } catch {
          errorMessage = errorText;
        }
        
        console.error('❌ Backend error response:', errorText);
        throw new Error(errorMessage || `Upload failed with status ${response.status}`);
      }

      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, progress: 90 } : u
      ));

      const result = await response.json();
      console.log('✅ Attachment uploaded:', result);

      const attachmentResult = {
        name: file.name,
        filename: file.name,
        type: file.type,
        size: file.size,
        url: result.url || result.data?.url || result.playbackUrl,
        data: result.data,
        ...result,
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