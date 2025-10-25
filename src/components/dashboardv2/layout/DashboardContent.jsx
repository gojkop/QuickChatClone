import React from 'react';
import { useLocation } from 'react-router-dom';

function DashboardContent({ children, sidebarCollapsed }) {
  const location = useLocation();
  
  // Pages that need full-width layout (no padding/max-width)
  const fullWidthPages = ['/dashboard/inbox', '/dashboard/analytics'];
  const isFullWidth = fullWidthPages.includes(location.pathname);

  return (
    <main
      className={`
        min-h-screen bg-gray-50 pt-16
        transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}
    >
      {isFullWidth ? (
        // Full-width layout for inbox/analytics
        <div className="h-[calc(100vh-4rem)]">
          {children}
        </div>
      ) : (
        // Regular padded layout for other pages
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      )}
    </main>
  );
}

export default DashboardContent;