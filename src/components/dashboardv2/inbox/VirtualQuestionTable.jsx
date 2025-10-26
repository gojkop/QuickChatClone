// src/components/dashboardv2/inbox/VirtualQuestionTable.jsx
// Virtualized question table for better performance with large lists

import React, { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Video, Mic, FileText, Calendar } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import SLAIndicator from './SLAIndicator';

function VirtualQuestionTable({
  questions = [],
  selectedQuestions = [],
  activeQuestionId = null,
  onSelectQuestion,
  onQuestionClick,
  onSelectAll,
}) {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 5
  });

  const isAllSelected =
    questions.length > 0 && selectedQuestions.length === questions.length;

  const isSomeSelected =
    selectedQuestions.length > 0 && selectedQuestions.length < questions.length;

  const getMediaIcon = (question) => {
    const segments = question.recording_segments || question.media_asset || [];
    const hasVideo = segments.some(
      (s) =>
        s.metadata?.mode === 'video' ||
        s.metadata?.mode === 'screen' ||
        s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = segments.some((s) => s.metadata?.mode === 'audio');

    if (hasVideo) return <Video size={14} className="text-indigo-600" />;
    if (hasAudio) return <Mic size={14} className="text-indigo-600" />;
    return <FileText size={14} className="text-gray-400" />;
  };

  const getQuestionTitle = (question) => {
    const titleText = question.title || question.question_text;

    if (titleText?.trim()) {
      return titleText;
    }

    const detailsText = question.text || question.question_details;
    if (detailsText?.trim()) {
      const firstLine = detailsText.split('\n')[0].trim();
      return firstLine.length > 100
        ? firstLine.substring(0, 100) + '...'
        : firstLine;
    }

    const segments = question.recording_segments || question.media_asset || [];
    const hasVideo = segments.some(
      (s) =>
        s.metadata?.mode === 'video' ||
        s.metadata?.mode === 'screen' ||
        s.metadata?.mode === 'screen-camera'
    );
    const hasAudio = segments.some((s) => s.metadata?.mode === 'audio');

    if (hasVideo) return 'Video Question';
    if (hasAudio) return 'Audio Question';

    return `Question #${question.id}`;
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now() / 1000;
    const createdAt = timestamp > 4102444800 ? timestamp / 1000 : timestamp;
    const diff = now - createdAt;

    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    const days = Math.floor(diff / 86400);
    return `${days}d`;
  };

  const isAnswered =
    (q) => q.status === 'closed' || q.status === 'answered' || q.answered_at;

  if (questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
        <Calendar size={48} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-700">No questions found</p>
        <p className="text-sm text-gray-500 mt-1">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center px-3 py-3">
          <div className="w-12">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isSomeSelected;
                }
              }}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
          <div className="flex-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Question
          </div>
          <div className="w-24 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Price
          </div>
          <div className="w-20 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Time
          </div>
        </div>
      </div>

      {/* Virtualized List */}
      <div ref={parentRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const question = questions[virtualRow.index];
            const isSelected = selectedQuestions.includes(question.id);
            const isActive = activeQuestionId === question.id;
            const answered = isAnswered(question);

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                <div
                  onClick={(e) => {
                    if (e.target.type !== 'checkbox') {
                      onQuestionClick(question);
                    }
                  }}
                  className={`
                    flex items-center px-3 py-3 cursor-pointer border-l-4 transition-colors
                    ${
                      isActive
                        ? 'bg-indigo-50 border-l-indigo-600'
                        : isSelected
                        ? 'bg-blue-50 border-l-blue-400'
                        : 'border-l-transparent hover:bg-gray-50'
                    }
                    ${answered ? 'opacity-60' : ''}
                  `}
                >
                  {/* Checkbox */}
                  <div className="w-12">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectQuestion(question.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Question */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getMediaIcon(question)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400 font-mono">
                            Q-{question.id}
                          </span>
                          <PriorityBadge question={question} />
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {getQuestionTitle(question)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="w-24">
                    <span
                      className={`text-sm font-bold ${
                        answered ? 'text-gray-500' : 'text-green-600'
                      }`}
                    >
                      ${((question.price_cents || 0) / 100).toFixed(0)}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="w-20">
                    {!answered &&
                    question.sla_hours_snapshot &&
                    question.sla_hours_snapshot > 0 ? (
                      <SLAIndicator question={question} compact={true} />
                    ) : (
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(question.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VirtualQuestionTable;