import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useToast, Toast } from '@/components/common/Toast';
import UserProfileMenu from './UserProfileMenu';

function UserProfileCard({ collapsed = false }) {
  const { user, expertProfile } = useProfile();
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();

  const avatarUrl = expertProfile?.avatar_url;

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

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

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      {/* User Profile Button */}
      <button
        onClick={toggleMenu}
        className={`
          w-full flex items-center gap-3 p-3 rounded-lg
          hover:bg-gray-100 transition-colors group
          ${collapsed ? 'justify-center' : ''}
          ${menuOpen ? 'bg-gray-100' : ''}
        `}
        title={collapsed ? userName : undefined}
        aria-expanded={menuOpen}
        aria-haspopup="true"
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
          <svg 
            className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <UserProfileMenu 
          onClose={() => setMenuOpen(false)}
          onToast={showToast}
        />
      )}
    </div>
  );
}

export default UserProfileCard;