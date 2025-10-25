import React from 'react';

function NavSection({ title, children, collapsed = false }) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <div className="px-3 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      <nav className="space-y-1">
        {children}
      </nav>
    </div>
  );
}

export default NavSection;