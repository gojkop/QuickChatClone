import React from 'react';
import { ComposeIcon, ReviewIcon, PaymentIcon, EditIcon, ChevronDownIcon, ChevronUpIcon } from '../shared/SVGIcons';

function AccordionSection({ 
  step, 
  title, 
  icon, 
  state,
  children,
  onEdit,
  isExpandable 
}) {
  const [isExpanded, setIsExpanded] = React.useState(state === 'active');
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    const shouldExpand = state === 'active';
    setIsExpanded(shouldExpand);
    
    // ✅ IMPROVED: Better scroll behavior - always scroll to section header
    if (shouldExpand && sectionRef.current) {
      // Wait for accordion expansion animation to complete
      setTimeout(() => {
        const element = sectionRef.current;
        const isMobile = window.innerWidth < 640;
        
        if (isMobile) {
          // Mobile: Scroll to accordion header with small offset from top
          const headerHeight = 60; // Progress dots + small padding
          const elementTop = element.getBoundingClientRect().top;
          const absoluteTop = elementTop + window.pageYOffset;
          const scrollTarget = absoluteTop - headerHeight;
          
          window.scrollTo({ 
            top: Math.max(0, scrollTarget), // Don't scroll negative
            behavior: 'smooth' 
          });
        } else {
          // Desktop: Scroll with moderate offset for context
          const yOffset = -100;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 250); // Increased delay to wait for accordion expansion
    }
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
    <div ref={sectionRef} className={`accordion-section ${state}`}>
      {/* Header */}
      <div 
        className="accordion-header"
        onClick={handleHeaderClick}
        role="button"
        tabIndex={state === 'locked' ? -1 : 0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleHeaderClick();
          }
        }}
      >
        {/* Step Number & Icon */}
        <div className={`accordion-icon ${getStateColor()}`}>
          {getIcon()}
        </div>

        {/* Title */}
        <div className="flex-1">
          <h2 className="text-base font-bold text-gray-900 tracking-tight" style={{ fontFeatureSettings: '"kern" 1' }}>
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
              aria-label="Edit this step"
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