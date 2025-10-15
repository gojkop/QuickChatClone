import { MindPilotIcon } from './MindPilotIcon';

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
      icon: '✓',
    },
    info: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      text: 'text-sky-500',
      icon: '💡',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-500',
      icon: '⚠',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-500',
      icon: '×',
    },
  };

  const config = variants[variant];

  return (
    <div 
      className={`flex items-start gap-4 p-5 rounded-2xl border ${config.bg} ${config.border} ${className}`}
    >
      <div className={`text-2xl ${config.text} flex-shrink-0`}>
        {icon || config.icon}
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