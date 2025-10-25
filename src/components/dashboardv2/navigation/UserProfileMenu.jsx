import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { Globe, Copy, Check, LogOut } from 'lucide-react';
import MenuDivider from './MenuDivider';

function UserProfileMenu({ onClose, onToast, collapsed = false }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user, expertProfile, updateAvailability, isUpdatingAvailability } = useProfile();
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Get user info
  const userName = user?.name || 'Expert';
  const userEmail = user?.email || '';
  const userHandle = expertProfile?.handle;
  const isPublic = expertProfile?.public;
  const acceptingQuestions = expertProfile?.accepting_questions ?? true;

  // Handle copy profile link
  const handleCopyProfileLink = async () => {
    if (!userHandle) return;
    
    const profileUrl = `${window.location.origin}/u/${userHandle}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopiedLink(true);
      onToast?.('Profile link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      onToast?.('Failed to copy link', 'warning');
    }
  };

  // Handle view public profile
  const handleViewPublicProfile = () => {
    if (!userHandle) return;
    window.open(`/u/${userHandle}`, '_blank', 'noopener,noreferrer');
    onClose?.();
  };

  // Handle accepting questions toggle
  const handleToggleAcceptingQuestions = () => {
    updateAvailability(!acceptingQuestions);
  };

  // Handle sign out
  const handleSignOut = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  return (
    <div 
      className={`
        absolute bottom-full mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[60]
        animate-slide-up-fast
        ${collapsed ? 'left-full ml-2' : 'left-0 w-72'}
      `}
      style={collapsed ? { minWidth: '288px' } : {}}
    >
      {/* Header - User Info */}
      <div className="px-4 py-3">
        <div className="font-semibold text-gray-900 text-sm truncate">
          {userName}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {userEmail}
        </div>
      </div>

      <MenuDivider />

      {/* Quick Actions - Only show if user has public profile */}
      {userHandle && isPublic && (
        <>
          <button
            onClick={handleViewPublicProfile}
            className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 group"
          >
            <Globe size={18} className="text-gray-400 group-hover:text-indigo-600" />
            <span className="font-medium">View Public Profile</span>
          </button>

          <button
            onClick={handleCopyProfileLink}
            disabled={copiedLink}
            className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 group disabled:opacity-60"
          >
            {copiedLink ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <Copy size={18} className="text-gray-400 group-hover:text-indigo-600" />
            )}
            <span className="font-medium">
              {copiedLink ? 'Link Copied!' : 'Copy Profile Link'}
            </span>
          </button>

          <MenuDivider />
        </>
      )}

      {/* Preferences - Quick Toggles */}
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${acceptingQuestions ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700">
              Accepting Questions
            </span>
          </div>
          <button
            onClick={handleToggleAcceptingQuestions}
            disabled={isUpdatingAvailability}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150
              ${acceptingQuestions ? 'bg-indigo-600' : 'bg-gray-300'}
            `}
            role="switch"
            aria-checked={acceptingQuestions}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-150
                ${acceptingQuestions ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      <MenuDivider />

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-sm text-red-600 hover:bg-red-50 group font-medium"
      >
        <LogOut size={18} className="text-red-500" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}

export default UserProfileMenu;