// src/hooks/dashboardv2/usePanelStack.js
// Panel stack management for cascading Linear-style layout

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


// At the top, add localStorage helpers
const PANEL_WIDTH_KEY = 'quickchat_panel_widths';

const loadSavedWidths = () => {
  try {
    const saved = localStorage.getItem(PANEL_WIDTH_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveWidths = (widths) => {
  try {
    localStorage.setItem(PANEL_WIDTH_KEY, JSON.stringify(widths));
  } catch {
    // Ignore localStorage errors
  }
};

// Update PANEL_CONFIGS to use saved widths
const PANEL_CONFIGS = loadSavedWidths() || {
  1: { list: 100 },
  2: { list: 30, detail: 70 },
  3: { list: 10, detail: 20, answer: 70 }
};

// Add this new function to update panel widths
export const updatePanelWidths = (panelCount, newWidths) => {
  PANEL_CONFIGS[panelCount] = newWidths;
  saveWidths(PANEL_CONFIGS);
};

/**
 * Responsive panel configurations for smaller screens
 */
const RESPONSIVE_CONFIGS = {
  // For screens < 1440px, hide list when 3 panels are open
  1440: {
    3: { list: 0, detail: 25, answer: 75 }
  },
  // For screens < 1280px, show only the active panel when answering
  1280: {
    3: { list: 0, detail: 0, answer: 100 }
  },
  // For mobile (< 768px), show only active panel for all scenarios
  768: {
    2: { list: 0, detail: 100 },
    3: { list: 0, detail: 0, answer: 100 }
  }
};

/**
 * Calculate panel widths based on number of panels and screen width
 */
const calculatePanelWidths = (panels, screenWidth) => {
  const count = panels.length;
  let config = PANEL_CONFIGS[count] || PANEL_CONFIGS[1];

  // Apply responsive overrides (check from smallest to largest)
  if (screenWidth < 768 && RESPONSIVE_CONFIGS[768][count]) {
    config = RESPONSIVE_CONFIGS[768][count];
  } else if (screenWidth < 1280 && RESPONSIVE_CONFIGS[1280][count]) {
    config = RESPONSIVE_CONFIGS[1280][count];
  } else if (screenWidth < 1440 && RESPONSIVE_CONFIGS[1440][count]) {
    config = RESPONSIVE_CONFIGS[1440][count];
  }

  return panels.map(panel => ({
    ...panel,
    width: config[panel.type] || 0
  }));
};

/**
 * Hook for managing cascading panel stack
 *
 * @returns {Object} Panel stack state and control functions
 */
export const usePanelStack = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [panels, setPanels] = useState([
    { id: 'list', type: 'list', width: 100, data: null }
  ]);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );

  // Track screen width for responsive panel sizing
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recalculate widths when screen size changes
  useEffect(() => {
    setPanels(prev => calculatePanelWidths(prev, screenWidth));
  }, [screenWidth]);

  /**
   * Open a new panel or replace existing panel of same type
   */
  const openPanel = useCallback((type, data = null) => {
    setPanels(prev => {
      let newPanels = [...prev];

      // Check if panel type already exists
      const existingIndex = newPanels.findIndex(p => p.type === type);

      if (existingIndex > 0) {
        // Replace existing panel with new data
        newPanels[existingIndex] = {
          id: `${type}-${Date.now()}`,
          type,
          data
        };
      } else if (existingIndex === -1) {
        // Add new panel
        newPanels.push({
          id: `${type}-${Date.now()}`,
          type,
          data
        });
      } else {
        // Panel is the list (index 0), don't modify
        return prev;
      }

      // Calculate widths for new panel configuration
      return calculatePanelWidths(newPanels, screenWidth);
    });
  }, [screenWidth]);

  /**
   * Close a specific panel by type
   */
  const closePanel = useCallback((type) => {
    setPanels(prev => {
      // Never close the list panel
      if (type === 'list') return prev;

      const filtered = prev.filter(p => p.type !== type);

      // If we're closing answer panel and detail is still open, keep it
      // If we're closing detail panel, also close answer panel
      let finalPanels = filtered;
      if (type === 'detail') {
        finalPanels = filtered.filter(p => p.type !== 'answer');
      }

      return calculatePanelWidths(finalPanels, screenWidth);
    });
  }, [screenWidth]);

  /**
   * Close the topmost panel
   */
  const closeTopPanel = useCallback(() => {
    setPanels(prev => {
      if (prev.length <= 1) return prev;

      const newPanels = prev.slice(0, -1);
      return calculatePanelWidths(newPanels, screenWidth);
    });
  }, [screenWidth]);

  /**
   * Close all panels except the list
   */
  const closeAllPanels = useCallback(() => {
    setPanels(prev => {
      const listPanel = prev.find(p => p.type === 'list');
      if (!listPanel) return prev;

      return calculatePanelWidths([listPanel], screenWidth);
    });
  }, [screenWidth]);

  /**
   * Get the currently active panel (topmost)
   */
  const getActivePanel = useCallback(() => {
    return panels[panels.length - 1] || null;
  }, [panels]);

  /**
   * Get panel by type
   */
  const getPanel = useCallback((type) => {
    return panels.find(p => p.type === type) || null;
  }, [panels]);

  /**
   * Check if a specific panel is open
   */
  const isPanelOpen = useCallback((type) => {
    return panels.some(p => p.type === type);
  }, [panels]);

  /**
   * Get the data for a specific panel
   */
  const getPanelData = useCallback((type) => {
    const panel = panels.find(p => p.type === type);
    return panel ? panel.data : null;
  }, [panels]);

  /**
   * Update data for an existing panel without re-mounting
   */
  const updatePanelData = useCallback((type, data) => {
    setPanels(prev => prev.map(panel =>
      panel.type === type
        ? { ...panel, data }
        : panel
    ));
  }, []);

  return {
    panels,
    openPanel,
    closePanel,
    closeTopPanel,
    closeAllPanels,
    getActivePanel,
    getPanel,
    isPanelOpen,
    getPanelData,
    updatePanelData,
    screenWidth
  };
};

export default usePanelStack;