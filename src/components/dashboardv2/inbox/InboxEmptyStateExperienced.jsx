// src/components/dashboardv2/inbox/InboxEmptyStateExperienced.jsx
// Empty state for experienced experts (has answered questions, but 0 pending)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Share2, TrendingUp, BarChart3, Sparkles } from 'lucide-react';

function QuickActionCard({ icon, title, description, onClick, gradient }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-start p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all text-left group"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h4 className="text-sm font-bold text-gray-900 mb-1">
        {title}
      </h4>
      <p className="text-xs text-gray-600">
        {description}
      </p>
    </motion.button>
  );
}

function InboxEmptyStateExperienced({ answeredCount }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto py-12 px-6 text-center"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-6"
      >
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center shadow-sm">
          <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 mb-3"
      >
        All caught up! 🎉
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-2 max-w-md mx-auto"
      >
        You've answered all pending questions.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 mb-8 max-w-md mx-auto"
      >
        {answeredCount} question{answeredCount !== 1 ? 's' : ''} answered so far
      </motion.p>

      {/* Growth Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-indigo-900">
            Grow Your Business
          </span>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
      >
        <QuickActionCard
          icon={<Share2 className="w-5 h-5" />}
          title="Share Your Link"
          description="Promote on social media"
          onClick={() => navigate('/dashboard/marketing')}
          gradient="from-indigo-500 to-purple-500"
        />
        <QuickActionCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Update Pricing"
          description="Adjust your rates"
          onClick={() => navigate('/dashboard/profile')}
          gradient="from-green-500 to-emerald-500"
        />
        <QuickActionCard
          icon={<BarChart3 className="w-5 h-5" />}
          title="View Analytics"
          description="See your performance"
          onClick={() => navigate('/dashboard/analytics')}
          gradient="from-blue-500 to-cyan-500"
        />
      </motion.div>

      {/* Encouragement */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-gray-500 mt-8"
      >
        Keep sharing your expertise. New questions will appear here.
      </motion.p>
    </motion.div>
  );
}

export default InboxEmptyStateExperienced;
