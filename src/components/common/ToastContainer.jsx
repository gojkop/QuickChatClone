// src/components/common/ToastContainer.jsx
// Container for toast notifications

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';

function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;  