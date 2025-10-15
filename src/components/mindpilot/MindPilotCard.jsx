import { MindPilotIcon } from './MindPilotIcon';

/**
 * MindPilotCard - Glassmorphic card container
 * @param {string} title - Card title
 * @param {string} subtitle - Card subtitle (optional)
 * @param {string} icon - Header icon variant (optional)
 * @param {node} children - Card content
 * @param {string} className - Additional classes
 */
export function MindPilotCard({ title, subtitle, icon, children, className = '' }) {
  return (
    <div 
      className={`bg-slate-800/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-blue-500/50 hover:shadow-[0_16px_48px_rgba(59,130,246,0.3)] transition-all duration-300 ${className}`}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {(title || icon) && (
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-blue-500/20">
          {icon && <MindPilotIcon variant={icon} size="lg" />}
          <div>
            <h3 className="text-xl font-bold text-slate-50">{title}</h3>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}