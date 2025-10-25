import React from 'react';
import { useAuth } from '@/context/AuthContext';

function UserProfileCard({ collapsed = false, onClick }) {
  const { user } = useAuth();

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
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
        {getInitials(userName)}
      </div>

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