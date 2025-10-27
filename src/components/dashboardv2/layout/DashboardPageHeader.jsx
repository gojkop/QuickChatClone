// src/components/dashboardv2/layout/DashboardPageHeader.jsx
// Standardized page header for all dashboard sub-pages
// Ensures consistent typography, spacing, and mobile responsiveness

import React from 'react';

/**
 * DashboardPageHeader Component
 *
 * @param {string} title - Page title (required)
 * @param {string} subtitle - Page subtitle/description (optional)
 * @param {React.ReactNode} badge - Badge element (e.g., Beta, Completeness indicator) (optional)
 * @param {React.ReactNode} actions - Action buttons or controls (e.g., Date selector, Export) (optional)
 * @param {string} className - Additional CSS classes (optional)
 */
function DashboardPageHeader({
  title,
  subtitle,
  badge,
  actions,
  className = ''
}) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Title + Subtitle + Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {title}
            </h1>
            {badge && (
              <div className="flex-shrink-0">
                {badge}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Actions or Badge */}
        {actions && (
          <div className="flex-shrink-0 flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPageHeader;
