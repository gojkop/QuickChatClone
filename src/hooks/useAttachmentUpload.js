// src/hooks/useAttachmentUpload.js
import { useState } from 'react';

export function useAttachmentUpload() {
  const [uploads, setUploads] = useState([]);
  // uploads: [{ id, file, uploading, progress, error, result }]

  const uploadAttachment = async (file) => {
    const uploadId = `${Date.now()}-${file.name}`;

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
      console.log('📤 Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeMB: (file.size / 1024 / 1024).toFixed(2)
      });

      // Step 1: Get presigned upload URL from backend
      console.log('📝 Getting presigned URL...');
      setUploads(prev => prev.map(upload =>
        upload.id === uploadId ? { ...upload, progress: 10 } : upload
      ));

      const urlResponse = await fetch('/api/media/get-attachment-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json();
        throw new Error(errorData.error || `Failed to get upload URL (${urlResponse.status})`);
      }

      const { data: uploadData } = await urlResponse.json();
      console.log('✅ Got presigned URL:', { key: uploadData.key });

      // Step 2: Upload directly to R2 using presigned URL
      console.log('📤 Uploading to R2...');
      setUploads(prev => prev.map(upload =>
        upload.id === uploadId ? { ...upload, progress: 30 } : upload
      ));

      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ R2 upload failed:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      console.log('✅ File uploaded successfully to R2');

      const result = {
        name: file.name,
        url: uploadData.publicUrl,
        type: file.type || 'application/octet-stream',
        size: file.size,
      };

      // Update upload state
      setUploads(prev => prev.map(upload =>
        upload.id === uploadId
          ? { ...upload, uploading: false, progress: 100, result: result }
          : upload
      ));

      return result;

    } catch (error) {
      console.error('Upload error:', error);
      
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

    // Remove old upload and try again
    setUploads(prev => prev.filter(u => u.id !== uploadId));
    
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

// Helper function
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}