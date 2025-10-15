import { MindPilotIcon } from './MindPilotIcon';

/**
 * MindPilotBadge - Small badge with icon and text
 * @param {string} icon - Icon variant
 * @param {node} children - Badge text
 * @param {string} className - Additional classes
 */
export function MindPilotBadge({ icon = 'sparkles', children, className = '' }) {
  return (
    <div 
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(59,130,246,0.4)] relative overflow-hidden ${className}`}
    >
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
        style={{
          animation: 'shimmer 3s infinite',
          backgroundSize: '200% 100%',
        }}
      />
      
      <MindPilotIcon variant={icon} size="sm" className="relative z-10" />
      <span className="relative z-10">{children}</span>
    </div>
  );
}