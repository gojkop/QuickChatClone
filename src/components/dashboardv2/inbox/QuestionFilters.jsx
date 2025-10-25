import React, { useState } from 'react';
import { Filter, X, ChevronDown, Search } from 'lucide-react';

function QuestionFilters({ filters, onFilterChange, filteredCount, totalCount }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    // Debounced search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onFilterChange('searchQuery', value);
    }, 300);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'orange' },
    { value: 'answered', label: 'Answered', color: 'green' },
    { value: 'all', label: 'All', color: 'blue' },
  ];

  const sortOptions = [
    { value: 'time_left', label: 'Time Left (Urgent First)' },
    { value: 'price_high', label: 'Price (High to Low)' },
    { value: 'price_low', label: 'Price (Low to High)' },
    { value: 'date_new', label: 'Date (Newest First)' },
    { value: 'date_old', label: 'Date (Oldest First)' },
  ];

  const slaOptions = [
    { value: 'all', label: 'All Questions' },
    { value: 'urgent', label: 'Urgent (<12h)' },
    { value: 'normal', label: 'Normal' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'quick', label: 'Quick Consult' },
    { value: 'deep_dive', label: 'Deep Dive' },
  ];

  const hasActiveFilters = 
    filters.priceMin > 0 || 
    filters.priceMax < 10000 || 
    filters.slaFilter !== 'all' || 
    filters.questionType !== 'all' ||
    filters.searchQuery !== '';

  const clearFilters = () => {
    onFilterChange('priceMin', 0);
    onFilterChange('priceMax', 10000);
    onFilterChange('slaFilter', 'all');
    onFilterChange('questionType', 'all');
    onFilterChange('searchQuery', '');
    setSearchInput('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
      {/* Top Row: Status Tabs + Sort + Filter Toggle */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange('status', option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all
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

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Toggle Advanced Filters */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${hasActiveFilters || isExpanded
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }
            `}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-indigo-600 rounded-full" />
            )}
            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search questions or user names..."
          value={searchInput}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Advanced Filters (Collapsible) */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => onFilterChange('priceMin', Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-500">—</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => onFilterChange('priceMax', Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* SLA Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              SLA Status
            </label>
            <select
              value={filters.slaFilter}
              onChange={(e) => onFilterChange('slaFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {slaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={filters.questionType}
              onChange={(e) => onFilterChange('questionType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Show Hidden */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showHidden"
              checked={filters.showHidden}
              onChange={(e) => onFilterChange('showHidden', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="showHidden" className="text-sm font-medium text-gray-700">
              Show hidden questions
            </label>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
            >
              <X size={16} />
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalCount}</span> questions
      </div>
    </div>
  );
}

export default QuestionFilters;