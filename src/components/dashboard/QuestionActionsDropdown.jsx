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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      
      setOpenUpward(spaceBelow < 300);
    }
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleScheduleClick = (e) => {
    e.stopPropagation();
    setShowScheduleModal(true);
    setIsOpen(false);
  };

  const handleScheduled = (data) => {
    showToast(`📅 Added to ${data.service} Calendar!`, 'success');
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    onAction(action, question);
    setIsOpen(false);
  };

  const isPending = question.status === 'paid' && !question.answered_at;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          title="More actions"
          type="button"
        >
          <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {isOpen && (
          <div 
            className="fixed rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5"
            style={{
              top: openUpward ? 'auto' : `${buttonRef.current.getBoundingClientRect().bottom + 8}px`,
              bottom: openUpward ? `${window.innerHeight - buttonRef.current.getBoundingClientRect().top + 8}px` : 'auto',
              right: `${window.innerWidth - buttonRef.current.getBoundingClientRect().right}px`,
              width: '224px',
              zIndex: 9999,
            }}
          >
            <div className="py-1">
              <button
                onClick={(e) => handleAction(e, 'view')}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                type="button"
              >
                <svg className="w-4 h-4 text-indigo-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="pointer-events-none">View Question</span>
              </button>

              <div className="border-t border-gray-200 my-1"></div>

              <button
                onClick={handleScheduleClick}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                type="button"
              >
                <svg className="w-4 h-4 text-indigo-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="pointer-events-none">Schedule Work Time</span>
              </button>

              {isPending && <div className="border-t border-gray-200 my-1"></div>}

              {isPending && (
                <button
                  onClick={(e) => handleAction(e, 'refund')}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  type="button"
                >
                  <svg className="w-4 h-4 text-orange-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="pointer-events-none">Refund & Decline</span>
                </button>
              )}

              {isPending && <div className="border-t border-gray-200 my-1"></div>}

              <button
                onClick={(e) => handleAction(e, 'hide')}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-left"
                type="button"
              >
                <svg className="w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <span className="pointer-events-none">Hide Question</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ScheduleWorkModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        question={question}
        onScheduled={handleScheduled}
      />

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