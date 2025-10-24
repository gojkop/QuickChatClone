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
    
    // ✅ FIX: Better scroll behavior on mobile - scroll to input, not bottom
    if (shouldExpand && sectionRef.current) {
      setTimeout(() => {
        const element = sectionRef.current;
        const isMobile = window.innerWidth < 640;
        
        if (isMobile) {
          // Mobile: Find first interactive element
          const firstInput = element.querySelector('input:not([type="hidden"]), textarea, select');
          
          if (firstInput) {
            // Calculate position to place input comfortably in view
            const navbarHeight = 80;
            const inputRect = firstInput.getBoundingClientRect();
            const inputTop = inputRect.top + window.pageYOffset;
            const targetScroll = inputTop - navbarHeight;
            
            window.scrollTo({ 
              top: Math.max(0, targetScroll), 
              behavior: 'smooth' 
            });
            
            // Focus input after scroll completes
            setTimeout(() => {
              firstInput.focus({ preventScroll: true });
            }, 400);
          } else {
            // Fallback: scroll to accordion section
            const headerHeight = 80;
            const y = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          }
        } else {
          // Desktop: Scroll to show progress dots
          const flowContainer = element.closest('.max-w-4xl') || element.closest('.container-premium');
          if (flowContainer) {
            const progressDots = flowContainer.querySelector('.progress-dots-container');
            if (progressDots) {
              const navbarOffset = 100;
              const absoluteDotsTop = progressDots.getBoundingClientRect().top + window.pageYOffset;
              const scrollTarget = absoluteDotsTop - navbarOffset;
              window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
            }
          }
        }
      }, 250); // Increased timeout for full expansion
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
      case 'active': return 'text-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50';
      case 'completed': return 'text-green-600 bg-gradient-to-br from-green-50 to-emerald-50';
      case 'locked': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div ref={sectionRef} className={`accordion-section ${state}`}>
      {/* Header */}
      <div 
        className="accordion-header group"
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
        <div className={`accordion-icon icon-bounce-hover ${getStateColor()}`}>
          {getIcon()}
        </div>

        {/* Title */}
        <div className="flex-1">
          <h2 className="heading-gradient-primary" style={{ 
            fontSize: '1.0625rem',
            fontFeatureSettings: '"kern" 1',
            lineHeight: '1.4'
          }}>
            Step {step}: {title}
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
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
            <div className="transition-transform duration-200" style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="accordion-body card-premium-padding content-flow">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AccordionSection;