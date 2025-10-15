// src/components/common/HelpButton.jsx
// MOBILE FIX: Tooltip stays within viewport boundaries

import React, { useState, useRef, useEffect } from 'react';

const HelpButton = ({ children, position = 'right' }) => {
  const [show, setShow] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Auto-adjust position if tooltip would overflow on mobile
  useEffect(() => {
    if (show && tooltipRef.current && buttonRef.current) {
      const tooltip = tooltipRef.current;
      const button = buttonRef.current;
      const rect = tooltip.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newPosition = position;
      
      // Check horizontal overflow
      if (rect.right > viewportWidth - 16) {
        newPosition = 'left';
      } else if (rect.left < 16) {
        newPosition = 'right';
      }
      
      // Check vertical overflow
      if (rect.bottom > viewportHeight - 16) {
        newPosition = 'top';
      }
      
      setAdjustedPosition(newPosition);
    }
  }, [show, position]);
  
  const positionClasses = {
    right: 'left-full ml-2 top-0',
    left: 'right-full mr-2 top-0',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2'
  };
  
  const arrowClasses = {
    right: '-left-2 top-2 rotate-45 border-l-2 border-t-2',
    left: '-right-2 top-2 -rotate-45 border-r-2 border-t-2',
    top: '-bottom-2 left-1/2 -translate-x-1/2 rotate-[135deg] border-l-2 border-t-2',
    bottom: '-top-2 left-1/2 -translate-x-1/2 -rotate-45 border-r-2 border-t-2'
  };
  
  return (
    <div className="relative inline-block">
      <button 
        ref={buttonRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1 text-gray-400 hover:text-indigo-600 transition-colors"
        type="button"
      >
        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {show && (
        <div 
          ref={tooltipRef}
          className={`absolute z-50 w-64 max-w-[calc(100vw-2rem)] p-3 bg-white border-2 border-indigo-200 rounded-lg shadow-xl text-sm text-gray-700 ${positionClasses[adjustedPosition]}`}
        >
          <div className={`absolute w-4 h-4 bg-white border-indigo-200 ${arrowClasses[adjustedPosition]}`}></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpButton;