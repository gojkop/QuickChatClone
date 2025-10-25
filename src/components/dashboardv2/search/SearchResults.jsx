import React from 'react';
import { 
  MessageSquare, Home, Inbox, BarChart3, PieChart, User, 
  Settings, HelpCircle, Zap, Download, Eye, Link, ToggleLeft 
} from 'lucide-react';
import { formatCurrency } from '@/utils/dashboardv2/metricsCalculator';

const iconMap = {
  message: MessageSquare,
  home: Home,
  inbox: Inbox,
  chart: BarChart3,
  megaphone: PieChart,
  user: User,
  settings: Settings,
  help: HelpCircle,
  toggle: ToggleLeft,
  download: Download,
  eye: Eye,
  link: Link,
};

function SearchResults({ results, selectedIndex, onSelect }) {
  const allResults = [
    ...results.questions,
    ...results.navigation,
    ...results.actions
  ];

  if (allResults.length === 0) {
    return null;
  }

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName] || MessageSquare;
    return Icon;
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'question': return 'Question';
      case 'navigation': return 'Page';
      case 'action': return 'Action';
      default: return '';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-700';
      case 'navigation': return 'bg-purple-100 text-purple-700';
      case 'action': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="py-2">
      {/* Questions */}
      {results.questions.length > 0 && (
        <div className="mb-2">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Questions
          </div>
          {results.questions.map((result, index) => {
            const Icon = getIcon(result.icon);
            const globalIndex = index;
            const isSelected = globalIndex === selectedIndex;

            return (
              <button
                key={`question-${result.id}`}
                onClick={() => onSelect(result)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                  ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Icon size={16} className={isSelected ? 'text-indigo-600' : 'text-gray-600'} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </span>
                    {result.metadata?.price && (
                      <span className="text-xs font-semibold text-green-600">
                        {formatCurrency(result.metadata.price)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.subtitle}
                  </div>
                </div>

                {result.metadata?.answered && (
                  <span className="text-xs font-semibold text-green-600">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      {results.navigation.length > 0 && (
        <div className="mb-2">
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Pages
          </div>
          {results.navigation.map((result, index) => {
            const Icon = getIcon(result.icon);
            const globalIndex = results.questions.length + index;
            const isSelected = globalIndex === selectedIndex;

            return (
              <button
                key={`nav-${index}`}
                onClick={() => onSelect(result)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                  ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Icon size={16} className={isSelected ? 'text-indigo-600' : 'text-gray-600'} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {results.actions.length > 0 && (
        <div>
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </div>
          {results.actions.map((result, index) => {
            const Icon = getIcon(result.icon);
            const globalIndex = results.questions.length + results.navigation.length + index;
            const isSelected = globalIndex === selectedIndex;

            return (
              <button
                key={`action-${index}`}
                onClick={() => onSelect(result)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                  ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                `}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Icon size={16} className={isSelected ? 'text-indigo-600' : 'text-gray-600'} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchResults;