
1. Enhanced URL Routing with Deep Linking
/src/hooks/dashboardv2/useURLSync.js (NEW)
// src/hooks/dashboardv2/useURLSync.js
// URL synchronization for panel state with deep linking support

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Parse URL hash to determine panel state
 * Examples:
 *   #question-123 → { detail: 123 }
 *   #question-123/answer → { detail: 123, answer: true }
 */
const parseHash = (hash) => {
  if (!hash || hash === '#') {
    return { detail: null, answer: false };
  }

  const cleanHash = hash.replace('#', '');
  const parts = cleanHash.split('/');

  if (parts[0].startsWith('question-')) {
    const questionId = parseInt(parts[0].replace('question-', ''), 10);
    const showAnswer = parts.includes('answer');

    return {
      detail: isNaN(questionId) ? null : questionId,
      answer: showAnswer
    };
  }

  return { detail: null, answer: false };
};

/**
 * Generate URL hash from panel state
 */
const generateHash = (detailQuestionId, isAnswering) => {
  if (!detailQuestionId) return '';
  
  let hash = `#question-${detailQuestionId}`;
  if (isAnswering) {
    hash += '/answer';
  }
  
  return hash;
};

/**
 * Hook for syncing URL with panel state
 *
 * @param {Object} params
 * @param {Array} params.questions - List of questions
 * @param {Function} params.openPanel - Open panel function
 * @param {Function} params.closePanel - Close panel function
 * @param {Function} params.isPanelOpen - Check if panel is open
 * @param {Function} params.getPanelData - Get panel data
 */
export const useURLSync = ({
  questions,
  openPanel,
  closePanel,
  closeAllPanels,
  isPanelOpen,
  getPanelData
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL → Panel State (on mount and hash change)
  useEffect(() => {
    const hashState = parseHash(location.hash);

    if (hashState.detail && questions.length > 0) {
      const question = questions.find(q => q.id === hashState.detail);

      if (question) {
        // Open detail panel
        if (!isPanelOpen('detail') || getPanelData('detail')?.id !== question.id) {
          openPanel('detail', question);
        }

        // Open answer panel if needed
        if (hashState.answer && !isPanelOpen('answer')) {
          openPanel('answer', question);
        }
      }
    } else if (!hashState.detail) {
      // No hash, close all panels
      closeAllPanels();
    }
  }, [location.hash, questions]);

  // Panel State → URL
  const syncURL = (detailQuestionId, isAnswering) => {
    const expectedHash = generateHash(detailQuestionId, isAnswering);
    
    if (location.hash !== expectedHash) {
      navigate(`/dashboard/inbox${expectedHash}`, { replace: true });
    }
  };

  return { syncURL, parseHash, generateHash };
};

export default useURLSync;
2. Keyboard Shortcuts Hook
/src/hooks/dashboardv2/useKeyboardShortcuts.js (NEW)
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