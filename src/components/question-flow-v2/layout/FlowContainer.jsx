import React from 'react';
import '../../../styles/question-flow-v2.css';

function FlowContainer({ children }) {
  return (
    <div className="max-w-4xl mx-auto">
      {children}
    </div>
  );
}

export default FlowContainer;