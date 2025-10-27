import React, { useState } from 'react';
import { CheckCircle, Copy, Linkedin, Mail, ExternalLink } from 'lucide-react';

function OnboardingSuccessModal({ handle, onContinue }) {
  const [copied, setCopied] = useState(false);
  const profileUrl = `https://mindpick.me/${handle}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleAddToSignature = () => {
    // Copy email signature text
    const signatureText = `\n\n---\nBook time with me: ${profileUrl}`;
    navigator.clipboard.writeText(signatureText);
    alert('Email signature copied! Paste it into your email signature settings.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
          You're Live! 🎉
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 text-center mb-8">
          Your expert profile is ready to receive questions
        </p>

        {/* Profile URL Display */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">
            Your Link
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-indigo-200">
              <p className="text-sm font-mono text-gray-900 truncate">
                {profileUrl}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Quick Share Actions */}
        <div className="space-y-3 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Share your link and start receiving questions:
          </p>

          {/* Share on LinkedIn */}
          <button
            onClick={handleShareLinkedIn}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#0077B5] hover:bg-[#006399] text-white rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Linkedin className="w-5 h-5" />
              <span className="font-semibold">Share on LinkedIn</span>
            </div>
            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          </button>

          {/* Add to Email Signature */}
          <button
            onClick={handleAddToSignature}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Add to Email Signature</span>
            </div>
            <Copy className="w-4 h-4 opacity-70 group-hover:opacity-100" />
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Go to Dashboard
        </button>

        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can optimize your profile and share your link anytime from the dashboard
        </p>
      </div>
    </div>
  );
}

export default OnboardingSuccessModal;
