/**
 * MindPilotIcon - Renders contextual SVG icons for different mindPilot features
 * @param {string} variant - Icon type: 'sparkles', 'brain', 'compass', 'lightbulb', 'star', 'lightning', 'target', 'rocket'
 * @param {string} size - Size: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional Tailwind classes
 */
import { Sparkles, Brain, Compass, Lightbulb, Star, Zap, Target, Rocket } from 'lucide-react';

export function MindPilotIcon({ variant = 'sparkles', size = 'md', className = '' }) {
  const icons = {
    sparkles: Sparkles,
    brain: Brain,
    compass: Compass,
    lightbulb: Lightbulb,
    star: Star,
    lightning: Zap,
    target: Target,
    rocket: Rocket,
  };

  const sizes = {
    sm: 'w-4 h-4',      // 16px
    md: 'w-6 h-6',      // 24px
    lg: 'w-9 h-9',      // 36px
    xl: 'w-14 h-14',    // 56px
  };

  const colors = {
    sparkles: 'text-yellow-500',
    brain: 'text-purple-500',
    compass: 'text-blue-500',
    lightbulb: 'text-amber-500',
    star: 'text-yellow-400',
    lightning: 'text-indigo-500',
    target: 'text-red-500',
    rocket: 'text-blue-600',
  };

  const IconComponent = icons[variant];

  return (
    <IconComponent
      className={`inline-block ${sizes[size]} ${colors[variant]} ${className}`}
      style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))' }}
      role="img"
      aria-label={`mindPilot ${variant} icon`}
    />
  );
}