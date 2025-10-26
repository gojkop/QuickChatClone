// src/components/dashboardv2/inbox/AnimatedPanel.jsx
// Enhanced panel with content fade-in animations

import React from 'react';
import { motion } from 'framer-motion';

const contentVariants = {
  enter: {
    opacity: 0,
    y: 10
  },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2
    }
  }
};

function AnimatedPanel({ children, className = '' }) {
  return (
    <motion.div
      variants={contentVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedPanel;