// src/components/dashboardv2/inbox/InboxEmptyState.jsx
// Professional empty state for inbox with onboarding checklist and quick actions

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Share2, Linkedin, Mail, CheckCircle2, Circle } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { copyToClipboard } from '@/utils/clipboard';
import { useToast } from '@/components/common/Toast';

function ChecklistItem({ checked, label, impact }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {checked ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {label}
        </p>
        {!checked && impact && (
          <p className="text-xs text-gray-500 mt-0.5">{impact}</p>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all text-center group"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center mb-3 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
        <div className="text-indigo-600">
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

function InboxEmptyState() {
  const navigate = useNavigate();
  const { expertProfile } = useProfile();
  const { showToast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);

  // Check profile completion status
  const hasPhoto = !!expertProfile?.avatar_url;
  const hasBio = !!(expertProfile?.bio && expertProfile.bio.length > 50);
  const hasLinkedIn = !!(expertProfile?.socials?.linkedin);
  const handle = expertProfile?.handle;

  const handleCopyLink = async () => {
    if (!handle) {
      showToast('Please set up your handle first', 'error');
      navigate('/dashboard/profile');
      return;
    }

    const profileUrl = `https://mindpick.me/u/${handle}`;
    const success = await copyToClipboard(profileUrl);

    if (success) {
      setLinkCopied(true);
      showToast('Profile link copied to clipboard!', 'success');
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  const handleLinkedInShare = () => {
    if (!handle) {
      showToast('Please set up your handle first', 'error');
      navigate('/dashboard/profile');
      return;
    }

    const profileUrl = `https://mindpick.me/u/${handle}`;
    const text = `I'm now available for paid consultations on mindPick! Get expert advice from me on your most pressing questions.`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodeURIComponent(text)}`;

    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleEmailSignature = () => {
    if (!handle) {
      showToast('Please set up your handle first', 'error');
      navigate('/dashboard/profile');
      return;
    }

    const profileUrl = `https://mindpick.me/u/${handle}`;
    const signature = `---\n📬 Ask me anything: ${profileUrl}\nPowered by mindPick`;

    copyToClipboard(signature);
    showToast('Email signature copied! Paste it into your email settings.', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto py-12 px-6 text-center"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-6"
      >
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-sm">
          <MessageSquare className="w-10 h-10 text-indigo-400" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 mb-3"
      >
        Your inbox is ready
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-8 max-w-md mx-auto"
      >
        Questions will appear here when clients discover your expertise.
        Let's help them find you.
      </motion.p>

      {/* Profile Optimization Mini-Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border-2 border-gray-100 rounded-xl p-6 mb-8 text-left max-w-md mx-auto shadow-sm"
      >
        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Optimize Your Profile
        </h4>

        <div className="space-y-3 mb-4">
          <ChecklistItem
            checked={hasPhoto}
            label="Add profile photo"
            impact="+40% engagement"
          />
          <ChecklistItem
            checked={hasBio}
            label="Write your bio (2-3 sentences)"
            impact="+60% trust"
          />
          <ChecklistItem
            checked={hasLinkedIn}
            label="Connect LinkedIn"
            impact="+30% credibility"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate('/dashboard/profile')}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm shadow-sm"
        >
          Complete Profile
        </motion.button>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
      >
        <QuickActionCard
          icon={<Share2 className="w-5 h-5" />}
          title="Share Your Link"
          description={linkCopied ? "Copied!" : "Copy your profile URL"}
          onClick={handleCopyLink}
        />
        <QuickActionCard
          icon={<Linkedin className="w-5 h-5" />}
          title="Post on LinkedIn"
          description="Pre-written draft ready"
          onClick={handleLinkedInShare}
        />
        <QuickActionCard
          icon={<Mail className="w-5 h-5" />}
          title="Email Signature"
          description="Add to Gmail/Outlook"
          onClick={handleEmailSignature}
        />
      </motion.div>

      {/* Social Proof */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-gray-500 mt-8"
      >
        Experts with complete profiles get <span className="font-semibold text-indigo-600">3x more questions</span>
      </motion.p>
    </motion.div>
  );
}

export default InboxEmptyState;
