import React, { useState, useEffect } from 'react';
import { PLATFORM_INFO } from '@/constants/shareTemplates';
import { getCharacterCount, copyToClipboard } from '@/utils/templateEngine';
import { trackShare } from '@/utils/shareHelpers';
import BottomSheet from './BottomSheet';

export default function TemplateEditorModal({ 
  isOpen, 
  onClose, 
  template, 
  initialText 
}) {
  const [editedText, setEditedText] = useState(initialText || '');
  const [showCopied, setShowCopied] = useState(false);
  
  const platformInfo = PLATFORM_INFO[template?.platform] || PLATFORM_INFO.email;
  const charInfo = getCharacterCount(editedText, template?.platform);

  useEffect(() => {
    if (isOpen) {
      setEditedText(initialText || '');
      setShowCopied(false);
    }
  }, [isOpen, initialText]);

  const handleCopy = async () => {
    const success = await copyToClipboard(editedText);
    if (success) {
      setShowCopied(true);
      trackShare('edit_copy', template.platform, template.id);
      setTimeout(() => {
        setShowCopied(false);
        onClose();
      }, 1500);
    }
  };

  if (!isOpen || !template) return null;

  const EditorContent = () => (
    <div className="p-4 sm:p-6 space-y-4">
      <textarea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        className="w-full h-64 sm:h-80 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-ink font-medium font-mono text-sm sm:text-base resize-none transition-all duration-base"
        placeholder="Edit your template here..."
        style={{ minHeight: '200px' }}
      />
      
      {/* Character Count */}
      <div className="p-4 bg-canvas rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm sm:text-base font-bold text-subtext">
            {charInfo.count} characters
            {charInfo.limit && ` / ${charInfo.limit}`}
          </span>
          {charInfo.remaining !== null && (
            <span className={`text-sm sm:text-base font-bold ${
              charInfo.isOverLimit ? 'text-error' : 
              charInfo.remaining < 50 ? 'text-warning' : 
              'text-success'
            }`}>
              {charInfo.isOverLimit ? (
                `${Math.abs(charInfo.remaining)} over limit`
              ) : (
                `${charInfo.remaining} remaining`
              )}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        {charInfo.limit && (
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-base ${
                charInfo.isOverLimit ? 'bg-error' :
                charInfo.remaining < 50 ? 'bg-warning' :
                'bg-success'
              }`}
              style={{ 
                width: `${Math.min((charInfo.count / charInfo.limit) * 100, 100)}%` 
              }}
            />
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
        <p className="text-sm sm:text-base text-indigo-900 font-medium">
          <strong>💡 Tip:</strong> Feel free to personalize the message for your audience. Your campaign URL is automatically included.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleCopy}
          disabled={charInfo.isOverLimit}
          className="flex-1 px-6 py-3 sm:py-2.5 text-base sm:text-sm font-bold bg-primary text-white rounded-xl sm:rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 active:scale-98 shadow-elev-2"
          style={{ minHeight: '48px' }}
        >
          {showCopied ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 sm:py-2.5 text-base sm:text-sm font-medium text-ink bg-canvas hover:bg-gray-200 rounded-xl sm:rounded-lg transition-colors active:scale-98"
          style={{ minHeight: '48px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Modal */}
      <div className="hidden sm:block">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="bg-surface rounded-xl shadow-elev-4 w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platformInfo.bgColor}`}>
                  <span className={`text-xl ${platformInfo.iconColor}`}>✏️</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-ink">Edit Template</h3>
                  <p className="text-sm text-subtext font-medium">{template.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-subtext hover:text-ink transition-colors duration-fast p-2 -mr-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <EditorContent />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="sm:hidden">
        <BottomSheet
          isOpen={isOpen}
          onClose={onClose}
        >
          {/* Mobile Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platformInfo.bgColor}`}>
              <span className={`text-xl ${platformInfo.iconColor}`}>✏️</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-ink">Edit Template</h3>
              <p className="text-sm text-subtext font-medium">{template.title}</p>
            </div>
          </div>

          <EditorContent />
        </BottomSheet>
      </div>
    </>
  );
}