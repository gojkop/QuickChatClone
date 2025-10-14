import React, { useState } from 'react';

const HelpButton = ({ children, position = 'right' }) => {
  const [show, setShow] = useState(false);
  
  const positionClasses = {
    right: 'left-6 top-0',
    left: 'right-6 top-0',
    bottom: 'left-0 top-6'
  };
  
  return (
    <div className="relative inline-block">
      <button 
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
        <div className={`absolute z-50 w-64 p-3 bg-white border-2 border-indigo-200 rounded-lg shadow-xl text-sm text-gray-700 ${positionClasses[position]}`}>
          <div className="absolute -left-2 top-2 w-4 h-4 bg-white border-l-2 border-t-2 border-indigo-200 transform rotate-45"></div>
          {children}
        </div>
      )}
    </div>
  );
};

export default HelpButton;