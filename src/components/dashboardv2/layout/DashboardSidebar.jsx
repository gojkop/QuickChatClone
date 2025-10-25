import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavSection from '../navigation/NavSection';
import NavItem from '../navigation/NavItem';
import UserProfileCard from '../navigation/UserProfileCard';
import {
  Home, Inbox, BarChart3, PieChart, DollarSign,
  User, Settings, HelpCircle
} from 'lucide-react';
import logo from '@/assets/images/logo-mindpick.svg';

function DashboardSidebar({ collapsed = false, pendingCount = 0 }) {
  const navigate = useNavigate();

  return (
    <aside 
      className={`
        fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200
        transition-all duration-300 ease-out z-40
        ${collapsed ? 'w-16' : 'w-60'}
        hidden lg:flex flex-col
      `}
    >
      {/* Logo */}
      <div className={`
        h-16 border-b border-gray-200 flex items-center
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

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Section */}
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

        {/* Business Section */}
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

        {/* Settings Section */}
        <NavSection title="Settings" collapsed={collapsed}>
          <NavItem
            to="/expert#profile-settings"
            icon={<User size={20} />}
            label="Profile"
            collapsed={collapsed}
          />
          <NavItem
            to="/expert#account-settings"
            icon={<Settings size={20} />}
            label="Settings"
            collapsed={collapsed}
          />
          <NavItem
            to="/faq"
            icon={<HelpCircle size={20} />}
            label="Help"
            collapsed={collapsed}
          />
        </NavSection>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-gray-200">
        <UserProfileCard 
          collapsed={collapsed}
          onClick={() => navigate('/expert#account-settings')}
        />
      </div>
    </aside>
  );
}

export default DashboardSidebar;