// src/components/dashboardv2/navigation/MobileBottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Inbox, BarChart3, User } from 'lucide-react';

function MobileBottomNav({ pendingCount = 0, currentRevenue = 0, avgRating = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/dashboard/inbox', icon: Inbox, label: 'Inbox', badge: pendingCount },
    { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
      {/* Stats Bar (above nav) */}
      <div className="flex items-center justify-around px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium">Pending</p>
          <p className="text-sm font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="w-px h-8 bg-gray-300"></div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium">Today</p>
          <p className="text-sm font-bold text-green-600">${currentRevenue}</p>
        </div>
        <div className="w-px h-8 bg-gray-300"></div>
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium">Rating</p>
          <p className="text-sm font-bold text-purple-600">{avgRating.toFixed(1)}⭐</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all touch-target ${
                active 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-xs font-semibold ${active ? 'text-indigo-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default MobileBottomNav;