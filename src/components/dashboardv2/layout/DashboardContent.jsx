import React from 'react';
import { useLocation } from 'react-router-dom';

function DashboardContent({ children, sidebarCollapsed }) {
  const location = useLocation();
  
  // Pages that need full-width layout (no padding/max-width/min-height)
  const fullWidthPages = ['/dashboard/inbox', '/dashboard/analytics'];
  const isFullWidth = fullWidthPages.includes(location.pathname);

return (
  <main
    className={`
      bg-gray-50 pt-16 w-full
      transition-all duration-300 ease-out
      ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      ${!isFullWidth ? 'min-h-[calc(100vh-4rem)]' : ''}
    `}
  >
      {isFullWidth ? (
        // Full-width layout for inbox/analytics - NO padding, NO min-height
        children
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