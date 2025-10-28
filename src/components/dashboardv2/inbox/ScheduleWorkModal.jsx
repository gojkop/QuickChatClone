// src/components/dashboardv2/inbox/ScheduleWorkModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getOffice365CalendarUrl,
  getAppleCalendarUrl,
  detectCalendarService
} from '@/utils/calendarLinks';
import {
  generateTimeSlots,
  estimateAnswerDuration,
  getUrgencyLevel,
  formatTime
} from '@/utils/timeHelpers';

function ScheduleWorkModal({ isOpen, onClose, question, onScheduled }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(30);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [preferredService, setPreferredService] = useState('google');
  const [slaWarning, setSlaWarning] = useState(null);

  // Calculate SLA deadline timestamp - MUST BE BEFORE ANY RETURNS
  const slaDeadlineTimestamp = useMemo(() => {
    if (!question?.sla_hours_snapshot) return null;
    const createdAtSeconds = question.created_at > 4102444800 ? question.created_at / 1000 : question.created_at;
    const slaSeconds = question.sla_hours_snapshot * 3600;
    return (createdAtSeconds + slaSeconds) * 1000;
  }, [question?.created_at, question?.sla_hours_snapshot]);

  // Check if selected time is after SLA - MUST BE BEFORE ANY RETURNS
  const checkSlaViolation = useCallback((scheduledDate) => {
    if (!slaDeadlineTimestamp || !scheduledDate) return false;
    return scheduledDate.getTime() > slaDeadlineTimestamp;
  }, [slaDeadlineTimestamp]);

  // Initialize component state
  useEffect(() => {
    if (isOpen && question) {
      const slots = generateTimeSlots(question);
      setTimeSlots(slots);

      const estimated = estimateAnswerDuration(question);
      setDuration(estimated);

      const detected = detectCalendarService();
      setPreferredService(detected);

      setSelectedSlot(slots[0] || null);
      setShowCustomTime(false);
      setSlaWarning(null);
    }
  }, [isOpen, question]);

  // Check SLA violation for custom date/time
  useEffect(() => {
    if (showCustomTime && customDate && customTime) {
      const scheduledDate = new Date(`${customDate}T${customTime}`);

      if (checkSlaViolation(scheduledDate)) {
        const deadlineDate = new Date(slaDeadlineTimestamp);
        setSlaWarning({
          type: 'error',
          message: `⚠️ This time is after your SLA deadline (${deadlineDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}). Choose an earlier time to meet your commitment.`
        });
      } else {
        setSlaWarning(null);
      }
    }
  }, [customDate, customTime, showCustomTime, slaDeadlineTimestamp, checkSlaViolation]);

  // Early return AFTER all hooks
  if (!isOpen || !question) return null;

  const urgency = getUrgencyLevel(question);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowCustomTime(false);

    // Check SLA violation
    if (checkSlaViolation(slot.date)) {
      const deadlineDate = new Date(slaDeadlineTimestamp);
      setSlaWarning({
        type: 'error',
        message: `⚠️ This time is after your SLA deadline (${deadlineDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })}). Schedule earlier to meet your commitment.`
      });
    } else {
      setSlaWarning(null);
    }
  };

  const handleCustomTimeClick = () => {
    setShowCustomTime(true);
    setSelectedSlot(null);
    setSlaWarning(null);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    setCustomDate(tomorrow.toISOString().split('T')[0]);
    setCustomTime('09:00');
  };

  const handleCalendarClick = (serviceId) => {
    let scheduledDate = null;

    if (selectedSlot) {
      scheduledDate = selectedSlot.date;
    } else if (showCustomTime && customDate && customTime) {
      scheduledDate = new Date(`${customDate}T${customTime}`);
    }

    if (!scheduledDate) {
      alert('Please select a time first');
      return;
    }

    const options = { scheduledDate, duration };
    let url;

    switch (serviceId) {
      case 'google':
        url = getGoogleCalendarUrl(question, options);
        window.open(url, '_blank');
        break;
      case 'outlook':
        url = getOutlookCalendarUrl(question, options);
        window.open(url, '_blank');
        break;
      case 'office365':
        url = getOffice365CalendarUrl(question, options);
        window.open(url, '_blank');
        break;
      case 'apple':
        // Special handling for Apple Calendar - better iOS support
        const icsContent = getAppleCalendarUrl(question, options);

        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
          // For iOS: Create blob and trigger download with proper MIME type
          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
          const blobUrl = URL.createObjectURL(blob);

          // Create temporary link and click it
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `question-${question.id}.ics`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

          // Show helpful message for iOS users
          setTimeout(() => {
            alert('Calendar file downloaded! Tap on the file in your Downloads to add it to Calendar.');
          }, 500);
        } else {
          // For desktop: Use data URL (works better on macOS)
          window.location.href = icsContent;
        }

        onScheduled?.({ questionId: question.id, service: serviceId });
        onClose();
        return;
      default:
        return;
    }

    if (onScheduled) {
      onScheduled({
        questionId: question.id,
        service: serviceId,
        scheduledFor: scheduledDate,
        duration
      });
    }

    setTimeout(() => onClose(), 500);
  };

  const canSchedule = selectedSlot || (showCustomTime && customDate && customTime);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">

          {/* Gentler Header with Soft Gradient */}
          <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-violet-50 border-b-2 border-indigo-200 px-5 py-4">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-indigo-100 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-start gap-3 pr-10">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-indigo-900 mb-0.5">
                  Schedule Work Time
                </h2>
                <p className="text-indigo-700 text-sm line-clamp-2 font-medium">
                  {question.title}
                </p>
              </div>
            </div>

            {/* Urgency Badge */}
            {urgency && (
              <div className="mt-3">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${urgency.bgColor} ${urgency.textColor} border ${urgency.borderColor}`}>
                  {urgency.label}
                </div>
              </div>
            )}
          </div>

          {/* More Compact Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Compact Duration Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                ⏱️ Duration
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[15, 20, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-2 py-2 rounded-lg border-2 font-bold text-sm transition-all ${
                      duration === mins
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    {mins}<span className="text-xs ml-0.5">m</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simplified Time Slot Suggestions - Only 2 Options */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                🎯 Pick a time
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {timeSlots.slice(0, 2).map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot)}
                    className={`group relative p-3 rounded-lg border-2 text-left transition-all ${
                      selectedSlot?.date?.getTime() === slot.date.getTime()
                        ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    {selectedSlot?.date?.getTime() === slot.date.getTime() && (
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                        <slot.icon className={`w-5 h-5 ${slot.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-xs ${
                          selectedSlot?.date?.getTime() === slot.date.getTime()
                            ? 'text-indigo-900'
                            : 'text-gray-900'
                        }`}>
                          {slot.label}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {slot.sublabel}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Option - Always Visible */}
            <div>
              <button
                onClick={handleCustomTimeClick}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  showCustomTime
                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Custom Time</div>
                      <div className="text-xs text-gray-600">Pick your own</div>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${showCustomTime ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showCustomTime && (
                <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SLA Warning Message - NEW FEATURE */}
            {slaWarning && (
              <div className={`p-3 rounded-lg border-2 ${
                slaWarning.type === 'error'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex gap-2">
                  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    slaWarning.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className={`text-xs font-semibold break-words ${
                    slaWarning.type === 'error' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {slaWarning.message}
                  </p>
                </div>
              </div>
            )}

            {/* Calendar Service Selection - FIXED WITH HARDCODED BUTTONS */}
            {canSchedule && (
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <label className="text-xs font-bold text-gray-900">
                    Add to calendar
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCalendarClick('google')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-blue-400 transition-all hover:shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700">Google</span>
                  </button>

                  <button
                    onClick={() => handleCalendarClick('outlook')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-sky-400 transition-all hover:shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700">Outlook</span>
                  </button>

                  <button
                    onClick={() => handleCalendarClick('office365')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-orange-400 transition-all hover:shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700">Office 365</span>
                  </button>

                  <button
                    onClick={() => handleCalendarClick('apple')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all hover:shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700">Apple</span>
                  </button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-2">
                  Opens in new tab
                </p>
              </div>
            )}

            {/* Compact Info Box */}
            {canSchedule && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                <div className="flex gap-2">
                  <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-blue-800 space-y-0.5">
                    <span className="font-semibold">What happens: </span>
                    Opens calendar with details • Link to answer • 15-min reminder
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compact Footer */}
          <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ScheduleWorkModal;
