import React from 'react';

function AnalyticsLayout({ header, children }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      {header}

      {/* Content */}
      {children}
    </div>
  );
}

export default AnalyticsLayout;