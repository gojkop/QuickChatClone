import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvailabilityToggle from '../navigation/AvailabilityToggle';
import NotificationPanel from '../navigation/NotificationPanel';
import { Search, Bell, Menu, Settings2 } from 'lucide-react';
import GlobalSearch from '../search/GlobalSearch';


function DashboardTopBar({
  breadcrumbs = [],
  sidebarCollapsed,
  onToggleSidebar,
  onToggleMobileMenu,
  isAvailable,
  onAvailabilityChange,
  onOpenSearch  // NEW
}) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header 
      className={`
        fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30
        transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-60'}
      `}
    >
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left: Mobile Menu + Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-gray-400">/</span>
                )}
                <span 
                  className={`
                    ${index === breadcrumbs.length - 1 
                      ? 'text-gray-900 font-semibold' 
                      : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                    }
                  `}
                  onClick={() => index < breadcrumbs.length - 1 && crumb.path && navigate(crumb.path)}
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
  <GlobalSearch onClick={onOpenSearch} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Availability Toggle */}
          <AvailabilityToggle 
            isAvailable={isAvailable}
            onToggle={onAvailabilityChange}
          />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`
                relative p-2 rounded-lg transition-colors
                ${isNotificationsOpen ? 'bg-gray-100' : 'hover:bg-gray-100'}
              `}
              title="Notifications"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <NotificationPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>

          {/* Settings */}
          <button
            onClick={() => navigate('/expert#account-settings')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings2 size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardTopBar;