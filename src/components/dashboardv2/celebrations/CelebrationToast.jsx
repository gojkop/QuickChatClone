// src/components/dashboardv2/celebrations/CelebrationToast.jsx
// Subtle toast notification for micro-celebrations (link copied, profile updated, etc.)

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Star, Share2, X } from 'lucide-react';

const toastConfig = {
  link_copied: {
    icon: Copy,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Link copied',
    description: 'Share it everywhere',
  },
  profile_updated: {
    icon: Check,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Profile updated',
    description: 'Changes saved successfully',
  },
  profile_strength_60: {
    icon: Star,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    title: '60% complete!',
    description: "You're getting there",
  },
  profile_strength_80: {
    icon: Star,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: '80% complete!',
    description: 'Almost an all-star',
  },
  profile_strength_100: {
    icon: Star,
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    iconColor: 'text-white',
    title: 'Profile Complete!',
    description: '3x more likely to get questions',
  },
  shared: {
    icon: Share2,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    title: 'Shared successfully',
    description: 'Spread the word',
  },
};

function CelebrationToast({ type, isVisible, onClose, autoHideDuration = 4000 }) {
  const config = toastConfig[type] || toastConfig.link_copied;
  const Icon = config.icon;

  React.useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-6 right-6 z-50 max-w-sm"
        >
          <div className="flex items-start gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-xl">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} strokeWidth={2.5} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-bold text-gray-900">
                {config.title}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {config.description}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CelebrationToast;
