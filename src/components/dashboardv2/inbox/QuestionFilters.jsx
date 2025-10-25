import React, { useState } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

function QuestionFilters({ filters, onFilterChange, filteredCount, totalCount }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [priceMinInput, setPriceMinInput] = useState(filters.priceMin);
  const [priceMaxInput, setPriceMaxInput] = useState(filters.priceMax);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onFilterChange('searchQuery', value);
    }, 300);
  };

  const handlePriceMinChange = (e) => {
    const value = Number(e.target.value);
    setPriceMinInput(value);
    clearTimeout(window.priceMinTimeout);
    window.priceMinTimeout = setTimeout(() => {
      onFilterChange('priceMin', value);
    }, 500);
  };

  const handlePriceMaxChange = (e) => {
    const value = Number(e.target.value);
    setPriceMaxInput(value);
    clearTimeout(window.priceMaxTimeout);
    window.priceMaxTimeout = setTimeout(() => {
      onFilterChange('priceMax', value);
    }, 500);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'orange' },
    { value: 'answered', label: 'Answered', color: 'green' },
    { value: 'all', label: 'All', color: 'blue' },
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
    filters.slaFilter !== 'all' || 
    filters.questionType !== 'all' ||
    filters.searchQuery !== '';

  const clearFilters = () => {
    setPriceMinInput(0);
    setPriceMaxInput(10000);
    setSearchInput('');
    onFilterChange('priceMin', 0);
    onFilterChange('priceMax', 10000);
    onFilterChange('slaFilter', 'all');
    onFilterChange('questionType', 'all');
    onFilterChange('searchQuery', '');
  };

  return (
    <div className="p-3">
      {/* Status Tabs - Compact */}
      <div className="flex items-center gap-1 mb-3">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange('status', option.value)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all
              ${filters.status === option.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Search Bar - Compact */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={handleSearchChange}
          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Sort + Filter Toggle */}
      <div className="flex items-center gap-2 mb-3">
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors
            ${hasActiveFilters || isExpanded
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }
          `}
        >
          <Filter size={14} />
          {hasActiveFilters && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Advanced Filters (Collapsible) */}
      {isExpanded && (
        <div className="pt-3 border-t border-gray-200 space-y-3">
          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMinInput}
                onChange={handlePriceMinChange}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-500 text-xs">—</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMaxInput}
                onChange={handlePriceMaxChange}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Show Hidden */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showHidden"
              checked={filters.showHidden}
              onChange={(e) => onFilterChange('showHidden', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="showHidden" className="text-xs font-medium text-gray-700">
              Show hidden
            </label>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
        <span className="font-semibold text-gray-900">{filteredCount}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalCount}</span>
      </div>
    </div>
  );
}

export default QuestionFilters;