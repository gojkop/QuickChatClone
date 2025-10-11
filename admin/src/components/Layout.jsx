import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Bell, Search, 
  BarChart3, Flag, Shield, Users, CreditCard, Settings 
} from 'lucide-react';

function NavItem({ to, label, icon: Icon, onClick }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${active 
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm' 
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}

export default function Layout({ me, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/feature-flags', label: 'Feature Flags', icon: Flag },
    { to: '/moderation', label: 'Moderation', icon: Shield },
    { to: '/experts', label: 'Experts', icon: Users },
    { to: '/transactions', label: 'Transactions', icon: CreditCard },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Sidebar */}
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
              <p className="text-xs text-gray-500">ID: {me?.admin_id}</p>
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
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search experts, transactions, flags..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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