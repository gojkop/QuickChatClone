// src/components/dashboardv2/widgets/SLACountdownWidget.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';

function SLACountdownWidget({ questions = [], slaHours = 24 }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <Clock size={24} className="text-green-600" />
        </div>
        <h3 className="text-xs font-bold text-gray-900 mb-0.5">All Caught Up!</h3>
        <p className="text-xs text-gray-600">No urgent questions</p>
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
    <div className={`h-full flex flex-col ${bgColor} -m-3 p-3 rounded-xl`}>
      {/* Icon & Status - COMPACT */}
      <div className="flex items-center justify-center mb-2">
        <div className={`p-2 bg-white/80 rounded-full shadow-sm ${urgentData.isCritical ? 'animate-pulse' : ''}`}>
          {urgentData.isCritical ? (
            <AlertTriangle size={20} className={iconColor} strokeWidth={2.5} />
          ) : (
            <Clock size={20} className={iconColor} strokeWidth={2.5} />
          )}
        </div>
      </div>

      {/* Countdown - SMALLER */}
      <div className="text-center mb-2">
        <p className="text-xs font-semibold text-gray-700 mb-1">
          {urgentData.isCritical ? '🚨 Critical' : urgentData.isUrgent ? '⚠️ Urgent' : 'Next SLA'}
        </p>
        <div className="text-3xl font-black text-gray-900 mb-0.5">
          {urgentData.hoursLeft}:{String(urgentData.minutesLeft).padStart(2, '0')}
        </div>
        <p className={`text-xs font-semibold ${textColor}`}>
          hours left
        </p>
      </div>

      {/* Question Preview - COMPACT */}
      <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-lg p-2 mb-2">
        <p className="text-xs text-gray-600 mb-0.5">Question:</p>
        <p className="text-xs font-semibold text-gray-900 line-clamp-2">
          {urgentData.question.question_text || 'Untitled Question'}
        </p>
        {urgentData.question.user_name && (
          <p className="text-xs text-gray-600 mt-1">
            from {urgentData.question.user_name}
          </p>
        )}
      </div>

      {/* Action Button - COMPACT */}
      <button
        onClick={() => navigate(`/dashboard/inbox#question-${urgentData.question.id}`)}
        className={`w-full py-2 rounded-lg font-bold text-xs transition-all shadow-sm
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