// src/components/dashboardv2/inbox/PinButton.jsx
// Pin/unpin button component

import React from 'react';
import { Pin } from 'lucide-react';
import { motion } from 'framer-motion';

function PinButton({ isPinned, onClick, className = '' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        p-1.5 rounded-lg transition-colors
        ${isPinned 
          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }
        ${className}
      `}
      title={isPinned ? 'Unpin question' : 'Pin question'}
      aria-label={isPinned ? 'Unpin question' : 'Pin question'}
    >
      <Pin 
        size={14} 
        className={isPinned ? 'fill-current' : ''}
      />
    </motion.button>
  );
}

export default PinButton;