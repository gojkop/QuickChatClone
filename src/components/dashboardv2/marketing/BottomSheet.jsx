import React, { useEffect, useRef } from 'react';

/**
 * BottomSheet Component
 * Mobile-optimized modal that slides up from bottom
 * Supports swipe-down to dismiss, escape key, and click-outside
 */
export default function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxHeight = '90vh'
}) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when open
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      const focusableElements = sheetRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      firstElement?.focus();

      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    // Only allow downward swipes
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    
    if (sheetRef.current) {
      // If swiped down more than 100px, close
      if (diff > 100) {
        onClose();
      } else {
        // Otherwise, spring back
        sheetRef.current.style.transform = 'translateY(0)';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: 'fadeIn 200ms ease-out' }}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full bg-surface sm:max-w-2xl sm:rounded-xl shadow-elev-4"
        style={{ 
          maxHeight,
          animation: 'slideUp 300ms cubic-bezier(0.2, 0.0, 0.2, 1)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-black text-ink">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-subtext hover:text-ink transition-colors"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}