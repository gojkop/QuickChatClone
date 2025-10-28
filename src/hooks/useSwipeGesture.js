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
  const touchStartY = useRef(null);
  const touchEndY = useRef(null);

  const handleTouchStart = (e) => {
    if (!enabled) return;
    touchEnd.current = null;
    touchEndY.current = null;
    touchStart.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!enabled) return;
    touchEnd.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!enabled || !touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current - touchEnd.current;
    const distanceY = touchStartY.current - touchEndY.current;

    // Calculate absolute distances
    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);

    // Only trigger swipe if:
    // 1. Horizontal distance is greater than threshold
    // 2. Horizontal movement is significantly larger than vertical movement (at least 2x)
    // This prevents triggering during vertical scrolling
    if (absDistanceX < threshold || absDistanceX < absDistanceY * 2) {
      return;
    }

    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;

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