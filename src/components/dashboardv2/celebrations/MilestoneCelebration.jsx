// src/components/dashboardv2/celebrations/MilestoneCelebration.jsx
// Professional celebration component for milestones (no confetti, subtle elegance)

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, DollarSign, Star, X } from 'lucide-react';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function MilestoneCelebration({ type, data, isOpen, onClose, onAction }) {
  if (!isOpen) return null;

  const celebrationConfig = {
    first_question: {
      icon: MessageSquare,
      iconBg: 'from-indigo-500 to-purple-500',
      title: 'Your First Question! 🎯',
      description: (
        <>
          <span className="font-semibold">{data?.userName || 'Someone'}</span> just paid{' '}
          <span className="font-bold text-green-600">{formatCurrency(data?.amount)}</span> for your expertise
        </>
      ),
      preview: data?.questionPreview,
      primaryAction: 'Answer Now',
      secondaryAction: 'View Later',
    },
    first_answer: {
      icon: CheckCircle,
      iconBg: 'from-green-500 to-emerald-500',
      title: 'First Answer Delivered! ✨',
      description: `You just earned ${formatCurrency(data?.earnings)}. Great start!`,
      preview: null,
      primaryAction: 'View Answer',
      secondaryAction: 'Close',
    },
    profile_complete: {
      icon: Star,
      iconBg: 'from-green-500 to-emerald-500',
      title: 'Profile Complete! ⭐',
      description: "You're now 3x more likely to get questions. Keep it up!",
      preview: null,
      primaryAction: 'View Profile',
      secondaryAction: 'Close',
    },
    first_payment: {
      icon: DollarSign,
      iconBg: 'from-green-500 to-emerald-500',
      title: 'First Payment Received! 💰',
      description: `${formatCurrency(data?.amount)} has been added to your account`,
      preview: null,
      primaryAction: 'View Earnings',
      secondaryAction: 'Close',
    },
  };

  const config = celebrationConfig[type] || celebrationConfig.first_question;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-50" />

          {/* Content */}
          <div className="relative p-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Icon with subtle pulse */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`w-16 h-16 bg-gradient-to-br ${config.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
            >
              <Icon className="w-8 h-8 text-white" strokeWidth={2} />
            </motion.div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {config.title}
            </h3>

            {/* Description */}
            <p className="text-base text-gray-600 mb-3">
              {config.description}
            </p>

            {/* Preview (for questions) */}
            {config.preview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 line-clamp-3">
                  "{config.preview}"
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onAction?.('primary');
                  onClose();
                }}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md"
              >
                {config.primaryAction}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                {config.secondaryAction}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MilestoneCelebration;
