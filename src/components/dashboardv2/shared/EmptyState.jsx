import React from 'react';

function EmptyState({ icon: Icon, title, description, action, compact = false }) {
  if (compact) {
    return (
      <div className="text-center py-8 px-4 animate-fadeInScale">
        {Icon && (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-3">
            <Icon size={24} className="text-gray-400" />
          </div>
        )}
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-4 animate-fadeInScale">
      {Icon && (
        <div className="relative inline-block mb-6">
          {/* Gradient background circle */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-xl opacity-60"></div>
          
          {/* Icon container */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-lg">
            <Icon size={36} className="text-gray-400" />
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      
      {action && <div className="animate-bounceSubtle">{action}</div>}
    </div>
  );
}

export default EmptyState;