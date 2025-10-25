import React, { useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import SearchResults from './SearchResults';

function SearchModal({ 
  isOpen, 
  onClose, 
  searchQuery, 
  onSearchChange,
  searchResults,
  selectedIndex,
  onSelect,
  onMoveSelection,
  recentSearches,
  onRecentSearchClick,
  onClearRecent
}) {
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Navigate with arrow keys
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onMoveSelection('down');
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onMoveSelection('up');
        return;
      }

      // Select with Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        const allResults = [
          ...searchResults.questions,
          ...searchResults.navigation,
          ...searchResults.actions
        ];
        const selected = allResults[selectedIndex];
        if (selected) {
          onSelect(selected);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, onClose, onMoveSelection, onSelect]);

  if (!isOpen) return null;

  const hasResults = searchResults.total > 0;
  const showRecent = !searchQuery.trim() && recentSearches.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search questions, pages, or type a command..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 text-base bg-transparent border-none outline-none placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded border border-gray-300">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {searchQuery.trim() && hasResults && (
              <SearchResults
                results={searchResults}
                selectedIndex={selectedIndex}
                onSelect={onSelect}
              />
            )}

            {searchQuery.trim() && !hasResults && (
              <div className="py-12 text-center text-gray-500">
                <Search size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No results found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )}

            {showRecent && (
              <div className="py-2">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recent Searches
                  </span>
                  <button
                    onClick={onClearRecent}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => onRecentSearchClick(query)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{query}</span>
                  </button>
                ))}
              </div>
            )}

            {!searchQuery.trim() && !showRecent && (
              <div className="py-12 text-center text-gray-500">
                <Search size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Start typing to search</p>
                <p className="text-sm">Search questions, navigate pages, or run actions</p>
              </div>
            )}
          </div>

          {/* Footer Hints */}
          <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">↵</kbd>
                to select
              </span>
            </div>
            <span className="hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono">Cmd+K</kbd> to open
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchModal;