// client/src/components/dashboard/AvatarUpload.jsx
import React, { useState, useRef } from 'react';
import DefaultAvatar from './DefaultAvatar';

function AvatarUpload({ currentAvatar, onChange }) {
  const [preview, setPreview] = useState(currentAvatar);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="relative cursor-pointer group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-100 group-hover:ring-indigo-300 transition-all"
          />
        ) : (
          <DefaultAvatar size={96} />
        )}
        
        <div className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition"
      >
        {preview ? 'Change photo' : 'Upload photo'}
      </button>
    </div>
  );
}

export default AvatarUpload;