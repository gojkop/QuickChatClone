import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';

function AdvancedFiltersPanel({ isOpen, onClose, filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState({
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    showHidden: filters.showHidden,
  });

  const isUserTypingRef = useRef(false);

  // Sync props to local state when panel opens
  useEffect(() => {
    if (isOpen && !isUserTypingRef.current) {
      setLocalFilters({
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        showHidden: filters.showHidden,
      });
    }
  }, [isOpen, filters.priceMin, filters.priceMax, filters.showHidden]);

  const handlePriceMinChange = (e) => {
    const value = Number(e.target.value);
    setLocalFilters(prev => ({ ...prev, priceMin: value }));
    isUserTypingRef.current = true;
  };

  const handlePriceMaxChange = (e) => {
    const value = Number(e.target.value);
    setLocalFilters(prev => ({ ...prev, priceMax: value }));
    isUserTypingRef.current = true;
  };

  const handleShowHiddenChange = (checked) => {
    setLocalFilters(prev => ({ ...prev, showHidden: checked }));
  };

  const handleApply = () => {
    onFilterChange('priceMin', localFilters.priceMin);
    onFilterChange('priceMax', localFilters.priceMax);
    onFilterChange('showHidden', localFilters.showHidden);
    isUserTypingRef.current = false;
    onClose();
  };

  const handleClearAll = () => {
    const defaults = {
      priceMin: 0,
      priceMax: 10000,
      showHidden: false,
    };
    setLocalFilters(defaults);
    onFilterChange('priceMin', defaults.priceMin);
    onFilterChange('priceMax', defaults.priceMax);
    onFilterChange('showHidden', defaults.showHidden);
    isUserTypingRef.current = false;
  };

  const hasChanges =
    localFilters.priceMin !== filters.priceMin ||
    localFilters.priceMax !== filters.priceMax ||
    localFilters.showHidden !== filters.showHidden;

  const hasActiveFilters =
    localFilters.priceMin > 0 ||
    localFilters.priceMax < 10000 ||
    localFilters.showHidden;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Advanced Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              💰 Price Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Minimum Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  placeholder="0"
                  value={localFilters.priceMin}
                  onChange={handlePriceMinChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Maximum Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  placeholder="10000"
                  value={localFilters.priceMax}
                  onChange={handlePriceMaxChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-600">Range:</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${localFilters.priceMin} - ${localFilters.priceMax}
                </span>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              👁 Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={localFilters.showHidden}
                  onChange={(e) => handleShowHiddenChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Show hidden questions</div>
                  <div className="text-xs text-gray-500">Include questions you've marked as hidden</div>
                </div>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-xs text-indigo-700">
              💡 <strong>Tip:</strong> Use filters to focus on specific questions. Changes apply when you click "Apply Filters".
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 space-y-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Clear All Filters</span>
            </button>
          )}

          <button
            onClick={handleApply}
            disabled={!hasChanges}
            className={`
              w-full px-4 py-3 rounded-lg font-semibold transition-all
              ${hasChanges
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

export default AdvancedFiltersPanel;
