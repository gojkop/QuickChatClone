// src/components/dashboard/QuestionActionsDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import ScheduleWorkModal from './ScheduleWorkModal';
import { Toast, useToast } from '@/components/common/Toast';

function QuestionActionsDropdown({ question, onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // More aggressive: open upward if we're in the bottom 40% of viewport
      // OR if there's less than 350px space below
      const isInBottomArea = buttonRect.bottom > viewportHeight * 0.6;
      const hasInsufficientSpaceBelow = spaceBelow < 350;
      
      if ((isInBottomArea || hasInsufficientSpaceBelow) && spaceAbove > 200) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  const handleScheduleClick = (e) => {
    e.stopPropagation();
    setShowScheduleModal(true);
    setIsOpen(false);
  };

  const handleScheduled = (data) => {
    showToast(`📅 Added to ${data.service} Calendar!`, 'success');
  };

  const handleAction = (action) => {
    onAction(action, question);
    setIsOpen(false);
  };

  const isPending = question.status === 'paid' && !question.answered_at;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          title="More actions"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {isOpen && (
          <div 
            className={`absolute right-0 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 ${
              openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            <div className="py-1">
              {/* NEW: View Question - Top Priority Action */}
              <button
                onClick={() => handleAction('view')}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View Question</span>
              </button>

              <div className="border-t border-gray-200 my-1"></div>

              {/* UPDATED: Schedule Work Time - Consistent Simple Style */}
              <button
                onClick={handleScheduleClick}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Schedule Work Time</span>
              </button>

              {isPending && <div className="border-t border-gray-200 my-1"></div>}

              {/* Existing actions */}
              {isPending && (
                <button
                  onClick={() => handleAction('refund')}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Refund & Decline</span>
                </button>
              )}

              {isPending && <div className="border-t border-gray-200 my-1"></div>}

              <button
                onClick={() => handleAction('delete')}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Question</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleWorkModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        question={question}
        onScheduled={handleScheduled}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
}

export default QuestionActionsDropdown;