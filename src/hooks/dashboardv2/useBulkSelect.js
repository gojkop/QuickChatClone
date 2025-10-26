// src/hooks/dashboardv2/useBulkSelect.js
// Hook for bulk selection with Shift+Click support

import { useState, useCallback, useRef } from 'react';

export const useBulkSelect = (items = []) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const lastSelectedIndex = useRef(null);

  const toggleSelect = useCallback((id, event) => {
    const currentIndex = items.findIndex(item => item.id === id);

    if (event?.shiftKey && lastSelectedIndex.current !== null) {
      // Shift+Click: Select range
      const start = Math.min(lastSelectedIndex.current, currentIndex);
      const end = Math.max(lastSelectedIndex.current, currentIndex);
      const rangeIds = items.slice(start, end + 1).map(item => item.id);

      setSelectedIds(prev => {
        const newSet = new Set(prev);
        rangeIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    } else {
      // Regular click: Toggle single
      setSelectedIds(prev => 
        prev.includes(id)
          ? prev.filter(selectedId => selectedId !== id)
          : [...prev, id]
      );
    }

    lastSelectedIndex.current = currentIndex;
  }, [items]);

  const selectAll = useCallback(() => {
    setSelectedIds(items.map(item => item.id));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    lastSelectedIndex.current = null;
  }, []);

  const selectRange = useCallback((startId, endId) => {
    const startIndex = items.findIndex(item => item.id === startId);
    const endIndex = items.findIndex(item => item.id === endId);

    if (startIndex === -1 || endIndex === -1) return;

    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    const rangeIds = items.slice(start, end + 1).map(item => item.id);

    setSelectedIds(prev => {
      const newSet = new Set([...prev, ...rangeIds]);
      return Array.from(newSet);
    });
  }, [items]);

  return {
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectRange,
    isSelected: (id) => selectedIds.includes(id),
    selectedCount: selectedIds.length
  };
};

export default useBulkSelect;