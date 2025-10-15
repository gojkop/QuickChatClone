import { MindPilotIcon } from './MindPilotIcon';

/**
 * MindPilotWordmark - Renders mindPilot logo with icon + text
 * @param {boolean} showIcon - Whether to show icon
 * @param {string} iconVariant - Icon type (default: 'sparkles')
 * @param {string} size - Size: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional classes
 */
export function MindPilotWordmark({ 
  showIcon = true, 
  iconVariant = 'sparkles',
  size = 'md',
  className = '' 
}) {
  const sizes = {
    sm: { icon: 'sm', text: 'text-lg' },      // 18px
    md: { icon: 'md', text: 'text-2xl' },     // 24px
    lg: { icon: 'lg', text: 'text-4xl' },     // 36px
    xl: { icon: 'xl', text: 'text-6xl' },     // 60px
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {showIcon && <MindPilotIcon variant={iconVariant} size={sizes[size].icon} />}
      <span 
        className={`font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent ${sizes[size].text}`}
      >
        mindPilot
      </span>
    </div>
  );
}
