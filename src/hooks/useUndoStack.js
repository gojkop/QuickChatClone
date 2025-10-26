// src/hooks/useUndoStack.js
// Undo/redo functionality for bulk actions

import { useState, useCallback } from 'react';

export const useUndoStack = () => {
  const [undoStack, setUndoStack] = useState([]);

  const pushUndo = useCallback((action) => {
    const undoItem = {
      id: Date.now(),
      timestamp: Date.now(),
      ...action
    };

    setUndoStack(prev => [...prev, undoItem]);

    // Auto-clear after 10 seconds if not manually cleared
    setTimeout(() => {
      setUndoStack(prev => prev.filter(item => item.id !== undoItem.id));
    }, 10000);

    return undoItem.id;
  }, []);

  const executeUndo = useCallback((id) => {
    const item = undoStack.find(u => u.id === id);
    if (item && item.undo) {
      item.undo();
      setUndoStack(prev => prev.filter(u => u.id !== id));
    }
  }, [undoStack]);

  const clearUndo = useCallback((id) => {
    setUndoStack(prev => prev.filter(u => u.id !== id));
  }, []);

  const clearAllUndo = useCallback(() => {
    setUndoStack([]);
  }, []);

  return {
    undoStack,
    pushUndo,
    executeUndo,
    clearUndo,
    clearAllUndo,
    hasUndo: undoStack.length > 0
  };
};

export default useUndoStack;