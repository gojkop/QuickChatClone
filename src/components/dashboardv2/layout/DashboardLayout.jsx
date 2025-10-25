import React from 'react';
import { useDashboardLayout } from '@/hooks/dashboardv2/useDashboardLayout';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopBar from './DashboardTopBar';
import MobileDrawer from './MobileDrawer';
import DashboardContent from './DashboardContent';

function DashboardLayout({ 
  children, 
  breadcrumbs = [{ label: 'Dashboard', path: '/expert-v2' }],
  pendingCount = 0,
  isAvailable = true,
  onAvailabilityChange
}) {
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  } = useDashboardLayout();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        collapsed={sidebarCollapsed}
        pendingCount={pendingCount}
      />

      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        pendingCount={pendingCount}
      />

      {/* Top Bar */}
      <DashboardTopBar
        breadcrumbs={breadcrumbs}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onToggleMobileMenu={toggleMobileMenu}
        isAvailable={isAvailable}
        onAvailabilityChange={onAvailabilityChange}
      />

      {/* Main Content */}
      <DashboardContent sidebarCollapsed={sidebarCollapsed}>
        {children}
      </DashboardContent>
    </div>
  );
}

export default DashboardLayout;