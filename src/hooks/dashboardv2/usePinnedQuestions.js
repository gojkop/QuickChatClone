// src/hooks/dashboardv2/usePinnedQuestions.js
// Manage pinned questions

import { useState, useEffect, useCallback } from 'react';

const PINNED_KEY = 'quickchat_pinned_questions';

const loadPinned = () => {
  try {
    const data = localStorage.getItem(PINNED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const savePinned = (pinnedIds) => {
  try {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedIds));
  } catch (error) {
    console.error('Failed to save pinned questions:', error);
  }
};

export const usePinnedQuestions = () => {
  const [pinnedIds, setPinnedIds] = useState(loadPinned);

  useEffect(() => {
    savePinned(pinnedIds);
  }, [pinnedIds]);

  const togglePin = useCallback((questionId) => {
    setPinnedIds(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const pin = useCallback((questionId) => {
    setPinnedIds(prev => 
      prev.includes(questionId) ? prev : [...prev, questionId]
    );
  }, []);

  const unpin = useCallback((questionId) => {
    setPinnedIds(prev => prev.filter(id => id !== questionId));
  }, []);

  const isPinned = useCallback((questionId) => {
    return pinnedIds.includes(questionId);
  }, [pinnedIds]);

  const sortWithPinned = useCallback((questions) => {
    return [...questions].sort((a, b) => {
      const aPin = isPinned(a.id);
      const bPin = isPinned(b.id);
      
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;
      return 0;
    });
  }, [isPinned]);

  return {
    pinnedIds,
    togglePin,
    pin,
    unpin,
    isPinned,
    sortWithPinned,
    pinnedCount: pinnedIds.length
  };
};

export default usePinnedQuestions;