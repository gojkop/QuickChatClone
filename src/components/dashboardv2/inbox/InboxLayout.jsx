import React from 'react';

function InboxLayout({ filters, quickActions, children }) {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Inbox 📥
        </h1>
        <p className="text-gray-600">
          Manage and respond to your questions
        </p>
      </div>

      {/* Filters */}
      {filters}

      {/* Quick Actions (Bulk) */}
      {quickActions}

      {/* Question List */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        {children}
      </div>
    </div>
  );
}

export default InboxLayout;
