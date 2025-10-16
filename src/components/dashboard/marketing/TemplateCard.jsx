import React, { useState } from 'react';
import { PLATFORM_INFO } from '@/constants/shareTemplates';
import { copyWithFallback, nativeShare, isNativeShareSupported, trackShare } from '@/utils/shareHelpers';
import { getCharacterCount } from '@/utils/templateEngine';

export default function TemplateCard({ template, processedText, onEdit }) {
  const [showCopied, setShowCopied] = useState(false);
  const platformInfo = PLATFORM_INFO[template.platform] || PLATFORM_INFO.email;
  const charInfo = getCharacterCount(processedText, template.platform);
  const supportsNativeShare = isNativeShareSupported();

  const handleQuickCopy = async () => {
    const success = await copyWithFallback(processedText);
    if (success) {
      setShowCopied(true);
      trackShare('quick_copy', template.platform, template.id);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    const success = await nativeShare({
      title: template.title,
      text: processedText,
    });
    if (success) {
      trackShare('native_share', template.platform, template.id);
    } else {
      // Fallback to copy
      handleQuickCopy();
    }
  };

  const getPlatformIcon = () => {
    switch (template.platform) {
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-base overflow-hidden">
      {/* Compact Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${platformInfo.bgColor}`}>
              <div className={platformInfo.iconColor}>
                {getPlatformIcon()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-ink text-sm truncate">{template.title}</h4>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${platformInfo.bgColor} ${platformInfo.textColor} whitespace-nowrap`}>
            {platformInfo.name}
          </span>
        </div>
      </div>

      {/* Content Preview - More compact */}
      <div className="p-3 bg-canvas">
        <div className="font-mono text-xs text-ink whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
          {processedText}
        </div>
        
        {/* Character count - inline */}
        {charInfo.limit && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
            <span className="text-subtext font-medium">
              {charInfo.count} / {charInfo.limit}
            </span>
            {charInfo.isOverLimit && (
              <span className="text-error font-bold">Over limit</span>
            )}
          </div>
        )}
      </div>

      {/* Compact Actions */}
      <div className="p-3 flex gap-2">
        <button
          onClick={handleQuickCopy}
          className="flex-1 px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors duration-base flex items-center justify-center gap-1.5"
        >
          {showCopied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>

        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs font-medium text-ink bg-canvas hover:bg-gray-200 rounded-lg transition-colors duration-base flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>

        {supportsNativeShare && (
          <button
            onClick={handleNativeShare}
            className="px-2 py-1.5 text-xs font-medium text-ink bg-canvas hover:bg-gray-200 rounded-lg sm:hidden"
            title="Share"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}