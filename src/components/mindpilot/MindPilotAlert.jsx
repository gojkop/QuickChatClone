import { MindPilotIcon } from './MindPilotIcon';
import { CheckCircle2, Lightbulb, AlertTriangle, XCircle } from 'lucide-react';

/**
 * MindPilotAlert - Alert box with icon and content
 * @param {string} variant - Type: 'success', 'info', 'warning', 'error'
 * @param {string} title - Alert title
 * @param {string} description - Alert description
 * @param {string} icon - Custom icon (optional, defaults based on variant)
 * @param {string} className - Additional classes
 */
export function MindPilotAlert({ 
  variant = 'info', 
  title, 
  description,
  icon,
  className = '' 
}) {
  const variants = {
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-500',
      icon: CheckCircle2,
    },
    info: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      text: 'text-sky-500',
      icon: Lightbulb,
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-500',
      icon: XCircle,
    },
  };

  const config = variants[variant];
  const IconComponent = icon || config.icon;

  return (
    <div 
      className={`flex items-start gap-4 p-5 rounded-2xl border ${config.bg} ${config.border} ${className}`}
    >
      <div className={`${config.text} flex-shrink-0`}>
        {typeof IconComponent === 'function' ? (
          <IconComponent className="w-6 h-6" />
        ) : (
          <span className="text-2xl">{IconComponent}</span>
        )}
      </div>
      <div className="flex-1">
        <div className={`text-base font-semibold ${config.text} mb-1.5`}>
          {title}
        </div>
        {description && (
          <div className={`text-sm leading-relaxed ${config.text} opacity-90`}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}