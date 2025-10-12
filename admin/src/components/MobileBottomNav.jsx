// admin/src/components/MobileBottomNav.jsx
// Mobile-first bottom navigation bar for small screens - WITH FEEDBACK

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Navigation icons (inline SVG)
const NavIcons = {
  Dashboard: ({ active }) => (
    <svg className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Flags: ({ active }) => (
    <svg className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  Feedback: ({ active }) => ( // ADDED
    <svg className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Shield: ({ active }) => (
    <svg className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Users: ({ active }) => (
    <svg className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Settings: ({ active }) => (
    <svg className={`w-6 h-6 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
};

// Nav item component
function NavItem({ to, label, icon: Icon, badge, active }) {
  return (
    <Link
      to={to}
      className={`
        flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg
        transition-all duration-200 min-w-0
        ${active ? 'bg-indigo-50' : 'hover:bg-gray-50'}
      `}
    >
      <div className="relative">
        <Icon active={active} />
        {badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-medium truncate max-w-full ${active ? 'text-indigo-600' : 'text-gray-500'}`}>
        {label}
      </span>
    </Link>
  );
}

// Main component
export default function MobileBottomNav({ badges = {} }) {
  const location = useLocation();

  const navItems = [
    { 
      to: '/dashboard', 
      label: 'Dashboard', 
      icon: NavIcons.Dashboard
    },
    { 
      to: '/feature-flags', 
      label: 'Flags', 
      icon: NavIcons.Flags,
      badge: badges.flags
    },
    { 
      to: '/feedback', 
      label: 'Feedback', 
      icon: NavIcons.Feedback,
      badge: badges.feedback // ADDED
    },
    { 
      to: '/moderation', 
      label: 'Moderation', 
      icon: NavIcons.Shield,
      badge: badges.moderation
    },
    { 
      to: '/experts', 
      label: 'Experts', 
      icon: NavIcons.Users,
      badge: badges.experts
    }
  ];

  return (
    <nav className="
      lg:hidden
      fixed bottom-0 left-0 right-0 
      bg-white border-t border-gray-200 
      shadow-lg
      z-50
      safe-area-inset-bottom
    ">
      <div className="grid grid-cols-5 gap-1 px-2 py-1">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            active={location.pathname === item.to}
          />
        ))}
      </div>
    </nav>
  );
}