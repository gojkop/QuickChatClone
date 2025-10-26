import React from 'react';
import { User, Clock, CheckCircle, MessageSquare, Star, Zap, Mail } from 'lucide-react';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

function QuestionCard({
  question,
  isSelected,
  isActive = false,
  onSelect,
  onClick
}) {
  const getTimeLeft = () => {
    if (!question.sla_hours_snapshot || question.sla_hours_snapshot <= 0) {
      return null;
    }

    const now = Date.now() / 1000;
    const createdAtSeconds = question.created_at > 4102444800
      ? question.created_at / 1000
      : question.created_at;

    const elapsed = now - createdAtSeconds;
    const slaSeconds = question.sla_hours_snapshot * 3600;
    const remaining = slaSeconds - elapsed;

    if (remaining <= 0) return null;

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return { text: `${days}d ${remainingHours}h`, hours };
    }
    if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, hours };
    }
    return { text: `${minutes}m`, hours: 0 };
  };

  const getTimeUrgencyColor = (hours) => {
    if (hours < 6) return 'text-red-600';
    if (hours < 12) return 'text-orange-600';
    return 'text-blue-600';
  };

  const isAnswered = question.status === 'closed' || question.status === 'answered' || question.answered_at;
  const isDeepDive = question.pricing_tier === 'tier2';
  const timeLeft = getTimeLeft();

  return (
    <div
      className={`
        relative p-3 sm:p-4 border border-l-[3px] rounded-xl transition-all duration-300 cursor-pointer group
        ${isDeepDive && !isAnswered ? 'border-l-purple-400' : 'border-l-transparent'}
        ${isActive
          ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-primary ring-2 ring-indigo-200 scale-[1.02]'
          : isSelected
          ? 'border-indigo-300 bg-indigo-50 shadow-sm'
          : isAnswered
          ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5'
        }
      `}
      onClick={onClick}
    >
      {/* Selection Checkbox - Touch optimized */}
      <div className="absolute top-3 left-3 z-10 touch-target">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(question.id);
          }}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
        />
      </div>

      {/* Main Content */}
      <div className="ml-7 sm:ml-8">
        {/* Header Row: Type Badge + Title + Price + Time */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {/* Type Badge */}
              {isDeepDive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200 rounded text-xs font-bold flex-shrink-0">
                  <Star size={10} />
                  <span>Deep Dive</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold flex-shrink-0">
                  <Zap size={10} />
                  <span>Quick</span>
                </span>
              )}

              {/* Question Title */}
              <h3 className={`text-sm font-semibold line-clamp-1 ${isAnswered ? 'text-gray-600' : 'text-gray-900'}`}>
                {question.question_text || 'Untitled Question'}
              </h3>
            </div>
          </div>

          {/* Right Side: Price + Time Left */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Price */}
            <div className={`
              px-2.5 py-1 rounded-lg font-bold text-sm shadow-sm
              ${isAnswered
                ? 'bg-gray-100 text-gray-500'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
              }
            `}>
              {formatCurrency(question.price_cents)}
            </div>

            {/* Time Left */}
            {!isAnswered && timeLeft && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${getTimeUrgencyColor(timeLeft.hours)}`}>
                <Clock size={12} />
                <span>{timeLeft.text}</span>
              </div>
            )}

            {/* Answered Badge */}
            {isAnswered && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 rounded text-xs font-bold">
                <CheckCircle size={12} />
                <span>Answered</span>
              </span>
            )}
          </div>
        </div>

        {/* Asker Info: Name + Email */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <User size={12} className="text-gray-400 flex-shrink-0" />
          {question.user_name && (
            <span className="font-medium truncate">{question.user_name}</span>
          )}
          {question.user_email && (
            <>
              <span className="text-gray-400">·</span>
              <a
                href={`mailto:${question.user_email}`}
                className="text-indigo-600 hover:text-indigo-700 hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {question.user_email}
              </a>
            </>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      {!isAnswered && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
      )}
    </div>
  );
}

export default QuestionCard;