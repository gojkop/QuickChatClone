import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavSection from '../navigation/NavSection';
import NavItem from '../navigation/NavItem';
import UserProfileCard from '../navigation/UserProfileCard';
import {
  Home, Inbox, BarChart3, PieChart, DollarSign,
  Settings, User, HelpCircle
} from 'lucide-react';
import logo from '@/assets/images/logo-mindpick.svg';

function DashboardSidebar({ collapsed, onToggle, pendingCount = 0 }) {
  const navigate = useNavigate();

  return (
    <aside className={`
      hidden lg:flex flex-col bg-white border-r border-gray-200
      transition-all duration-300 h-screen fixed left-0 top-0 z-40
      ${collapsed ? 'w-16' : 'w-60'}
    `}>
      {/* Logo */}
      <div className={`
        h-16 border-b border-gray-200 flex items-center flex-shrink-0
        ${collapsed ? 'justify-center px-3' : 'px-5'}
      `}>
        <img
          src={logo}
          alt="mindPick"
          className={`transition-all duration-300 ${
            collapsed ? 'h-8 w-auto' : 'h-9 w-auto'
          }`}
        />
      </div>

      {/* Navigation - Takes remaining space */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <NavSection title="Main" collapsed={collapsed}>
          <NavItem
            to="/dashboard"
            icon={<Home size={20} />}
            label="Dashboard"
            collapsed={collapsed}
          />
          <NavItem
            to="/dashboard/inbox"
            icon={<Inbox size={20} />}
            label="Inbox"
            badge={pendingCount > 0 ? { count: pendingCount, variant: 'danger', pulse: true } : null}
            collapsed={collapsed}
          />
          <NavItem
            to="/dashboard/analytics"
            icon={<BarChart3 size={20} />}
            label="Analytics"
            collapsed={collapsed}
          />
        </NavSection>

        <NavSection title="Business" collapsed={collapsed}>
          <NavItem
            to="/expert/marketing"
            icon={<PieChart size={20} />}
            label="Marketing"
            badge={{ count: 'New', variant: 'success' }}
            collapsed={collapsed}
          />
          <NavItem
            to="/dashboard/payments"
            icon={<DollarSign size={20} />}
            label="Payments"
            collapsed={collapsed}
          />
        </NavSection>

        <NavSection title="Settings" collapsed={collapsed}>
          <NavItem
            to="/dashboard/profile"
            icon={<Settings size={20} />}
            label="Profile"
            collapsed={collapsed}
          />
          <NavItem
            to="/dashboard/account"
            icon={<User size={20} />}
            label="Account"
            collapsed={collapsed}
          />
          <NavItem
            to="/faq"
            icon={<HelpCircle size={20} />}
            label="Help"
            collapsed={collapsed}
          />
        </NavSection>
      </nav>

      {/* User Profile Footer - Sticks to bottom */}
      <div className={`
        flex-shrink-0 border-t border-gray-200 overflow-visible
        ${collapsed ? 'p-2' : 'p-3'}
      `}>
        <UserProfileCard collapsed={collapsed} />
      </div>

      {/* Collapse Toggle - Only show when onToggle is provided */}
      {onToggle && (
        <button
          onClick={onToggle}
          className={`
            absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border-2 border-gray-200
            flex items-center justify-center hover:bg-gray-50 transition-colors z-10 shadow-md
          `}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg 
            className={`w-3 h-3 text-gray-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </aside>
  );
}

export default DashboardSidebar;