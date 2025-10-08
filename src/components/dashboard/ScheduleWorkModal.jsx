// src/components/dashboard/ScheduleWorkModal.jsx
import React, { useState, useEffect } from 'react';
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

const CALENDAR_SERVICES = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔵',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700'
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: '🔷',
    color: 'from-blue-600 to-indigo-600',
    hoverColor: 'hover:from-blue-700 hover:to-indigo-700'
  },
  {
    id: 'office365',
    name: 'Office 365',
    icon: '🟦',
    color: 'from-indigo-500 to-purple-600',
    hoverColor: 'hover:from-indigo-600 hover:to-purple-700'
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: '⚪',
    color: 'from-gray-600 to-gray-700',
    hoverColor: 'hover:from-gray-700 hover:to-gray-800'
  }
];

function ScheduleWorkModal({ isOpen, onClose, question, onScheduled }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(30);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [preferredService, setPreferredService] = useState('google');
  const [slaWarning, setSlaWarning] = useState(null);

  useEffect(() => {
    if (isOpen && question) {
      // Generate smart time suggestions
      const slots = generateTimeSlots(question);
      setTimeSlots(slots);
      
      // Set estimated duration
      const estimated = estimateAnswerDuration(question);
      setDuration(estimated);
      
      // Detect preferred calendar
      const detected = detectCalendarService();
      setPreferredService(detected);
      
      // Reset state
      setSelectedSlot(slots[0] || null);
      setShowCustomTime(false);
      setSlaWarning(null);
    }
  }, [isOpen, question]);

  if (!isOpen || !question) return null;

  const urgency = getUrgencyLevel(question);

  // Calculate SLA deadline
  const getSlaDeadline = () => {
    if (!question?.sla_hours_snapshot) return null;
    const createdAtSeconds = question.created_at > 4102444800 ? question.created_at / 1000 : question.created_at;
    const slaSeconds = question.sla_hours_snapshot * 3600;
    return new Date((createdAtSeconds + slaSeconds) * 1000);
  };

  const slaDeadline = getSlaDeadline();

  // Check if selected time is after SLA
  const checkSlaViolation = (scheduledDate) => {
    if (!slaDeadline || !scheduledDate) return false;
    return scheduledDate > slaDeadline;
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowCustomTime(false);
    
    // Check SLA violation
    if (checkSlaViolation(slot.date)) {
      setSlaWarning({
        type: 'error',
        message: `⚠️ This time is after your SLA deadline (${slaDeadline.toLocaleString('en-US', { 
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

  const handleCustomDateTimeChange = () => {
    if (customDate && customTime) {
      const scheduledDate = new Date(`${customDate}T${customTime}`);
      
      if (checkSlaViolation(scheduledDate)) {
        setSlaWarning({
          type: 'error',
          message: `⚠️ This time is after your SLA deadline (${slaDeadline.toLocaleString('en-US', { 
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
  };

  useEffect(() => {
    if (showCustomTime) {
      handleCustomDateTimeChange();
    }
  }, [customDate, customTime, showCustomTime]);

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
        break;
      case 'outlook':
        url = getOutlookCalendarUrl(question, options);
        break;
      case 'office365':
        url = getOffice365CalendarUrl(question, options);
        break;
      case 'apple':
        url = getAppleCalendarUrl(question, options);
        // Apple uses data URL, needs different handling
        window.location.href = url;
        onScheduled?.({ questionId: question.id, service: serviceId });
        onClose();
        return;
      default:
        return;
    }
    
    window.open(url, '_blank');
    
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

            {/* Compact Time Slot Suggestions */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                🎯 Pick a time
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot)}
                    className={`group relative p-3 rounded-lg border-2 text-left transition-all ${
                      selectedSlot?.date?.getTime() === slot.date.getTime()
                        ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Selection indicator */}
                    {selectedSlot?.date?.getTime() === slot.date.getTime() && (
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{slot.icon}</span>
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

            {/* Compact Custom Time Option */}
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
                  <svg className={`w-5 h-5 flex-shrink-0 ${
                    slaWarning.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className={`text-xs font-semibold ${
                    slaWarning.type === 'error' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {slaWarning.message}
                  </p>
                </div>
              </div>
            )}

            {/* Compact Calendar Service Selection */}
            {canSchedule && (
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  📅 Add to calendar
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  {CALENDAR_SERVICES.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleCalendarClick(service.id)}
                      className={`group relative p-3 rounded-lg bg-gradient-to-br ${service.color} ${service.hoverColor} text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-lg">{service.icon}</span>
                        <span className="text-xs">{service.name}</span>
                      </div>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity transform -skew-x-12"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compact Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    What happens next?
                  </p>
                  <ul className="text-xs text-blue-800 space-y-0.5">
                    <li>✓ Opens in your calendar with details</li>
                    <li>✓ Includes link to answer question</li>
                    <li>✓ 15-min reminder before start</li>
                  </ul>
                </div>
              </div>
            </div>
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