import React from 'react';
import { ComposeIcon, ReviewIcon, PaymentIcon, EditIcon, ChevronDownIcon, ChevronUpIcon } from '../shared/SVGIcons';

function AccordionSection({ 
  step, 
  title, 
  icon, 
  state, // 'active' | 'completed' | 'locked'
  children,
  onEdit,
  isExpandable 
}) {
  const [isExpanded, setIsExpanded] = React.useState(state === 'active');

  React.useEffect(() => {
    setIsExpanded(state === 'active');
  }, [state]);

  const handleHeaderClick = () => {
    if (state === 'locked') return;
    if (state === 'completed' && isExpandable) {
      setIsExpanded(!isExpanded);
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'compose': return <ComposeIcon className="w-6 h-6" />;
      case 'review': return <ReviewIcon className="w-6 h-6" />;
      case 'payment': return <PaymentIcon className="w-6 h-6" />;
      default: return null;
    }
  };

  const getStateColor = () => {
    switch (state) {
      case 'active': return 'text-indigo-600 bg-indigo-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'locked': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`accordion-section ${state}`}>
      {/* Header */}
      <div 
        className="accordion-header"
        onClick={handleHeaderClick}
        role="button"
        tabIndex={state === 'locked' ? -1 : 0}
      >
        {/* Step Number & Icon */}
        <div className={`accordion-icon ${getStateColor()}`}>
          {getIcon()}
        </div>

        {/* Title */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">
            Step {step}: {title}
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {state === 'completed' && isExpandable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="accordion-edit-btn"
            >
              <EditIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {state !== 'locked' && (
            isExpanded ? 
              <ChevronUpIcon className="w-5 h-5 text-gray-400" /> :
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="accordion-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AccordionSection;