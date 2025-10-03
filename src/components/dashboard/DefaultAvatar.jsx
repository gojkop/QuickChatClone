// client/src/components/dashboard/DefaultAvatar.jsx
import React from 'react';

function DefaultAvatar({ size = 96 }) {
  return (
    <div 
      className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg 
        className="text-white" 
        style={{ width: size / 2, height: size / 2 }}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>
    </div>
  );
}

export default DefaultAvatar;