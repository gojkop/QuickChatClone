// src/hooks/useFocusManagement.js
// Focus trap and management for accessibility

import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
];

export const useFocusTrap = (isActive = false) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(FOCUSABLE_ELEMENTS.join(','));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
};

export const useFocusReturn = (isActive = false) => {
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (isActive) {
      // Store currently focused element
      previouslyFocused.current = document.activeElement;
    } else {
      // Return focus when deactivated
      if (previouslyFocused.current && typeof previouslyFocused.current.focus === 'function') {
        previouslyFocused.current.focus();
      }
    }
  }, [isActive]);
};

export const useArrowKeyNavigation = (items, onSelect, isActive = false) => {
  const selectedIndexRef = useRef(0);

  useEffect(() => {
    if (!isActive || !items.length) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedIndexRef.current = Math.min(selectedIndexRef.current + 1, items.length - 1);
          onSelect(items[selectedIndexRef.current]);
          break;

        case 'ArrowUp':
          e.preventDefault();
          selectedIndexRef.current = Math.max(selectedIndexRef.current - 1, 0);
          onSelect(items[selectedIndexRef.current]);
          break;

        case 'Home':
          e.preventDefault();
          selectedIndexRef.current = 0;
          onSelect(items[0]);
          break;

        case 'End':
          e.preventDefault();
          selectedIndexRef.current = items.length - 1;
          onSelect(items[items.length - 1]);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [items, onSelect, isActive]);
};

export default useFocusTrap;