// src/components/dashboardv2/inbox/PanelWidthCustomizer.jsx
// UI for customizing panel widths

import React, { useState } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_WIDTHS = {
  2: { list: 30, detail: 70 },
  3: { list: 10, detail: 20, answer: 70 }
};

function PanelWidthCustomizer({ panelCount, currentWidths, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [widths, setWidths] = useState(currentWidths);

  const handleReset = () => {
    const defaults = DEFAULT_WIDTHS[panelCount];
    if (defaults) {
      setWidths(defaults);
      onUpdate(defaults);
    }
  };

  const handleApply = () => {
    onUpdate(widths);
    setIsOpen(false);
  };

  if (panelCount < 2) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Customize panel widths"
      >
        <Settings size={16} className="text-gray-600" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Panel Widths</h3>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(widths).map(([panel, width]) => (
                  <div key={panel}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700 capitalize">
                        {panel}
                      </label>
                      <span className="text-xs text-gray-500">{width}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={width}
                      onChange={(e) => setWidths(prev => ({
                        ...prev,
                        [panel]: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleApply}
                className="w-full mt-4 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PanelWidthCustomizer;