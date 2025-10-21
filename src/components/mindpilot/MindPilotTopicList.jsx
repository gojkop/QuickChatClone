import { MindPilotIcon } from './MindPilotIcon';
import { Check, ChevronRight, Circle } from 'lucide-react';

/**
 * MindPilotTopicItem - Single topic item
 * @param {string} status - Status: 'completed', 'active', 'pending'
 * @param {string} text - Topic text
 * @param {string} priority - Priority badge (optional): 'high', 'medium', 'low'
 */
function MindPilotTopicItem({ status = 'pending', text, priority }) {
  const statusConfig = {
    completed: {
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      icon: Check,
      textColor: 'text-slate-50',
      borderColor: 'border-emerald-500/30',
      bg: 'bg-slate-900/40',
    },
    active: {
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      icon: ChevronRight,
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/50',
      bg: 'bg-blue-500/15',
      shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    },
    pending: {
      iconBg: 'bg-blue-500/10',
      icon: Circle,
      textColor: 'text-slate-500',
      borderColor: 'border-blue-500/20',
      bg: 'bg-slate-900/40',
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  const priorityColors = {
    high: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-blue-500/10 text-slate-400',
    low: 'bg-blue-500/5 text-slate-500',
  };

  return (
    <div 
      className={`flex items-center gap-3 p-3.5 mb-2 rounded-xl border transition-all duration-200 hover:${config.bg} hover:border-blue-500/40 ${config.bg} ${config.borderColor} ${config.shadow || ''}`}
    >
      <div 
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${config.iconBg}`}
        style={status === 'completed' ? { boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' } : 
               status === 'active' ? { boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' } : {}}
      >
        <IconComponent 
          className={`w-4 h-4 ${status === 'completed' || status === 'active' ? 'text-white' : config.textColor}`}
        />
      </div>
      <div className={`flex-1 text-sm font-medium ${config.textColor}`}>
        {text}
      </div>
      {priority && (
        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold ${priorityColors[priority]}`}>
          {priority === 'high' ? 'High' : priority === 'medium' ? 'Med' : 'Low'}
        </div>
      )}
    </div>
  );
}

/**
 * MindPilotTopicList - List of topics with status tracking
 * @param {array} topics - Array of topic objects: [{ text, status, priority }]
 * @param {string} className - Additional classes
 */
export function MindPilotTopicList({ topics = [], className = '' }) {
  return (
    <div className={className}>
      {topics.map((topic, index) => (
        <MindPilotTopicItem 
          key={index}
          status={topic.status}
          text={topic.text}
          priority={topic.priority}
        />
      ))}
    </div>
  );
}