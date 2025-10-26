// src/components/common/MarkdownEditor.jsx
// Markdown editor with live preview

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';

function MarkdownEditor({ value, onChange, placeholder, maxLength = 5000 }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded flex items-center gap-1"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Markdown help"
          >
            <HelpCircle size={14} />
          </button>
        </div>
        <span className="text-xs text-gray-500">
          {value.length} / {maxLength}
        </span>
      </div>

      {/* Help */}
      {showHelp && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
          <p><code>**bold**</code> → <strong>bold</strong></p>
          <p><code>*italic*</code> → <em>italic</em></p>
          <p><code>[link](url)</code> → <a href="#" className="text-blue-600">link</a></p>
          <p><code>`code`</code> → <code className="bg-gray-200 px-1 rounded">code</code></p>
          <p><code>- list item</code> → bullet list</p>
        </div>
      )}

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="min-h-[160px] p-4 border border-gray-300 rounded-lg bg-white prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || '*Nothing to preview*'}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-base font-mono resize-none"
          rows="6"
        />
      )}
    </div>
  );
}

export default MarkdownEditor;