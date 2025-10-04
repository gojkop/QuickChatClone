// src/components/dashboard/AvatarUpload.jsx
import React, { useState } from 'react';
import apiClient from '@/api';
import AvatarEditor from './avatar/AvatarEditor';
import { readFile } from './avatar/avatarUtils';

function AvatarUpload({ currentAvatar, onChange }) {
  const [preview, setPreview] = useState(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
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

    setError(null);

    // Read file and open editor
    try {
      console.log('Reading file...');
      const imageSrc = await readFile(file);
      console.log('Image loaded, opening editor');
      setSelectedImageSrc(imageSrc);
      setIsEditorOpen(true);
      console.log('Editor state set to true');
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read image file');
    }
  };

  const handleEditExisting = async () => {
    if (!currentAvatar) return;
    setSelectedImageSrc(currentAvatar);
    setIsEditorOpen(true);
  };

  const handleSaveFromEditor = async (croppedBlob) => {
    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Upload to Cloudflare R2 via Vercel API
      const formData = new FormData();
      formData.append('image', croppedBlob, 'avatar.webp');

      console.log('Uploading to Vercel API...');
      const uploadResponse = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload to Cloudflare failed');
      }

      const { url } = await uploadResponse.json();
      console.log('Uploaded to Cloudflare:', url);

      // Step 2: Save URL to Xano
      console.log('Saving URL to Xano...');
      await apiClient.post('/upload/profile-picture', {
        image_url: url
      });

      onChange({ url });
      setPreview(url);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setPreview(currentAvatar);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-6">
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
          
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <label 
              htmlFor="avatar-upload" 
              className={`inline-block px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg cursor-pointer hover:bg-indigo-700 transition ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            
            {preview && !isUploading && (
              <button
                onClick={handleEditExisting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Edit
              </button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG or GIF. Max size 5MB. Image will be optimized for web.
          </p>
          
          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Avatar Editor Modal */}
      <AvatarEditor
        isOpen={isEditorOpen}
        onClose={() => {
          console.log('Editor closing');
          setIsEditorOpen(false);
          setSelectedImageSrc(null);
        }}
        imageSrc={selectedImageSrc}
        onSave={handleSaveFromEditor}
      />
    </>
  );
}

export default AvatarUpload;