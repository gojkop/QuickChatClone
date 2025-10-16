// src/utils/shareHelpers.js
// Helper functions for native sharing and mobile optimizations

/**
 * Check if native share API is supported
 */
export function isNativeShareSupported() {
  return typeof navigator !== 'undefined' && 
         typeof navigator.share === 'function';
}

/**
 * Share content using native share sheet (iOS/Android)
 * @param {object} options - Share options
 * @returns {Promise<boolean>} - Success status
 */
export async function nativeShare({ title, text, url }) {
  if (!isNativeShareSupported()) {
    return false;
  }
  
  try {
    await navigator.share({
      title: title || 'mindPick',
      text: text || '',
      url: url || '',
    });
    return true;
  } catch (err) {
    // User cancelled or error occurred
    if (err.name === 'AbortError') {
      console.log('Share cancelled');
      return false;
    }
    console.error('Share failed:', err);
    return false;
  }
}

/**
 * Copy to clipboard with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyWithFallback(text) {
  // Try modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard API failed:', err);
    }
  }
  
  // Fallback for older browsers
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}

/**
 * Detect if user is on mobile device
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect if user is on iOS
 */
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Open platform-specific sharing
 * @param {string} platform - Platform name (twitter, linkedin, etc.)
 * @param {string} text - Text to share
 * @param {string} url - URL to share
 */
export function openPlatformShare(platform, text, url) {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent('Check this out')}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
  
  const shareUrl = shareUrls[platform];
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}

/**
 * Track share event
 * @param {string} method - Share method (native, copy, platform)
 * @param {string} platform - Platform name
 * @param {string} templateId - Template ID
 */
export function trackShare(method, platform, templateId) {
  // You can integrate with your analytics here
  console.log('Share tracked:', { method, platform, templateId });
  
  // Example: Send to analytics
  // if (window.analytics) {
  //   window.analytics.track('template_shared', {
  //     method,
  //     platform,
  //     template_id: templateId,
  //   });
  // }
}