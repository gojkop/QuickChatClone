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
    small: 'lg:col-span-1 lg:row-span-1',
    wide: 'lg:col-span-2 lg:row-span-1',
    tall: 'lg:col-span-1 lg:row-span-2',
    large: 'lg:col-span-2 lg:row-span-2',
    extraWide: 'lg:col-span-3 lg:row-span-1',
    full: 'lg:col-span-4 lg:row-span-1',
  };

  const interactiveClasses = hoverable || onClick
    ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300'
    : 'transition-shadow duration-300';

  return (
    <div 
      className={`
        bg-white 
        border border-gray-200 
        rounded-xl 
        p-3
        ${sizeClasses[size]}
        ${interactiveClasses}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default BentoCard;