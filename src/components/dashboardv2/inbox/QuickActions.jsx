import React from 'react';
import { EyeOff, Eye, Download, X } from 'lucide-react';

function QuickActions({ 
  selectedCount, 
  onClearSelection,
  onBulkHide,
  onBulkUnhide,
  onExport,
  selectedQuestions = [] // NEW: array of selected question objects
}) {
  if (selectedCount === 0) return null;

  // Check if any selected questions are hidden
  const hasHiddenQuestions = selectedQuestions.some(q => q.hidden);
  const hasVisibleQuestions = selectedQuestions.some(q => !q.hidden);
  
  // Show both buttons if mixed selection, otherwise show appropriate one
  const showHideButton = hasVisibleQuestions;
  const showUnhideButton = hasHiddenQuestions;

  return (
    <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-2">
      <span className="text-xs font-semibold text-indigo-900 pl-1">
        {selectedCount} selected
      </span>
      
      <div className="flex items-center gap-1">
        {showHideButton && (
          <button
            onClick={onBulkHide}
            className="p-1.5 text-gray-700 hover:bg-white rounded transition-colors"
            title="Hide selected"
          >
            <EyeOff size={14} />
          </button>
        )}

        {showUnhideButton && (
          <button
            onClick={onBulkUnhide}
            className="p-1.5 text-gray-700 hover:bg-white rounded transition-colors"
            title="Unhide selected"
          >
            <Eye size={14} />
          </button>
        )}

        <button
          onClick={onExport}
          className="p-1.5 text-gray-700 hover:bg-white rounded transition-colors"
          title="Export selected"
        >
          <Download size={14} />
        </button>

        <button
          onClick={onClearSelection}
          className="p-1.5 text-gray-500 hover:bg-white rounded transition-colors"
          title="Clear selection"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default QuickActions;