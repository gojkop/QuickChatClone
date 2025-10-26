// src/components/dashboardv2/widgets/SLACountdownWidget.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * SLACountdownWidget - Tall card showing urgent SLA deadline
 * Takes up 1x2 space in the Bento Grid
 */
function SLACountdownWidget({ questions = [], slaHours = 24 }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Find question with closest SLA deadline
  const getUrgentQuestion = () => {
    const pendingQuestions = questions.filter(q => q.status === 'paid' && !q.answered_at);
    
    if (pendingQuestions.length === 0) return null;

    let closestDeadline = null;
    let closestQuestion = null;

    pendingQuestions.forEach(q => {
      const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      const deadline = new Date((createdAt + slaHours * 3600) * 1000);
      
      if (!closestDeadline || deadline < closestDeadline) {
        closestDeadline = deadline;
        closestQuestion = q;
      }
    });

    if (!closestDeadline) return null;

    const now = new Date();
    const diff = closestDeadline - now;
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      hoursLeft,
      minutesLeft,
      isUrgent: hoursLeft < 2,
      isCritical: hoursLeft < 1,
      question: closestQuestion,
      deadline: closestDeadline
    };
  };

  const urgentData = getUrgentQuestion();

  if (!urgentData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <Clock size={32} className="text-green-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">All Caught Up!</h3>
        <p className="text-xs text-gray-600">No urgent questions right now</p>
      </div>
    );
  }

  const bgColor = urgentData.isCritical 
    ? 'bg-gradient-to-br from-red-50 to-red-100' 
    : urgentData.isUrgent 
    ? 'bg-gradient-to-br from-amber-50 to-amber-100'
    : 'bg-gradient-to-br from-blue-50 to-blue-100';

  const textColor = urgentData.isCritical
    ? 'text-red-700'
    : urgentData.isUrgent
    ? 'text-amber-700'
    : 'text-blue-700';

  const iconColor = urgentData.isCritical
    ? 'text-red-600'
    : urgentData.isUrgent
    ? 'text-amber-600'
    : 'text-blue-600';

  return (
    <div className={`h-full flex flex-col ${bgColor} -m-4 p-4 rounded-xl`}>
      {/* Icon & Status */}
      <div className="flex items-center justify-center mb-3">
        <div className={`p-3 bg-white/80 rounded-full shadow-sm ${urgentData.isCritical ? 'animate-pulse' : ''}`}>
          {urgentData.isCritical ? (
            <AlertTriangle size={32} className={iconColor} strokeWidth={2.5} />
          ) : (
            <Clock size={32} className={iconColor} strokeWidth={2.5} />
          )}
        </div>
      </div>

      {/* Countdown */}
      <div className="text-center mb-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">
          {urgentData.isCritical ? '🚨 CRITICAL SLA' : urgentData.isUrgent ? '⚠️ Urgent SLA' : 'Next SLA Deadline'}
        </p>
        <div className="text-5xl font-black text-gray-900 mb-1">
          {urgentData.hoursLeft}:{String(urgentData.minutesLeft).padStart(2, '0')}
        </div>
        <p className={`text-sm font-semibold ${textColor}`}>
          hours remaining
        </p>
      </div>

      {/* Question Preview */}
      <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-600 mb-1">Question:</p>
        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
          {urgentData.question.question_text || 'Untitled Question'}
        </p>
        {urgentData.question.user_name && (
          <p className="text-xs text-gray-600 mt-2">
            from {urgentData.question.user_name}
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate(`/dashboard/inbox#question-${urgentData.question.id}`)}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-sm
          ${urgentData.isCritical 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : urgentData.isUrgent
            ? 'bg-amber-600 hover:bg-amber-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
      >
        Answer Now →
      </button>
    </div>
  );
}

export default SLACountdownWidget;