// src/hooks/useAttachmentUpload.js
import { useState } from 'react';

// Helper to detect MIME type from file extension
const getMimeTypeFromExtension = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes = {
    // Video
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    'm4v': 'video/x-m4v',
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

export function useAttachmentUpload() {
  const [uploads, setUploads] = useState([]);
  // uploads: [{ id, file, uploading, progress, error, result }]

  const uploadAttachment = async (file) => {
    const uploadId = `${Date.now()}-${file.name}`;

    // Detect MIME type from file extension if not provided
    const contentType = file.type || getMimeTypeFromExtension(file.name);

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
        detectedType: contentType,
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
          contentType: contentType,
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
        type: contentType,  // Use detected contentType instead of file.type
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