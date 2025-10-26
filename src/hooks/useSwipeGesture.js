// src/hooks/useSwipeGesture.js
// Swipe gesture detection for mobile

import { useRef, useEffect } from 'react';

export const useSwipeGesture = (onSwipeRight, onSwipeLeft, options = {}) => {
  const {
    threshold = 50, // Minimum swipe distance in pixels
    enabled = true
  } = options;

  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const handleTouchStart = (e) => {
    if (!enabled) return;
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!enabled) return;
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!enabled || !touchStart.current || !touchEnd.current) return;

    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const element = document.body;

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onSwipeRight, onSwipeLeft, threshold]);

  return null;
};

export default useSwipeGesture;