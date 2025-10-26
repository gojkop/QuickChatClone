// src/components/dashboardv2/layout/BentoGrid.jsx
import React from 'react';

/**
 * BentoGrid - Variable-sized grid container
 * Uses CSS Grid with 4 columns on desktop
 * Automatically stacks on mobile
 */
function BentoGrid({ children, className = '' }) {
  return (
    <div className={`
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-4 
      gap-3 
      auto-rows-fr
      ${className}
    `}>
      {children}
    </div>
  );
}

export default BentoGrid;