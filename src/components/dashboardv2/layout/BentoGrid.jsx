// src/components/dashboardv2/layout/BentoGrid.jsx
import React from 'react';

function BentoGrid({ children, className = '' }) {
  return (
    <div className={`
      grid
      grid-cols-2
      lg:grid-cols-4
      gap-2
      sm:gap-2.5
      auto-rows-[80px]
      sm:auto-rows-fr
      ${className}
    `}>
      {children}
    </div>
  );
}

export default BentoGrid;