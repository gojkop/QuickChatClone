import React from 'react';

function NavSection({ title, children, collapsed = false }) {
  return (
    <div className="mb-5">
      {!collapsed && (
        <div className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          {title}
        </div>
      )}
      <nav className="space-y-0.5">
        {children}
      </nav>
    </div>
  );
}

export default NavSection;