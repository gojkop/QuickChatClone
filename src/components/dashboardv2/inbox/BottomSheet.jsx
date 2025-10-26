// src/components/dashboardv2/inbox/BottomSheet.jsx
// Mobile bottom sheet for answer composer

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Minus } from 'lucide-react';

/**
 * BottomSheet Component
 * Native-like bottom sheet for mobile devices
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether sheet is open
 * @param {Function} props.onClose - Callback when sheet is closed
 * @param {React.ReactNode} props.children - Sheet content
 * @param {Array} props.snapPoints - Snap points as percentages [0.3, 0.6, 0.95]
 * @param {number} props.defaultSnap - Default snap point index
 * @param {string} props.title - Sheet title
 */
function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [0.3, 0.6, 0.95],
  defaultSnap = 1,
  title = ''
}) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const y = useMotionValue(0);
  const containerRef = useRef(null);

  const height = useTransform(y, (value) => {
    const windowHeight = window.innerHeight;
    const snapHeight = snapPoints[currentSnap] * windowHeight;
    return Math.max(0, snapHeight - value);
  });

  const handleDragEnd = (event, info) => {
    const windowHeight = window.innerHeight;
    const currentHeight = snapPoints[currentSnap] * windowHeight;
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Closing threshold
    if (offset > 150 || velocity > 500) {
      onClose();
      return;
    }

    // Determine new snap point
    let newSnap = currentSnap;

    if (offset < -100 && currentSnap < snapPoints.length - 1) {
      // Swipe up - expand
      newSnap = currentSnap + 1;
    } else if (offset > 100 && currentSnap > 0) {
      // Swipe down - collapse
      newSnap = currentSnap - 1;
    }

    setCurrentSnap(newSnap);
    y.set(0);
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(defaultSnap);
      y.set(0);
    }
  }, [isOpen, defaultSnap, y]);

  if (!isOpen) return null;

  const currentHeight = snapPoints[currentSnap] * 100;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 flex flex-col"
        style={{
          height: `${currentHeight}vh`,
          maxHeight: '95vh'
        }}
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0 py-3 flex flex-col items-center border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2" />
          
          {title && (
            <div className="w-full px-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Snap Point Indicators */}
        <div className="absolute top-16 right-4 flex flex-col gap-1">
          {snapPoints.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSnap(index);
                y.set(0);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSnap
                  ? 'bg-indigo-600'
                  : 'bg-gray-300'
              }`}
              aria-label={`Snap to ${Math.round(snapPoints[index] * 100)}%`}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

export default BottomSheet;