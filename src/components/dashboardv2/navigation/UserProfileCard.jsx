import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext'; // ← NEW

function UserProfileCard({ collapsed = false, onClick }) {
  const { user } = useAuth();
  const { expertProfile } = useProfile(); // ← NEW: Get profile from context
  const [imageError, setImageError] = useState(false);

  // ← REMOVED: useEffect that fetches avatar - no longer needed!

  const avatarUrl = expertProfile?.avatar_url; // ← NEW: Get from context

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = user?.name || 'Expert';
  const userEmail = user?.email || '';

  const renderAvatar = () => {
    if (avatarUrl && !imageError) {
      return (
        <img
          src={avatarUrl}
          alt={userName}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          onError={() => setImageError(true)}
        />
      );
    }

    // Fallback to initials
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
        {getInitials(userName)}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-lg
        hover:bg-gray-100 transition-colors group
        ${collapsed ? 'justify-center' : ''}
      `}
      title={collapsed ? userName : undefined}
    >
      {/* Avatar */}
      {renderAvatar()}

      {/* User Info - hidden when collapsed */}
      {!collapsed && (
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {userName}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {userEmail}
          </div>
        </div>
      )}

      {/* Chevron - hidden when collapsed */}
      {!collapsed && (
        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )}
    </button>
  );
}

export default UserProfileCard;