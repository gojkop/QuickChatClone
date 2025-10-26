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