// src/components/dashboardv2/inbox/Panel.jsx
// Individual panel component with slide-in animations

import React from 'react';
import { motion } from 'framer-motion';
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
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
      mass: 0.8
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

  return (
    <motion.div
      key={id}
      variants={shouldAnimate ? panelVariants : undefined}
      initial={shouldAnimate ? "enter" : false}
      animate={shouldAnimate ? "center" : false}
      exit={shouldAnimate ? "exit" : false}
      className={`
        panel
        relative h-full bg-white
        flex-shrink-0
        ${type !== 'list' ? 'border-l border-gray-200' : ''}
        ${isActive ? 'shadow-2xl' : 'shadow-lg'}
        ${!isVisible ? 'hidden' : ''}
        ${className}
      `}
      style={{
        width: `${width}%`,
        zIndex: zIndex,
        // Apply subtle backdrop on compressed panels
        filter: !isActive && width < 40 ? 'brightness(0.98)' : 'none'
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