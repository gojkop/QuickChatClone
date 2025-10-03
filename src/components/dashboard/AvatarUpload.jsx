// src/components/dashboard/AvatarUpload.jsx
import React, { useState } from 'react';
import apiClient from '@/api';

function AvatarUpload({ currentAvatar, onChange }) {
  const [preview, setPreview] = useState(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to Xano backend
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Use apiClient which already has correct base URL and auth headers
      const response = await apiClient.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      
      // Pass URL back to parent (which will save to Xano)
      onChange({
        url: result.url,
      });
      
      setPreview(result.url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
      setPreview(currentAvatar); // Revert preview
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      {/* Avatar Preview */}
      <div className="relative">
        {preview ? (
          <img 
            src={preview} 
            alt="Profile" 
            className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </div>
        )}
        
        {/* Upload indicator */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1">
        <label 
          htmlFor="avatar-upload" 
          className={`inline-block px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-indigo-700 transition ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading...' : 'Change Photo'}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG or GIF. Max size 5MB.
        </p>
        
        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}

export default AvatarUpload;