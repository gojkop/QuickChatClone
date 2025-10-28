// src/components/dashboardv2/metrics/InboxSnapshotCard.jsx
import React from 'react';
import { Inbox, AlertCircle, Clock, CheckCircle, List } from 'lucide-react';

/**
 * InboxSnapshotCard - Shows overview of question counts across all tabs
 * Matches the tab counts shown in /dashboard/inbox
 */
function InboxSnapshotCard({ counts = {} }) {
  const { urgent = 0, pending = 0, answered = 0, all = 0 } = counts;

  const stats = [
    {
      label: 'Urgent',
      value: urgent,
      icon: AlertCircle,
      color: urgent === 0 ? 'text-green-600' : urgent <= 2 ? 'text-orange-600' : 'text-red-600',
      bgColor: urgent === 0 ? 'bg-green-50' : urgent <= 2 ? 'bg-orange-50' : 'bg-red-50',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Answered',
      value: answered,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'All',
      value: all,
      icon: List,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-lg shadow-sm">
          <Inbox size={16} className="text-indigo-600" strokeWidth={2.5} />
        </div>
        <h3 className="text-xs font-bold text-gray-900">Inbox Overview</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-3 border border-gray-200 transition-all hover:shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={stat.color} strokeWidth={2.5} />
                <span className="text-xs font-semibold text-gray-600">
                  {stat.label}
                </span>
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InboxSnapshotCard;
