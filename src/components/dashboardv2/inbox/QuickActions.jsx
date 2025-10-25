import React from 'react';
import { CheckSquare, Square, EyeOff, Eye, Download, Trash2 } from 'lucide-react';

function QuickActions({ 
  selectedCount, 
  totalVisible,
  onSelectAll, 
  onClearSelection,
  onBulkHide,
  onBulkUnhide,
  onExport 
}) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between">
        {/* Left: Selection Info */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-indigo-900">
            {selectedCount} selected
          </span>
          
          <div className="w-px h-6 bg-indigo-300" />
          
          <div className="flex items-center gap-2">
            {selectedCount === totalVisible ? (
              <button
                onClick={onClearSelection}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Square size={16} />
                Deselect All
              </button>
            ) : (
              <button
                onClick={onSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <CheckSquare size={16} />
                Select All ({totalVisible})
              </button>
            )}
          </div>
        </div>

        {/* Right: Bulk Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBulkHide}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <EyeOff size={16} />
            Hide
          </button>

          <button
            onClick={onBulkUnhide}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye size={16} />
            Unhide
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            onClick={onClearSelection}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
            title="Clear selection"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickActions;