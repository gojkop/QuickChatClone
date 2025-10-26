// src/utils/draftStorage.js
// LocalStorage utilities for draft management

const DRAFT_PREFIX = 'quickchat_draft_';
const DRAFT_INDEX_KEY = 'quickchat_draft_index';

export const saveDraft = (questionId, draftData) => {
  try {
    const key = `${DRAFT_PREFIX}${questionId}`;
    const draft = {
      ...draftData,
      savedAt: Date.now(),
      questionId
    };
    
    localStorage.setItem(key, JSON.stringify(draft));
    
    // Update index
    const index = getDraftIndex();
    if (!index.includes(questionId)) {
      index.push(questionId);
      localStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(index));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    return false;
  }
};

export const loadDraft = (questionId) => {
  try {
    const key = `${DRAFT_PREFIX}${questionId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
};

export const deleteDraft = (questionId) => {
  try {
    const key = `${DRAFT_PREFIX}${questionId}`;
    localStorage.removeItem(key);
    
    // Update index
    const index = getDraftIndex();
    const newIndex = index.filter(id => id !== questionId);
    localStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(newIndex));
    
    return true;
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return false;
  }
};

export const getDraftIndex = () => {
  try {
    const data = localStorage.getItem(DRAFT_INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const getAllDrafts = () => {
  const index = getDraftIndex();
  return index.map(questionId => loadDraft(questionId)).filter(Boolean);
};

export const clearOldDrafts = (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  // Clear drafts older than 7 days by default
  const now = Date.now();
  const index = getDraftIndex();
  
  index.forEach(questionId => {
    const draft = loadDraft(questionId);
    if (draft && (now - draft.savedAt) > maxAge) {
      deleteDraft(questionId);
    }
  });
};