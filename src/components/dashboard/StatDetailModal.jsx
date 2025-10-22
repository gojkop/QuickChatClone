import React from 'react';

const StatDetailModal = ({ isOpen, onClose, title, icon, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-2xl shadow-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0 sm:fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            type="button"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StatDetailModal;