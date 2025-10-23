import { useEffect } from 'react';

export function useScrollToElement(trigger, elementId, offset = 100) {
  useEffect(() => {
    if (trigger) {
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [trigger, elementId, offset]);
}