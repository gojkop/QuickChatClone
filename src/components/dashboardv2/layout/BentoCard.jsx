// src/components/dashboardv2/layout/BentoCard.jsx
import React from 'react';

function BentoCard({ 
  size = 'small', 
  children, 
  className = '',
  onClick,
  hoverable = false
}) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    wide: 'col-span-2 lg:col-span-2 lg:row-span-1',
    tall: 'col-span-2 lg:col-span-1 lg:row-span-2',
    large: 'col-span-2 lg:col-span-2 lg:row-span-2',
    extraWide: 'col-span-2 lg:col-span-3 lg:row-span-1',
    full: 'col-span-2 lg:col-span-4 lg:row-span-1',
  };

  const interactiveClasses = hoverable || onClick
    ? 'cursor-pointer hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 active:scale-[0.99]'
    : 'transition-shadow duration-300';

  return (
    <div
      className={`
        bg-white
        border border-gray-200
        rounded-lg sm:rounded-xl
        p-1 sm:p-3
        backdrop-blur-sm
        ${sizeClasses[size]}
        ${interactiveClasses}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

export default BentoCard;