// src/components/dashboardv2/inbox/PanelContainer.jsx
// Container for cascading panel layout (Linear-style)

import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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

  return (
    <div className={`panel-container relative flex w-full h-full overflow-hidden ${className}`}>
      {/* Panels */}
      <AnimatePresence mode="sync">
        {panels.map((panel, index) => {
          const isActive = panel.id === activePanel?.id;
          const zIndex = index;

          return (
            <Panel
              key={panel.id}
              id={panel.id}
              type={panel.type}
              width={panel.width}
              zIndex={zIndex}
              isActive={isActive}
              onClose={() => onClosePanel(panel.type)}
              showCloseButton={panel.type !== 'list'}
            >
              {renderPanel(panel)}
            </Panel>
          );
        })}
      </AnimatePresence>

      {/* Backdrop overlay when multiple panels are open */}
      {panels.length > 1 && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `rgba(0, 0, 0, ${Math.min(0.05 * (panels.length - 1), 0.15)})`,
            transition: 'background 200ms ease-out'
          }}
        />
      )}

      {/* Click-outside handler for mobile/tablet */}
      {panels.length > 2 && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onCloseTopPanel}
          style={{
            background: 'rgba(0, 0, 0, 0.3)'
          }}
        />
      )}
    </div>
  );
}

export default PanelContainer;