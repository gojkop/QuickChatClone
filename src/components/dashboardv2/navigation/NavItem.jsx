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
        flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
        transition-all duration-200 relative group touch-target
        ${collapsed ? 'justify-center' : ''}
        ${isActive 
          ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 font-semibold shadow-sm' 
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
      title={collapsed ? label : undefined}
    >
      {/* Active indicator - animated */}
      {isActive && !collapsed && (
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full animate-fadeInScale"
          style={{ animationDuration: '0.2s' }}
        />
      )}
      
      {/* Icon - with smooth transition */}
      <span className={`
        icon-container transition-all duration-200 flex-shrink-0
        ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}
      `}>
        {icon}
      </span>
      
      {/* Label - hidden when collapsed */}
      {!collapsed && (
        <span className="flex-1 text-sm whitespace-nowrap">{label}</span>
      )}
      
      {/* Badge - hidden when collapsed */}
      {!collapsed && badge && (
        <span className={`
          inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full flex-shrink-0
          text-[10px] font-bold transition-all
          ${badge.variant === 'danger'
            ? 'bg-red-500 text-white'
            : badge.variant === 'success'
            ? 'bg-green-500 text-white text-[9px] px-1'
            : 'bg-gray-200 text-gray-700'
          }
          ${badge.pulse ? 'animate-pulse' : ''}
        `}>
          {badge.count}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none whitespace-nowrap z-50 transition-all duration-200 shadow-xl">
          {label}
          {badge && ` (${badge.count})`}
          {/* Tooltip arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      )}
    </Link>
  );
}

export default NavItem;