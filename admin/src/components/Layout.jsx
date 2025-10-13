// admin/src/components/Layout.jsx - With real-time badge counts
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Icons (same as before)
const Icons = {
  Menu: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  BarChart: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Flag: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  MessageSquare: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
};

function NavItem({ to, label, Icon, onClick, comingSoon = false }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200 relative
        ${active 
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm' 
          : comingSoon
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <Icon />
      {label}
      {comingSoon && (
        <span className="ml-auto text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full font-semibold">
          Soon
        </span>
      )}
    </Link>
  );
}

function MobileBottomNav({ badges = {} }) {
  const location = useLocation();

  const navItems = [
    { 
      to: '/dashboard', 
      label: 'Dashboard', 
      icon: Icons.BarChart
    },
    { 
      to: '/feature-flags', 
      label: 'Flags', 
      icon: Icons.Flag,
      badge: badges.flags
    },
    { 
      to: '/feedback', 
      label: 'Feedback', 
      icon: Icons.MessageSquare,
      badge: badges.feedback
    },
    { 
      to: '/experts', 
      label: 'Experts', 
      icon: Icons.Users,
      badge: badges.experts
    },
    { 
      to: '/settings', 
      label: 'Settings', 
      icon: Icons.Settings
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-5 gap-1 px-2 py-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const ItemIcon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg
                transition-all duration-200 min-w-0
                ${active ? 'bg-indigo-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className="relative">
                <ItemIcon active={active} />
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium truncate max-w-full ${active ? 'text-indigo-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Layout({ me, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({
    flags: 0,
    feedback: 0,
    moderation: 0,
    experts: 0,
  });

  // Fetch badge counts on mount and periodically
  useEffect(() => {
    fetchBadgeCounts();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBadgeCounts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchBadgeCounts() {
    try {
      // Fetch in parallel for speed
      const [flagsRes, feedbackRes] = await Promise.all([
        fetch('/api/flags', { credentials: 'include' }).catch(() => null),
        fetch('/api/feedback?status=new&limit=1', { credentials: 'include' }).catch(() => null)
      ]);

      const newBadges = { ...badges };

      // Feature flags - count total flags (not just enabled)
      if (flagsRes?.ok) {
        const flagsData = await flagsRes.json();
        newBadges.flags = flagsData.flags?.length || 0;
      }

      // Feedback - count pending/new items
      if (feedbackRes?.ok) {
        const feedbackData = await feedbackRes.json();
        newBadges.feedback = feedbackData.pagination?.total || 0;
      }

      // Only update if counts changed (prevent unnecessary re-renders)
      if (JSON.stringify(newBadges) !== JSON.stringify(badges)) {
        setBadges(newBadges);
      }
    } catch (error) {
      console.error('[badges] Failed to fetch counts:', error);
    }
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', Icon: Icons.BarChart },
    { to: '/feature-flags', label: 'Feature Flags', Icon: Icons.Flag },
    { to: '/feedback', label: 'Feedback', Icon: Icons.MessageSquare },
    { to: '/moderation', label: 'Moderation', Icon: Icons.Shield, comingSoon: true },
    { to: '/experts', label: 'Experts', Icon: Icons.Users },
    { to: '/transactions', label: 'Transactions', Icon: Icons.CreditCard, comingSoon: true },
    { to: '/settings', label: 'Settings', Icon: Icons.Settings }
  ];

  const closeSidebar = () => setSidebarOpen(false);

  const totalNotifications = badges.feedback + badges.moderation + badges.experts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <Icons.X /> : <Icons.Menu />}
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              mind
            </span>
            <span className="text-gray-900">Pick</span>
          </span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Admin</span>
        </div>
        
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Icons.Bell />
          {totalNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                mind
              </span>
              <span className="text-gray-900">Pick</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Admin Console</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <NavItem 
              key={item.to} 
              {...item} 
              onClick={closeSidebar}
            />
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
              {me?.role?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {me?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </p>
              <p className="text-xs text-gray-500">ID: {me?.admin_id?.slice(0, 8)}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Search experts, transactions, flags..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Icons.Bell />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            <div className="w-px h-6 bg-gray-200" />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600" />
              <span className="text-sm font-medium text-gray-900">
                {me?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav badges={badges} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}