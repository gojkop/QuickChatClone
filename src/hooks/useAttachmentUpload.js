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
      // Convert to base64
      const base64 = await fileToBase64(file);

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const response = await fetch('/api/media/upload-attachment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: {
            name: file.name,
            type: file.type || 'application/octet-stream',  // ⭐ ENSURE type is always present
            data: base64.split(',')[1], // Remove data URL prefix
          },
        }),
      });

      if (!response.ok) {
        let errorMessage = `Upload failed (${response.status})`;
        
        try {
          // Clone response to avoid "body consumed" error
          const errorData = await response.clone().json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Could not parse error response');
          errorMessage = `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('File uploaded successfully:', result.data);

      // Update upload state
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId
          ? { ...upload, uploading: false, progress: 100, result: result.data }
          : upload
      ));

      return result.data;

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