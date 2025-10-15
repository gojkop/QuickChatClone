import { MindPilotIcon } from './MindPilotIcon';

/**
 * MindPilotFloatingPanel - Floating panel for recording co-pilot
 * @param {string} title - Panel title
 * @param {string} icon - Header icon
 * @param {boolean} isRecording - Show recording indicator
 * @param {string} timeDisplay - Recording time display (e.g., "3:24 / ~10:00")
 * @param {node} children - Panel content
 * @param {string} className - Additional classes
 */
export function MindPilotFloatingPanel({ 
  title = 'Recording Co-pilot',
  icon = 'target',
  isRecording = false,
  timeDisplay,
  children,
  className = '' 
}) {
  return (
    <div 
      className={`max-w-sm bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 rounded-2xl overflow-hidden ${className}`}
      style={{
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-blue-500/20">
        <MindPilotIcon variant={icon} size="md" />
        <div className="text-base font-bold text-slate-50">{title}</div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Recording indicator */}
        {isRecording && timeDisplay && (
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"
              style={{
                animation: 'pulse-record 1.5s ease-in-out infinite',
                boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)'
              }}
            />
            <div className="text-sm text-slate-400 font-semibold">
              <span className="text-slate-50">Recording:</span> {timeDisplay}
            </div>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
}