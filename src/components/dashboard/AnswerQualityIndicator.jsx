// src/components/dashboard/AnswerQualityIndicator.jsx
import React from 'react';
import { Video, Timer, FileText, Lightbulb, Star, ThumbsUp, CheckCircle2, Circle } from 'lucide-react';

const formatTime = (seconds) => {
  if (seconds === undefined || seconds === null || seconds < 0 || isNaN(seconds)) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function AnswerQualityIndicator({ answerData, question, className = '' }) {
  // Calculate checks
  const hasRecording = answerData.recordingSegments?.length > 0;
  const hasText = answerData.text && answerData.text.trim().length > 50;
  const hasSufficientLength = (answerData.recordingDuration || 0) >= 60;
  const hasAnyContent = hasRecording || (answerData.text && answerData.text.trim().length > 0);
  
  const checks = {
    hasRecording: {
      met: hasRecording,
      label: 'Video or audio recording',
      icon: Video,
      color: 'text-purple-600'
    },
    hasSufficientLength: {
      met: hasSufficientLength,
      label: hasRecording ? `Recording length: ${formatTime(answerData.recordingDuration || 0)}` : 'At least 1 minute recommended',
      icon: Timer,
      color: 'text-blue-600'
    },
    hasText: {
      met: hasText,
      label: 'Written summary or context',
      icon: FileText,
      color: 'text-green-600'
    }
  };
  
  const metChecks = Object.values(checks).filter(c => c.met).length;
  const totalChecks = Object.keys(checks).length;
  const percentage = (metChecks / totalChecks) * 100;
  
  const level = percentage >= 66 ? 'excellent' : percentage >= 33 ? 'good' : 'basic';
  
  // If no content at all, show a different message
  if (!hasAnyContent) {
    return (
      <div className={`p-4 sm:p-5 rounded-xl border-2 bg-amber-50 border-amber-200 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
          </div>
          
          <div className="flex-1">
            <div className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
              Ready to Record Your Answer?
            </div>
            
            <p className="text-xs sm:text-sm text-gray-700 mb-3">
              Add a video recording, audio message, or written response to answer this question.
            </p>
            
            <div className="bg-white rounded-lg p-3 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Tip:</strong> Video answers get higher ratings! Show your expertise by recording a quick video response.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 sm:p-5 rounded-xl border-2 ${
      level === 'excellent' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
      level === 'good' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' :
      'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
    } ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          level === 'excellent' ? 'bg-green-100' :
          level === 'good' ? 'bg-blue-100' :
          'bg-amber-100'
        }`}>
          {level === 'excellent' ? (
            <Star className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 fill-yellow-500" />
          ) : level === 'good' ? (
            <ThumbsUp className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          ) : (
            <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
            Answer Quality: {level === 'excellent' ? 'Excellent!' : level === 'good' ? 'Good' : 'Getting Started'}
          </div>
          
          <div className="space-y-2 text-xs sm:text-sm">
            {Object.entries(checks).map(([key, check]) => (
              <div key={key} className="flex items-start gap-2">
                {check.met ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span className={check.met ? 'text-gray-700 font-medium' : 'text-gray-500'}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
          
          {level !== 'excellent' && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <div className="bg-white rounded-lg p-3 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Tip:</strong> {
                      level === 'basic' && !hasRecording
                        ? 'Add a video or audio recording for a more personal, engaging answer that askers love!'
                        : level === 'basic' && hasRecording && !hasSufficientLength
                        ? 'Consider recording a bit longer (at least 1 minute) to provide a thorough answer.'
                        : level === 'good' && !hasText
                        ? 'Add written notes or a summary to complement your recording for a complete answer.'
                        : 'Great start! Consider adding more detail to make your answer even better.'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {level === 'excellent' && (
            <div className="mt-3 pt-3 border-t border-green-200/50">
              <div className="bg-white rounded-lg p-3 text-xs text-green-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  <strong>Excellent work!</strong> Your answer is comprehensive and ready to delight the asker.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnswerQualityIndicator;