import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, Download, X } from 'lucide-react';

function UnifiedToolbar({
  filters,
  onFilterChange,
  filteredCount,
  totalCount,
  tabCounts = { pending: 0, answered: 0, all: 0 },
  onExport,
  onOpenAdvancedFilters
}) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const isUserTypingRef = useRef(false);

  // Sync props to local state only when not actively typing
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setSearchInput(filters.searchQuery || '');
    }
  }, [filters.searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    isUserTypingRef.current = true;

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onFilterChange('searchQuery', value);
      isUserTypingRef.current = false;
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange('searchQuery', '');
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'answered', label: 'Answered' },
    { value: 'all', label: 'All' },
  ];

  const sortOptions = [
    { value: 'time_left', label: 'Time Left' },
    { value: 'price_high', label: 'Price ↓' },
    { value: 'price_low', label: 'Price ↑' },
    { value: 'date_new', label: 'Newest' },
    { value: 'date_old', label: 'Oldest' },
  ];

  const hasActiveFilters =
    filters.priceMin > 0 ||
    filters.priceMax < 10000 ||
    filters.showHidden;

  // Get count for any tab (always show all counts)
  const getTabCount = (tab) => {
    if (tab === 'pending') return tabCounts.pending;
    if (tab === 'answered') return tabCounts.answered;
    if (tab === 'all') return tabCounts.all;
    return 0;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Desktop Layout (≥768px) */}
      <div className="hidden md:flex items-center gap-3 px-4 py-3">
        {/* Search Bar - 40% */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions, askers, or IDs..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Tabs - 30% */}
        <div className="flex items-center gap-1.5">
          {statusOptions.map((option) => {
            const count = getTabCount(option.value);
            return (
              <button
                key={option.value}
                onClick={() => onFilterChange('status', option.value)}
                className={`
                  px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                  ${filters.status === option.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {option.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs font-bold ${
                  filters.status === option.value
                    ? 'bg-white/20'
                    : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown - 15% */}
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Actions - 15% */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdvancedFilters}
            className={`
              p-2.5 rounded-lg transition-all relative
              ${hasActiveFilters
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }
            `}
            title="Advanced filters"
          >
            <Settings size={18} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white" />
            )}
          </button>

          <button
            onClick={onExport}
            className="p-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-all"
            title="Export questions"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Layout (<768px) */}
      <div className="md:hidden">
        {/* Row 1: Search + Actions */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={onOpenAdvancedFilters}
            className={`
              p-2 rounded-lg transition-all relative flex items-center justify-center
              ${hasActiveFilters
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
              }
            `}
          >
            <Settings size={16} />
            {hasActiveFilters && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-600 rounded-full border border-white" />
            )}
          </button>

          <button
            onClick={onExport}
            className="p-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 flex items-center justify-center"
          >
            <Download size={16} />
          </button>
        </div>

        {/* Row 2: Status Tabs (Full Width) */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-200">
          {statusOptions.map((option) => {
            const count = getTabCount(option.value);
            return (
              <button
                key={option.value}
                onClick={() => onFilterChange('status', option.value)}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all
                  ${filters.status === option.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700'
                  }
                `}
              >
                {option.label}
                <span className="ml-1 text-xs">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Sort (Full Width) */}
        <div className="px-3 py-2">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default UnifiedToolbar;
