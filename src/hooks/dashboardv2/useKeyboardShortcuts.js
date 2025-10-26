// src/hooks/dashboardv2/useKeyboardShortcuts.js
// Keyboard navigation for inbox

import { useEffect, useCallback } from 'react';

/**
 * Hook for keyboard shortcuts in inbox
 *
 * @param {Object} params
 * @param {Array} params.questions - List of questions
 * @param {number} params.activeQuestionId - Currently active question ID
 * @param {Function} params.onQuestionClick - Callback when question selected
 * @param {Function} params.onAnswer - Callback to start answering
 * @param {Function} params.closeTopPanel - Callback to close top panel
 * @param {Function} params.closeAllPanels - Callback to close all panels
 * @param {boolean} params.enabled - Whether shortcuts are enabled (default: true)
 */
export const useKeyboardShortcuts = ({
  questions = [],
  activeQuestionId = null,
  onQuestionClick,
  onAnswer,
  closeTopPanel,
  closeAllPanels,
  enabled = true
}) => {
  const handleKeyPress = useCallback((e) => {
    // Don't trigger shortcuts when typing in inputs
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
    if (isTyping || !enabled) return;

    const currentIndex = questions.findIndex(q => q.id === activeQuestionId);

    switch (e.key.toLowerCase()) {
      case 'j': // Next question
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          onQuestionClick(questions[currentIndex + 1]);
        }
        break;

      case 'k': // Previous question
        e.preventDefault();
        if (currentIndex > 0) {
          onQuestionClick(questions[currentIndex - 1]);
        } else if (currentIndex === -1 && questions.length > 0) {
          // If no question selected, select first
          onQuestionClick(questions[0]);
        }
        break;

      case 'enter':
        e.preventDefault();
        if (currentIndex === -1 && questions.length > 0) {
          // No question selected, select first
          onQuestionClick(questions[0]);
        }
        break;

      case 'a': // Start answering
        e.preventDefault();
        if (activeQuestionId && onAnswer) {
          onAnswer();
        }
        break;

      case 'escape':
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Esc: Close all panels
          closeAllPanels();
        } else {
          // Esc: Close top panel
          closeTopPanel();
        }
        break;

      case '?': // Show help
        e.preventDefault();
        // Could open a help modal in the future
        console.log('Keyboard shortcuts: j/k = navigate, Enter = select, a = answer, Esc = close');
        break;

      default:
        break;
    }
  }, [questions, activeQuestionId, onQuestionClick, onAnswer, closeTopPanel, closeAllPanels, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return null;
};

export default useKeyboardShortcuts;