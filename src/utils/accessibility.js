// src/utils/accessibility.js
// Accessibility utilities and ARIA helpers

export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const setAriaLabelForPanel = (panelType, questionTitle) => {
  const labels = {
    list: 'Question list',
    detail: `Question details: ${questionTitle}`,
    answer: `Answering question: ${questionTitle}`
  };

  return labels[panelType] || 'Panel';
};

export const getKeyboardShortcutLabel = (key) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const labels = {
    'Cmd': isMac ? '⌘' : 'Ctrl',
    'Alt': isMac ? '⌥' : 'Alt',
    'Shift': '⇧',
    'Enter': '↵',
    'Esc': 'Esc'
  };

  return labels[key] || key;
};

// Skip link component for keyboard users
export const SkipLink = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
  >
    {children}
  </a>
);