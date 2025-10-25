import React from 'react';
import { X } from 'lucide-react';
import NavSection from '../navigation/NavSection';
import NavItem from '../navigation/NavItem';
import UserProfileCard from '../navigation/UserProfileCard';
import { 
  Home, Inbox, BarChart3, PieChart, DollarSign,
  User, Settings, HelpCircle
} from 'lucide-react';
import logo from '@/assets/images/logo-mindpick.svg';

function MobileDrawer({ isOpen, onClose, pendingCount = 0 }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden
          flex flex-col transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-5">
          <img
            src={logo}
            alt="mindPick"
            className="h-9 w-auto"
          />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <NavSection title="Main">
            <NavItem
              to="/dashboard"
              icon={<Home size={20} />}
              label="Dashboard"
              onClick={onClose}
            />
            <NavItem
              to="/dashboard/inbox"
              icon={<Inbox size={20} />}
              label="Inbox"
              badge={pendingCount > 0 ? { count: pendingCount, variant: 'danger', pulse: true } : null}
              onClick={onClose}
            />
            <NavItem
              to="/dashboard/analytics"
              icon={<BarChart3 size={20} />}
              label="Analytics"
              onClick={onClose}
            />
          </NavSection>

          <NavSection title="Business">
            <NavItem
              to="/expert/marketing"
              icon={<PieChart size={20} />}
              label="Marketing"
              badge={{ count: 'New', variant: 'success' }}
              onClick={onClose}
            />
            <NavItem
              to="/dashboard/payments"
              icon={<DollarSign size={20} />}
              label="Payments"
              onClick={onClose}
            />
          </NavSection>

          <NavSection title="Settings">
            <NavItem
              to="/expert#profile-settings"
              icon={<User size={20} />}
              label="Profile"
              onClick={onClose}
            />
            <NavItem
              to="/expert#account-settings"
              icon={<Settings size={20} />}
              label="Settings"
              onClick={onClose}
            />
            <NavItem
              to="/faq"
              icon={<HelpCircle size={20} />}
              label="Help"
              onClick={onClose}
            />
          </NavSection>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-gray-200">
          <UserProfileCard onClick={onClose} />
        </div>
      </aside>
    </>
  );
}

export default MobileDrawer;