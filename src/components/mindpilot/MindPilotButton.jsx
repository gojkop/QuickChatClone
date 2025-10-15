import { MindPilotIcon } from './MindPilotIcon';

/**
 * MindPilotButton - Styled button with optional icon
 * @param {string} variant - Style: 'primary', 'secondary', 'ghost'
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {string} icon - Icon variant (optional)
 * @param {boolean} disabled - Disabled state
 * @param {function} onClick - Click handler
 * @param {node} children - Button content
 * @param {string} className - Additional classes
 */
export function MindPilotButton({ 
  variant = 'primary',
  size = 'md',
  icon = null,
  disabled = false,
  onClick,
  children,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl transition-all duration-200 relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.6)] hover:-translate-y-0.5',
    secondary: 'bg-blue-500/15 text-blue-400 border border-blue-500/40 backdrop-blur-sm hover:bg-blue-500/25 hover:border-blue-500/60',
    ghost: 'bg-transparent text-blue-400 hover:bg-blue-500/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-7 py-3.5 text-base',
    lg: 'px-9 py-4 text-lg',
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : 'cursor-pointer';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 bg-white/20 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300" />
      
      {icon && <MindPilotIcon variant={icon} size="sm" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
}