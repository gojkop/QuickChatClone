// ============================================================================
// mindPilot Component Library - Main Export File
// Location: src/components/mindpilot/index.js
// ============================================================================

// ----------------------------------------------------------------------------
// Component Exports
// ----------------------------------------------------------------------------

export { MindPilotIcon } from './MindPilotIcon';
export { MindPilotWordmark } from './MindPilotWordmark';
export { MindPilotButton } from './MindPilotButton';
export { MindPilotBadge } from './MindPilotBadge';
export { MindPilotCard } from './MindPilotCard';
export { MindPilotAlert } from './MindPilotAlert';
export { MindPilotProgress } from './MindPilotProgress';
export { MindPilotTopicList } from './MindPilotTopicList';
export { MindPilotFloatingPanel } from './MindPilotFloatingPanel';

// ----------------------------------------------------------------------------
// Constants & Utilities
// ----------------------------------------------------------------------------

/**
 * Available icon variants for MindPilotIcon
 */
export const MINDPILOT_ICONS = {
  SPARKLES: 'sparkles',    // ✨ - Primary/default, general AI
  BRAIN: 'brain',          // 🧠 - Analysis, thinking, intelligence
  COMPASS: 'compass',      // 🧭 - Guidance, navigation, blueprint
  LIGHTBULB: 'lightbulb',  // 💡 - Suggestions, insights, tips
  STAR: 'star',            // ⭐ - Quality, excellence, featured
  LIGHTNING: 'lightning',  // ⚡ - Speed, instant, quick
  TARGET: 'target',        // 🎯 - Precision, accuracy, focus
  ROCKET: 'rocket',        // 🚀 - Launch, progress, improvement
};

/**
 * Component size variants
 */
export const MINDPILOT_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

/**
 * Button variants
 */
export const MINDPILOT_BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
};

/**
 * Alert variants
 */
export const MINDPILOT_ALERT_VARIANTS = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

/**
 * Topic status options
 */
export const MINDPILOT_TOPIC_STATUS = {
  COMPLETED: 'completed',
  ACTIVE: 'active',
  PENDING: 'pending',
};

/**
 * Topic priority levels
 */
export const MINDPILOT_TOPIC_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Brand colors (for programmatic use)
 */
export const MINDPILOT_COLORS = {
  // Primary
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  
  // Secondary
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  
  // Accent
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  
  sky500: '#0EA5E9',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',
  
  // Neutrals
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
};

/**
 * CSS gradient strings
 */
export const MINDPILOT_GRADIENTS = {
  primary: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
  brand: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
};

// ----------------------------------------------------------------------------
// Utility Functions
// ----------------------------------------------------------------------------

/**
 * Get icon emoji by variant name
 * @param {string} variant - Icon variant name
 * @returns {string} Emoji character
 */
export function getMindPilotIcon(variant) {
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
  return icons[variant] || icons.sparkles;
}

/**
 * Helper to check if a component prop is valid
 * @param {string} value - Value to check
 * @param {object} validOptions - Object with valid values
 * @returns {boolean}
 */
export function isValidMindPilotProp(value, validOptions) {
  return Object.values(validOptions).includes(value);
}

/**
 * Create a topic object for MindPilotTopicList
 * @param {string} text - Topic text
 * @param {string} status - Status: 'completed', 'active', 'pending'
 * @param {string} priority - Priority: 'high', 'medium', 'low' (optional)
 * @returns {object} Topic object
 */
export function createMindPilotTopic(text, status = 'pending', priority = null) {
  return {
    text,
    status,
    priority,
  };
}

/**
 * Calculate completion percentage from topics array
 * @param {array} topics - Array of topic objects
 * @returns {object} { completed: number, total: number, percentage: number }
 */
export function calculateMindPilotProgress(topics) {
  if (!Array.isArray(topics) || topics.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const completed = topics.filter(t => t.status === 'completed').length;
  const total = topics.length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}

/**
 * Format time for recording display
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time (e.g., "3:24")
 */
export function formatMindPilotTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create recording time display string
 * @param {number} currentSeconds - Current recording time in seconds
 * @param {number} estimatedSeconds - Estimated total time in seconds (optional)
 * @returns {string} Display string (e.g., "3:24 / ~10:00")
 */
export function createMindPilotTimeDisplay(currentSeconds, estimatedSeconds = null) {
  const current = formatMindPilotTime(currentSeconds);
  
  if (estimatedSeconds) {
    const estimated = formatMindPilotTime(estimatedSeconds);
    return `${current} / ~${estimated}`;
  }
  
  return current;
}

// ----------------------------------------------------------------------------
// Preset Component Configurations
// ----------------------------------------------------------------------------

/**
 * Pre-configured component props for common use cases
 */
export const MINDPILOT_PRESETS = {
  // Button presets
  buttons: {
    coachingCTA: {
      variant: 'primary',
      icon: 'sparkles',
      children: 'Get AI Coaching',
    },
    blueprintCTA: {
      variant: 'primary',
      icon: 'compass',
      children: 'View Blueprint',
    },
    startRecording: {
      variant: 'primary',
      icon: 'target',
      children: 'Start Recording',
    },
    skip: {
      variant: 'ghost',
      children: 'Skip for now',
    },
  },

  // Alert presets
  alerts: {
    analysisComplete: {
      variant: 'success',
      title: 'Analysis Complete',
      icon: '✓',
    },
    suggestion: {
      variant: 'info',
      icon: '💡',
      title: 'Suggestion',
    },
    missingInfo: {
      variant: 'warning',
      icon: '⚠',
      title: 'Missing Information',
    },
  },

  // Badge presets
  badges: {
    enhanced: {
      icon: 'sparkles',
      children: 'Enhanced by mindPilot',
    },
    aiGenerated: {
      icon: 'star',
      children: 'AI Generated',
    },
    analyzing: {
      icon: 'brain',
      children: 'Analyzing...',
    },
  },
};

// ----------------------------------------------------------------------------
// TypeScript Type Definitions (for reference)
// ----------------------------------------------------------------------------

/**
 * @typedef {Object} MindPilotIconProps
 * @property {'sparkles'|'brain'|'compass'|'lightbulb'|'star'|'lightning'|'target'|'rocket'} [variant='sparkles']
 * @property {'sm'|'md'|'lg'|'xl'} [size='md']
 * @property {string} [className='']
 */

/**
 * @typedef {Object} MindPilotButtonProps
 * @property {'primary'|'secondary'|'ghost'} [variant='primary']
 * @property {'sm'|'md'|'lg'} [size='md']
 * @property {string} [icon=null]
 * @property {boolean} [disabled=false]
 * @property {Function} [onClick]
 * @property {React.ReactNode} children
 * @property {string} [className='']
 */

/**
 * @typedef {Object} MindPilotAlertProps
 * @property {'success'|'info'|'warning'|'error'} [variant='info']
 * @property {string} title
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string} [className='']
 */

/**
 * @typedef {Object} MindPilotTopicObject
 * @property {string} text - Topic text
 * @property {'completed'|'active'|'pending'} status - Topic status
 * @property {'high'|'medium'|'low'} [priority] - Priority level (optional)
 */

/**
 * @typedef {Object} MindPilotProgressResult
 * @property {number} completed - Number of completed topics
 * @property {number} total - Total number of topics
 * @property {number} percentage - Completion percentage (0-100)
 */

// ----------------------------------------------------------------------------
// Usage Examples
// ----------------------------------------------------------------------------

/**
 * Example 1: Basic imports
 * 
 * import { 
 *   MindPilotCard, 
 *   MindPilotButton, 
 *   MindPilotAlert,
 *   MINDPILOT_ICONS 
 * } from '@/components/mindpilot';
 * 
 * <MindPilotCard title="Analysis" icon={MINDPILOT_ICONS.SPARKLES}>
 *   <MindPilotAlert variant="success" title="Complete" />
 *   <MindPilotButton variant="primary" icon={MINDPILOT_ICONS.SPARKLES}>
 *     Continue
 *   </MindPilotButton>
 * </MindPilotCard>
 */

/**
 * Example 2: Using presets
 * 
 * import { MindPilotButton, MINDPILOT_PRESETS } from '@/components/mindpilot';
 * 
 * <MindPilotButton {...MINDPILOT_PRESETS.buttons.coachingCTA} />
 */

/**
 * Example 3: Using utilities
 * 
 * import { 
 *   MindPilotTopicList, 
 *   createMindPilotTopic,
 *   calculateMindPilotProgress 
 * } from '@/components/mindpilot';
 * 
 * const topics = [
 *   createMindPilotTopic('Topic 1', 'completed', 'high'),
 *   createMindPilotTopic('Topic 2', 'active'),
 *   createMindPilotTopic('Topic 3', 'pending', 'medium'),
 * ];
 * 
 * const progress = calculateMindPilotProgress(topics);
 * // { completed: 1, total: 3, percentage: 33 }
 * 
 * <MindPilotTopicList topics={topics} />
 */

/**
 * Example 4: Recording time display
 * 
 * import { 
 *   MindPilotFloatingPanel,
 *   createMindPilotTimeDisplay 
 * } from '@/components/mindpilot';
 * 
 * const [recordingSeconds, setRecordingSeconds] = useState(204); // 3:24
 * const timeDisplay = createMindPilotTimeDisplay(recordingSeconds, 600); // "3:24 / ~10:00"
 * 
 * <MindPilotFloatingPanel
 *   isRecording={true}
 *   timeDisplay={timeDisplay}
 * >
 *   ...
 * </MindPilotFloatingPanel>
 */

// ----------------------------------------------------------------------------
// Version & Metadata
// ----------------------------------------------------------------------------

export const MINDPILOT_VERSION = '1.0.0';
export const MINDPILOT_AUTHOR = 'mindPick Team';
export const MINDPILOT_LICENSE = 'MIT';

/**
 * Component library metadata
 */
export const MINDPILOT_META = {
  version: MINDPILOT_VERSION,
  author: MINDPILOT_AUTHOR,
  license: MINDPILOT_LICENSE,
  description: 'mindPilot AI Co-pilot Component Library for mindPick',
  components: [
    'MindPilotIcon',
    'MindPilotWordmark',
    'MindPilotButton',
    'MindPilotBadge',
    'MindPilotCard',
    'MindPilotAlert',
    'MindPilotProgress',
    'MindPilotTopicList',
    'MindPilotFloatingPanel',
  ],
  repository: 'https://github.com/mindpick/mindpick-platform',
  docs: 'https://docs.mindpick.me/mindpilot',
};