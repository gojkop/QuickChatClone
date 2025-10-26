// src/components/dashboardv2/layout/BentoCard.jsx
import React from 'react';

/**
 * BentoCard - Individual card with flexible sizing
 * 
 * Sizes:
 * - small: 1x1 (default)
 * - wide: 2x1 (spans 2 columns)
 * - tall: 1x2 (spans 2 rows)
 * - large: 2x2 (spans 2 columns, 2 rows)
 * - extraWide: 3x1 (spans 3 columns)
 */
function BentoCard({ 
  size = 'small', 
  children, 
  className = '',
  onClick,
  hoverable = false
}) {
  const sizeClasses = {
    small: 'lg:col-span-1 lg:row-span-1',       // 1x1
    wide: 'lg:col-span-2 lg:row-span-1',        // 2x1
    tall: 'lg:col-span-1 lg:row-span-2',        // 1x2
    large: 'lg:col-span-2 lg:row-span-2',       // 2x2
    extraWide: 'lg:col-span-3 lg:row-span-1',   // 3x1
    full: 'lg:col-span-4 lg:row-span-1',        // 4x1
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
        p-4
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