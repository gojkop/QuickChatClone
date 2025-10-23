import React, { useState } from 'react';
import { SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '../shared/SVGIcons';
import { MindPilotQuestionCoach } from '@/components/question/MindPilotQuestionCoach';

function MindPilotPanel({ questionTitle, questionText, expertId, expertProfile, onApplySuggestions }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!questionTitle || questionTitle.length < 5) {
    return null; // Don't show until title is valid
  }

  return (
    <div className="border-2 border-purple-200 rounded-xl overflow-hidden bg-gradient-to-r from-purple-50 to-indigo-50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 hover:bg-white/50 transition flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-900">Get mindPilot Feedback</span>
          <span className="text-xs text-purple-600 font-medium">(AI-powered)</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 bg-white">
          <MindPilotQuestionCoach
            questionTitle={questionTitle}
            questionText={questionText}
            expertId={expertId}
            expertProfile={expertProfile}
            onApplySuggestions={onApplySuggestions}
          />
        </div>
      )}
    </div>
  );
}

export default MindPilotPanel;