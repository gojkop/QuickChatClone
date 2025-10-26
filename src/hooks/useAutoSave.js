// src/hooks/useAutoSave.js
// Auto-save functionality with debouncing

import { useEffect, useRef, useCallback } from 'react';

export const useAutoSave = (data, onSave, options = {}) => {
  const {
    delay = 2000, // 2 seconds debounce
    enabled = true,
    key = 'autosave'
  } = options;

  const timeoutRef = useRef(null);
  const previousDataRef = useRef(data);

  useEffect(() => {
    if (!enabled) return;

    // Skip if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    previousDataRef.current = data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSave(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, onSave]);

  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSave(data);
  }, [data, onSave]);

  return { saveNow };
};

export default useAutoSave;