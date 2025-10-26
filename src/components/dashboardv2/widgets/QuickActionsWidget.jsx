// src/components/dashboardv2/widgets/QuickActionsWidget.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  BarChart3, 
  Share2, 
  Settings,
  Eye
} from 'lucide-react';

function QuickActionsWidget({ pendingCount = 0 }) {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Inbox,
      label: 'View Questions',
      badge: pendingCount > 0 ? pendingCount : null,
      onClick: () => navigate('/dashboard/inbox'),
      color: 'indigo'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      onClick: () => navigate('/dashboard/analytics'),
      color: 'purple'
    },
    {
      icon: Eye,
      label: 'Preview Profile',
      onClick: () => window.open(`/u/${window.location.pathname.split('/')[1]}`, '_blank'),
      color: 'blue'
    },
    {
      icon: Share2,
      label: 'Share Profile',
      onClick: () => {
        const url = window.location.origin + `/u/${window.location.pathname.split('/')[1]}`;
        navigator.clipboard.writeText(url);
      },
      color: 'green'
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => navigate('/dashboard/profile'),
      color: 'gray'
    },
  ];

  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xs font-bold text-gray-900 mb-2">Quick Actions</h3>
      
      <div className="flex-1 space-y-1.5">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                w-full flex items-center gap-2 p-2 rounded-lg 
                transition-all duration-200
                ${colorClasses[action.color]}
                group relative
              `}
            >
              <div className={`p-1 rounded-md ${colorClasses[action.color]}`}>
                <Icon size={14} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-gray-900 flex-1 text-left">
                {action.label}
              </span>
              {action.badge && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-xs font-bold bg-red-500 text-white">
                  {action.badge}
                </span>
              )}
              <svg 
                className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Footer Tip - COMPACT */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">⌘K</kbd> for search
        </p>
      </div>
    </div>
  );
}

export default QuickActionsWidget;