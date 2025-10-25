import React from 'react';

function LoadingState({ text = 'Loading...' }) {
  return (
    <div className="animate-fadeInUp">
      {/* Skeleton for metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 card-premium">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-20 skeleton rounded"></div>
              <div className="w-10 h-10 skeleton rounded-lg"></div>
            </div>
            <div className="h-8 w-24 skeleton rounded mb-2"></div>
            <div className="h-4 w-16 skeleton rounded"></div>
          </div>
        ))}
      </div>

      {/* Skeleton for content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-6 w-40 skeleton rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 skeleton rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Loading text */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          {text}
        </div>
      </div>
    </div>
  );
}

export default LoadingState;