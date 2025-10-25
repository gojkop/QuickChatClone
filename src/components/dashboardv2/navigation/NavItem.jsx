import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavItem({ to, icon, label, badge, collapsed = false, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-200 relative group
        ${collapsed ? 'justify-center' : ''}
        ${isActive 
          ? 'bg-indigo-50 text-indigo-700 font-semibold' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
      title={collapsed ? label : undefined}
    >
      {/* Active indicator */}
      {isActive && !collapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
      )}
      
      {/* Icon */}
      <span className={`flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
        {icon}
      </span>
      
      {/* Label - hidden when collapsed */}
      {!collapsed && (
        <span className="flex-1 text-sm">{label}</span>
      )}
      
      {/* Badge - hidden when collapsed */}
      {!collapsed && badge && (
        <span className={`
          inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
          rounded-full text-xs font-bold
          ${badge.variant === 'danger' 
            ? 'bg-red-500 text-white' 
            : badge.variant === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-700'
          }
          ${badge.pulse ? 'animate-pulse' : ''}
        `}>
          {badge.count}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
          {badge && ` (${badge.count})`}
        </div>
      )}
    </Link>
  );
}

export default NavItem;