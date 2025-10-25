import React, { useEffect } from 'react';
import { Search } from 'lucide-react';

function GlobalSearch({ onClick }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  return (
    <button
      onClick={onClick}
      className="
        flex items-center gap-2 w-full px-3 py-2 
        bg-gray-50 border border-gray-200 rounded-lg
        text-sm text-gray-500 hover:bg-gray-100 hover:border-gray-300
        transition-all group
      "
    >
      <Search size={16} className="text-gray-400 group-hover:text-gray-600" />
      <span>Search...</span>
      <div className="ml-auto flex items-center gap-1">
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">
          {navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">
          K
        </kbd>
      </div>
    </button>
  );
}

export default GlobalSearch;