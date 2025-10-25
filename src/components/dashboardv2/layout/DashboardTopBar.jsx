import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Settings2 } from 'lucide-react';
import AvailabilityToggle from '../navigation/AvailabilityToggle';
import NotificationPanel from '../navigation/NotificationPanel';
import GlobalSearch from '../search/GlobalSearch';

function DashboardTopBar({
  breadcrumbs = [],
  sidebarCollapsed,
  onToggleSidebar,
  onToggleMobileMenu,
  isAvailable,
  onAvailabilityChange,
  onOpenSearch
}) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30
      transition-all duration-300
      ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-60'}
      left-0
    `}>
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors -ml-2"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm min-w-0">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-gray-400">/</span>
                )}
                <span 
                  className={`
                    truncate
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
        <div className="hidden md:flex flex-1 max-w-md">
          <GlobalSearch onClick={onOpenSearch} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
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
            onClick={() => navigate('/dashboard/account')}
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