// src/components/dashboardv2/layout/DashboardPageContent.jsx
// Standardized content wrapper for all dashboard sub-pages
// Ensures consistent max-width, padding, and spacing

import React from 'react';

/**
 * DashboardPageContent Component
 *
 * @param {React.ReactNode} children - Page content (required)
 * @param {string} maxWidth - Max width variant (optional, default: '7xl')
 *   - '4xl': Narrower content (forms, settings)
 *   - '6xl': Medium content
 *   - '7xl': Wide content (default, analytics, marketing)
 *   - 'full': Full width (edge-to-edge)
 * @param {string} className - Additional CSS classes (optional)
 */
function DashboardPageContent({
  children,
  maxWidth = '7xl',
  className = ''
}) {
  const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
      {children}
    </div>
  );
}

export default DashboardPageContent;
