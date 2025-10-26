// src/components/dashboardv2/inbox/KeyboardShortcutsModal.jsx
// Modal showing keyboard shortcuts

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['j'], description: 'Next question' },
      { keys: ['k'], description: 'Previous question' },
      { keys: ['Enter'], description: 'Open selected question' },
      { keys: ['Esc'], description: 'Close panel' },
      { keys: ['Shift', 'Esc'], description: 'Close all panels' }
    ]
  },
  {
    category: 'Actions',
    items: [
      { keys: ['a'], description: 'Answer current question' },
      { keys: ['c'], description: 'Copy question link' },
      { keys: ['p'], description: 'Pin/unpin question' },
      { keys: ['Shift', 'Click'], description: 'Select range of questions' }
    ]
  },
  {
    category: 'General',
    items: [
      { keys: ['?'], description: 'Show this help' },
      { keys: ['Cmd', 'K'], description: 'Quick search (coming soon)' }
    ]
  }
];

function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Keyboard size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                    <p className="text-sm text-gray-500">Speed up your workflow</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
                <div className="space-y-6">
                  {shortcuts.map((section) => (
                    <div key={section.category}>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                        {section.category}
                      </h3>
                      <div className="space-y-2">
                        {section.items.map((shortcut, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm text-gray-700">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, idx) => (
                                <React.Fragment key={idx}>
                                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono font-semibold text-gray-800 shadow-sm">
                                    {key}
                                  </kbd>
                                  {idx < shortcut.keys.length - 1 && (
                                    <span className="text-gray-400 text-xs">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Tip */}
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    <strong>Pro tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-white border border-indigo-300 rounded text-xs font-mono">?</kbd> anytime to see this help.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default KeyboardShortcutsModal;