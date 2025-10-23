import { useEffect, useRef } from 'react';

const AUTOSAVE_KEY = 'quickchat_question_draft';
const AUTOSAVE_DELAY = 2000; // 2 seconds after last change

export function useAutoSave(data, enabled = true) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
        console.log('💾 Draft auto-saved');
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled]);
}

export function loadDraft() {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (!saved) return null;

    const { data, timestamp } = JSON.parse(saved);
    
    // Expire after 24 hours
    const age = Date.now() - timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(AUTOSAVE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
    console.log('🗑️ Draft cleared');
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}