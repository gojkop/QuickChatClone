import React, { useState } from 'react';

function AccordionItem({ question, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3
        className="faq-question font-semibold text-lg text-gray-900 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </h3>
      <div
        className="faq-answer overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: isOpen ? '1000px' : '0' }}
      >
        <div className="pt-4 text-gray-700">{children}</div>
      </div>
    </div>
  );
}

export default AccordionItem;