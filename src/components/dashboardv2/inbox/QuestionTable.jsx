// src/components/dashboardv2/inbox/QuestionTable.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Video, Mic, FileText, Calendar } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import SLAIndicator from './SLAIndicator';
import PinButton from './PinButton';
// import QuestionPreview from './QuestionPreview'; // DISABLED

function QuestionTable({
  questions = [],
  selectedQuestions = [],
  activeQuestionId = null,
  onSelectQuestion,
  onQuestionClick,
  onSelectAll,
  // Pin props
  pinnedIds = [],
  onTogglePin,
  isPinned,
  onCopyLink
}) {
  const [columnWidths, setColumnWidths] = useState({
    checkbox: 48,
    question: 44,
    asker: 30,
    price: 12,
    time: 9,
  });

  // DISABLED: Column resizing
  // const [isResizing, setIsResizing] = useState(false);
  // const [resizingColumn, setResizingColumn] = useState(null);
  
  // DISABLED: Hover preview state
  // const [hoveredQuestion, setHoveredQuestion] = useState(null);
  // const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  // const [hoverTimer, setHoverTimer] = useState(null);

  // DISABLED: Column resize effect
  /*
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!resizingColumn) return;

      const table = document.querySelector('.question-table-container');
      if (!table) return;

      const tableRect = table.getBoundingClientRect();
      const relativeX = e.clientX - tableRect.left;
      const percentage = (relativeX / tableRect.width) * 100;

      setColumnWidths((prev) => {
        const newWidths = { ...prev };
        
        if (resizingColumn === 'question') {
          newWidths.question = Math.max(20, Math.min(60, percentage));
        } else if (resizingColumn === 'asker') {
          newWidths.asker = Math.max(15, Math.min(40, percentage));
        }

        return newWidths;
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizingColumn]);
  */

  // DISABLED: Column resize handler
  /*
  const startResize = (column) => (e) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(column);
  };
  */

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

  // DISABLED: Hover preview handlers
  /*
  const handleMouseEnter = (question, event) => {
    if (activeQuestionId) {
      return;
    }
    
    console.log('🔍 Hovering over question:', question.id);
    const rect = event.currentTarget.getBoundingClientRect();
    
    const previewWidth = 320;
    const padding = 20;
    const viewportWidth = window.innerWidth;
    
    let xPosition = rect.right + padding;
    
    if (xPosition + previewWidth > viewportWidth) {
      xPosition = rect.left - previewWidth - padding;
    }
    
    if (xPosition < 0) {
      xPosition = (viewportWidth - previewWidth) / 2;
    }
    
    setHoverPosition({ 
      x: xPosition, 
      y: rect.top 
    });
    
    const timer = setTimeout(() => {
      console.log('✅ Setting hover question:', question.id);
      setHoveredQuestion(question);
    }, 300);
    
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    setHoveredQuestion(null);
  };
  */

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
    <div className="h-full flex flex-col bg-white overflow-hidden question-table-container">
      <div className="flex-1 overflow-y-auto overflow-x-auto min-w-0">
        <table
          className="w-full min-w-[800px]"
          style={{
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
            <tr>
              {/* Checkbox Column */}
              <th className="w-12 px-3 py-3 text-left">
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
              </th>

              {/* Question Column */}
              <th
                className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                style={{ width: `${columnWidths.question}%` }}
              >
                <div className="flex items-center gap-2">
                  <span>Question</span>
                </div>
                {/* DISABLED: Resize handle */}
              </th>

              {/* Asker Column */}
              <th
                className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                style={{ width: `${columnWidths.asker}%` }}
              >
                <div className="flex items-center gap-2">
                  <span>Asker</span>
                </div>
                {/* DISABLED: Resize handle */}
              </th>

              {/* Price Column */}
              <th
                className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                style={{ width: `${columnWidths.price}%` }}
              >
                Price
              </th>

              {/* Time Column */}
              <th
                className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                style={{ width: `${columnWidths.time}%` }}
              >
                Time
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {questions.map((question) => {
              const isSelected = selectedQuestions.includes(question.id);
              const isActive = activeQuestionId === question.id;
              const answered = isAnswered(question);

              return (
                <tr
                  key={question.id}
                  onClick={(e) => {
                    if (e.target.type !== 'checkbox') {
                      onQuestionClick(question);
                    }
                  }}
                  // DISABLED: Hover handlers
                  // onMouseEnter={(e) => handleMouseEnter(question, e)}
                  // onMouseLeave={handleMouseLeave}
                  className={`
                    transition-colors cursor-pointer border-l-4
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
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectQuestion(question, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>

                  {/* Question */}
                  <td className="px-3 py-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getMediaIcon(question)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400 font-mono">
                            Q-{question.id}
                          </span>
                          <PriorityBadge question={question} />
                          {/* Pin button */}
                          {onTogglePin && isPinned && (
                            <PinButton
                              isPinned={isPinned(question.id)}
                              onClick={() => onTogglePin(question.id)}
                            />
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 break-words">
                          {getQuestionTitle(question)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Asker */}
                  <td className="px-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {question.user_name || question.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {question.user_email || question.email || ''}
                      </p>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-3">
                    <span
                      className={`text-sm font-bold whitespace-nowrap ${
                        answered ? 'text-gray-500' : 'text-green-600'
                      }`}
                    >
                      ${((question.price_cents || 0) / 100).toFixed(0)}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      {!answered &&
                      question.sla_hours_snapshot &&
                      question.sla_hours_snapshot > 0 ? (
                        <SLAIndicator question={question} compact={true} />
                      ) : (
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {getRelativeTime(question.created_at)}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DISABLED: Resize overlay */}
      {/* DISABLED: Hover Preview */}
    </div>
  );
}

export default QuestionTable;