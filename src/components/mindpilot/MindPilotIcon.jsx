/**
 * MindPilotIcon - Renders contextual emoji icons for different mindPilot features
 * @param {string} variant - Icon type: 'sparkles', 'brain', 'compass', 'lightbulb', 'star', 'lightning', 'target', 'rocket'
 * @param {string} size - Size: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional Tailwind classes
 */
export function MindPilotIcon({ variant = 'sparkles', size = 'md', className = '' }) {
  const icons = {
    sparkles: '✨',
    brain: '🧠',
    compass: '🧭',
    lightbulb: '💡',
    star: '⭐',
    lightning: '⚡',
    target: '🎯',
    rocket: '🚀',
  };

  const sizes = {
    sm: 'text-base',      // 16px
    md: 'text-2xl',       // 24px
    lg: 'text-4xl',       // 36px
    xl: 'text-6xl',       // 60px
  };

  return (
    <span 
      className={`inline-block ${sizes[size]} ${className}`}
      style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))' }}
      role="img"
      aria-label={`mindPilot ${variant} icon`}
    >
      {icons[variant]}
    </span>
  );
}