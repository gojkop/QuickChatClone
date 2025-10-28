// src/components/dashboardv2/inbox/PanelContainer.jsx
// Container for cascading panel layout (Linear-style)

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Panel from './Panel';

/**
 * PanelContainer Component
 * Manages the cascading panel layout with backdrop and keyboard navigation
 *
 * @param {Object} props
 * @param {Array} props.panels - Array of panel objects from usePanelStack
 * @param {Function} props.onClosePanel - Callback to close a specific panel
 * @param {Function} props.onCloseTopPanel - Callback to close the topmost panel
 * @param {Function} props.renderPanel - Function to render panel content based on type
 * @param {string} props.className - Additional CSS classes
 */
function PanelContainer({
  panels = [],
  onClosePanel,
  onCloseTopPanel,
  renderPanel,
  className = ''
}) {
  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // Keyboard navigation: Esc to close top panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseTopPanel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseTopPanel]);

  // Get the active (topmost) panel
  const activePanel = panels[panels.length - 1];

  // Create click handler for inactive panels
  // Closes all panels above the clicked panel
  const handleInactivePanelClick = (clickedPanelType) => {
    // For list panel, close all panels above it
    if (clickedPanelType === 'list') {
      onClosePanel('detail'); // This also closes answer panel per usePanelStack logic
    } else if (clickedPanelType === 'detail') {
      onClosePanel('answer'); // Only close answer panel
    }
  };

  return (
    <div className={`panel-container relative flex w-full h-full overflow-hidden ${className}`}>
      {/* DISABLED: Backdrop overlay temporarily removed - it was causing the dark gray screen bug */}
      {/* The backdrop was showing a dark overlay (rgba(0, 0, 0, 0.05-0.15)) that persisted */}
      {/* during panel transitions, creating a "dark gray empty background" effect */}
      {/*
      <AnimatePresence>
        {panels.length > 1 && (
          <motion.div
            key="panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none z-0 hidden lg:block"
            style={{
              background: `rgba(0, 0, 0, ${Math.min(0.05 * (panels.length - 1), 0.15)})`
            }}
          />
        )}
      </AnimatePresence>
      */}

      {/* Panels */}
      <AnimatePresence mode="sync">
        {panels.map((panel, index) => {
          const isActive = panel.id === activePanel?.id;
          // IMPORTANT: zIndex must increase with index so newer panels are on top
          // Use base of 10 to avoid conflicts with other elements
          const zIndex = 10 + index;

          return (
            <Panel
              key={panel.id}
              id={panel.id}
              type={panel.type}
              width={panel.width}
              zIndex={zIndex}
              isActive={isActive}
              isMobile={isMobile}
              onClose={isActive ? () => onClosePanel(panel.type) : () => handleInactivePanelClick(panel.type)}
              showCloseButton={panel.type !== 'list'}
            >
              {renderPanel(panel)}
            </Panel>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default PanelContainer;