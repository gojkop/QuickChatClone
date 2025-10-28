// src/components/dashboardv2/inbox/Panel.jsx
// Individual panel component with slide-in animations

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Animation variants for panel slide-in/out
 */
const panelVariants = {
  enter: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0 }
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 0.6
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 45,
      mass: 0.6
    }
  }
};

/**
 * Panel Component
 * Represents a single panel in the cascading stack
 *
 * @param {Object} props
 * @param {string} props.id - Unique panel identifier
 * @param {string} props.type - Panel type (list, detail, answer)
 * @param {number} props.width - Panel width percentage (0-100)
 * @param {number} props.zIndex - Z-index for stacking
 * @param {boolean} props.isActive - Whether this is the topmost panel
 * @param {boolean} props.isMobile - Whether on mobile device
 * @param {Function} props.onClose - Callback when panel is closed
 * @param {React.ReactNode} props.children - Panel content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showCloseButton - Whether to show close button
 * @param {string} props.title - Optional panel title for header
 */
function Panel({
  id,
  type,
  width,
  zIndex = 0,
  isActive = false,
  isMobile = false,
  onClose,
  children,
  className = '',
  showCloseButton = true,
  title = null
}) {
  // Don't show close button for list panel
  const shouldShowClose = showCloseButton && type !== 'list' && width > 0;

  // Determine if panel should be visible
  const isVisible = width > 0;

  // CHANGED: Disable animation for list panel (it should always be present)
  const shouldAnimate = type !== 'list';

  // Drag-to-dismiss functionality for mobile
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [0, 300], [1, 0.3]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  // Enable drag-to-dismiss only for active panels on mobile (not list panel)
  const enableDragToDismiss = isMobile && isActive && type !== 'list';

  const handleDragStart = (event, info) => {
    setIsDragging(true);
    dragStartX.current = info.point.x;
    dragStartY.current = info.point.y;
  };

  const handleDrag = (event, info) => {
    // Only allow rightward drag (dismiss gesture)
    const deltaX = info.point.x - dragStartX.current;
    const deltaY = Math.abs(info.point.y - dragStartY.current);

    // If vertical movement is greater than horizontal, don't allow horizontal drag
    // This preserves vertical scrolling
    if (deltaY > Math.abs(deltaX) * 1.5) {
      dragX.set(0);
      return;
    }

    // Only allow rightward drag
    if (deltaX > 0) {
      dragX.set(deltaX);
    }
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);

    const deltaX = info.point.x - dragStartX.current;
    const velocity = info.velocity.x;

    // Dismiss if:
    // 1. Dragged more than 50% of screen width, OR
    // 2. Fast swipe (velocity > 500) in positive direction
    const shouldDismiss = deltaX > window.innerWidth * 0.5 || velocity > 500;

    if (shouldDismiss) {
      onClose();
    } else {
      // Snap back to original position
      dragX.set(0);
    }
  };

  return (
    <motion.div
      key={id}
      variants={shouldAnimate ? panelVariants : undefined}
      initial={shouldAnimate ? "enter" : false}
      animate={shouldAnimate ? "center" : false}
      exit={shouldAnimate ? "exit" : false}
      drag={enableDragToDismiss ? "x" : false}
      dragConstraints={{ left: 0, right: window.innerWidth }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className={`
        panel
        relative h-full bg-white
        flex-shrink-0
        ${type !== 'list' ? 'border-l border-gray-200' : ''}
        ${isActive ? 'shadow-2xl' : 'shadow-lg'}
        ${!isVisible ? 'hidden' : ''}
        ${isDragging ? 'cursor-grabbing' : ''}
        ${className}
      `}
      style={{
        width: `${width}%`,
        zIndex: zIndex,
        // Apply subtle backdrop on compressed panels
        filter: !isActive && width < 40 ? 'brightness(0.98)' : 'none',
        // Prevent browser swipe-back on desktop
        overscrollBehaviorX: 'none',
        // Allow touch actions for drag gesture, but only on mobile when drag is enabled
        touchAction: 'pan-y',
        // Apply drag position and opacity via motion values
        x: enableDragToDismiss ? dragX : undefined,
        opacity: enableDragToDismiss ? dragOpacity : undefined,
      }}
    >
      {/* Panel Header (optional) */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {title}
          </h3>
          {shouldShowClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Panel Content */}
      <div className="h-full overflow-hidden relative">
        {children}
      </div>

       {/* DISABLED: Close button overlay (panels use internal back arrows instead)
      {!title && shouldShowClose && width >= 20 && (
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 z-10
            p-2 bg-white/90 backdrop-blur-sm
            hover:bg-gray-100
            rounded-lg shadow-md
            transition-all duration-200
            border border-gray-200
            group
          "
          aria-label="Close panel"
        >
          <X size={18} className="text-gray-600 group-hover:text-gray-900" />
        </button>
      )}
      */}
      {/* Subtle darkening overlay for inactive panels - clickable on desktop to bring panel forward */}
      {!isActive && width > 0 && width < 100 && (
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black transition-opacity duration-200 cursor-pointer hidden lg:block hover:opacity-0"
          style={{
            opacity: Math.max(0, (100 - width) / 1000) // Very subtle darkening
          }}
          title="Click to return to this view"
        />
      )}
    </motion.div>
  );
}

export default Panel;