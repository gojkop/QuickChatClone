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
    name: 'Google Calendar',
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
    name: 'Apple Calendar',
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
    }
  }, [isOpen, question]);

  if (!isOpen || !question) return null;

  const urgency = getUrgencyLevel(question);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowCustomTime(false);
  };

  const handleCustomTimeClick = () => {
    setShowCustomTime(true);
    setSelectedSlot(null);
    
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
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 px-6 py-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-start gap-4 pr-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black mb-1">
                  Schedule Work Time
                </h2>
                <p className="text-white/90 text-sm line-clamp-2 font-medium">
                  {question.title}
                </p>
              </div>
            </div>

            {/* Urgency Badge */}
            {urgency && (
              <div className="mt-4">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${urgency.bgColor} ${urgency.textColor} border ${urgency.borderColor}`}>
                  {urgency.label}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Duration Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                How long will this take?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[15, 20, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-3 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                      duration === mins
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 shadow-md scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    {mins}<span className="text-xs ml-0.5">min</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Estimated: {estimateAnswerDuration(question)} minutes
              </p>
            </div>

            {/* Time Slot Suggestions */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                When will you work on this?
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot)}
                    className={`group relative p-4 rounded-xl border-2 text-left transition-all ${
                      selectedSlot?.date?.getTime() === slot.date.getTime()
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md hover:scale-102'
                    }`}
                  >
                    {/* Selection indicator */}
                    {selectedSlot?.date?.getTime() === slot.date.getTime() && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{slot.icon}</span>
                      <div className="flex-1">
                        <div className={`font-bold text-sm ${
                          selectedSlot?.date?.getTime() === slot.date.getTime()
                            ? 'text-indigo-900'
                            : 'text-gray-900'
                        }`}>
                          {slot.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {slot.sublabel}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Option */}
            <div>
              <button
                onClick={handleCustomTimeClick}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  showCustomTime
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">
                        Pick Custom Time
                      </div>
                      <div className="text-xs text-gray-600">
                        Choose your own date & time
                      </div>
                    </div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${showCustomTime ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showCustomTime && (
                <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg border border-purple-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Date
                      </label>
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Time
                      </label>
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar Service Selection */}
            {canSchedule && (
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  Add to your calendar
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  {CALENDAR_SERVICES.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleCalendarClick(service.id)}
                      className={`group relative p-4 rounded-xl bg-gradient-to-br ${service.color} ${service.hoverColor} text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl">{service.icon}</span>
                        <span className="text-sm">{service.name}</span>
                      </div>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity transform -skew-x-12 group-hover:animate-shimmer"></div>
                    </button>
                  ))}
                </div>
                
                <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Opens in new tab • One click to save
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">
                    What happens next?
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>✓ Event opens in your calendar with all details</li>
                    <li>✓ Includes direct link to answer the question</li>
                    <li>✓ 15-minute reminder before scheduled time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition"
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
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .group:hover .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default ScheduleWorkModal;