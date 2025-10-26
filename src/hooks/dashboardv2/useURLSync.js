// src/hooks/dashboardv2/useURLSync.js
// URL synchronization for panel state with deep linking support

import { useEffect, useRef } from 'react';
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
  const isInitialMount = useRef(true);
  const lastSyncedHash = useRef('');
  const processingHash = useRef(false);

  // URL → Panel State (only on mount and when hash changes externally)
  useEffect(() => {
    const currentHash = location.hash;
    
    // Skip if we're already processing this hash to avoid loops
    if (processingHash.current) {
      return;
    }
    
    // Skip if this is the same hash we just synced to avoid loops
    if (currentHash === lastSyncedHash.current && !isInitialMount.current) {
      return;
    }

    const hashState = parseHash(currentHash);

    if (hashState.detail && questions.length > 0) {
      const question = questions.find(q => q.id === hashState.detail);

      if (question) {
        const currentDetailId = getPanelData('detail')?.id;
        
        // Only open detail if it's not already open with the same question
        if (currentDetailId !== question.id) {
          processingHash.current = true;
          openPanel('detail', question);
          // Reset processing flag after a brief delay
          setTimeout(() => { processingHash.current = false; }, 100);
        }

        // Only open answer if needed and not already open
        if (hashState.answer && !isPanelOpen('answer')) {
          openPanel('answer', question);
        } else if (!hashState.answer && isPanelOpen('answer')) {
          closePanel('answer');
        }
      } else {
        // ADDED: Question not found in current list
        // This happens when the URL has a question ID that's filtered out
        console.warn(`Question ${hashState.detail} not found in current filter. Try changing filters.`);
      }
    } else if (!hashState.detail) {
      // No hash, close all panels
      if (isPanelOpen('detail') || isPanelOpen('answer')) {
        closeAllPanels();
      }
    }

    isInitialMount.current = false;
  }, [location.hash, questions, openPanel, closePanel, closeAllPanels, isPanelOpen, getPanelData]);

  // Panel State → URL (debounced to avoid loops)
  const syncURL = (detailQuestionId, isAnswering) => {
    const expectedHash = generateHash(detailQuestionId, isAnswering);
    
    if (location.hash !== expectedHash) {
      lastSyncedHash.current = expectedHash;
      navigate(`${location.pathname}${expectedHash}`, { replace: true });
    } else {
      // Hash already matches, just update the ref
      lastSyncedHash.current = expectedHash;
    }
  };

  return { syncURL, parseHash, generateHash };
};

export default useURLSync;