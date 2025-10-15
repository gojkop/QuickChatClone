/**
 * MindPilotProgress - Animated progress bar
 * @param {number} value - Progress value (0-100)
 * @param {number} max - Maximum value (default: 100)
 * @param {string} label - Progress label (optional)
 * @param {boolean} showPercentage - Show percentage text
 * @param {string} className - Additional classes
 */
export function MindPilotProgress({ 
  value = 0, 
  max = 100,
  label,
  showPercentage = true,
  className = '' 
}) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-3 text-sm font-semibold text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className="h-3 bg-slate-900/60 rounded-full overflow-hidden border border-blue-500/20">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full relative transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
          }}
        >
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              animation: 'shimmer-progress 2s infinite',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}