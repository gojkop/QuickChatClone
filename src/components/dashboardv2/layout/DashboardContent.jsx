import React from 'react';

function DashboardContent({ children, sidebarCollapsed }) {
  return (
    <main
      className={`
        min-h-screen bg-gray-50 pt-16
        transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}
    >
      <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
        {children}
      </div>
    </main>
  );
}

export default DashboardContent;