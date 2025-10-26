// src/utils/clipboard.js
// Clipboard utilities

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        textArea.remove();
        return false;
      }
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

export const getQuestionLink = (questionId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/dashboard/inbox#question-${questionId}`;
};

/**
 * Copy question link to clipboard
 * @param {number} questionId - Question ID
 * @returns {Promise<boolean>} - Success status
 */
export const copyQuestionLink = async (questionId) => {
  const link = getQuestionLink(questionId);
  return await copyToClipboard(link);
};