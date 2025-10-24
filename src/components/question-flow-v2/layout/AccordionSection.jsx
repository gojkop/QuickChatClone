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
    
    // ✅ FIX: Proper scroll behavior - Step 1 shows dots, Steps 2-3 scroll to input
    if (shouldExpand && sectionRef.current) {
      setTimeout(() => {
        const element = sectionRef.current;
        const isMobile = window.innerWidth < 640;
        
        if (isMobile) {
          // Step 1: Scroll to show progress dots at top
          if (step === 1) {
            const flowContainer = element.closest('.max-w-4xl') || element.closest('.container-premium');
            if (flowContainer) {
              const progressDots = flowContainer.querySelector('.progress-dots-container');
              if (progressDots) {
                const navbarOffset = 80; // navbar height
                const dotsTop = progressDots.getBoundingClientRect().top + window.pageYOffset;
                const scrollTarget = dotsTop - navbarOffset;
                window.scrollTo({ 
                  top: Math.max(0, scrollTarget), 
                  behavior: 'smooth' 
                });
              }
            }
          } 
          // Steps 2-3: Scroll to first input field
          else {
            const firstInput = element.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea');
            
            if (firstInput) {
              // Position input comfortably below navbar
              const navbarHeight = 100; // navbar + breathing room
              
              // Wait a bit more for accordion to fully expand
              setTimeout(() => {
                const inputRect = firstInput.getBoundingClientRect();
                const inputTop = inputRect.top + window.pageYOffset;
                const targetScroll = inputTop - navbarHeight;
                
                window.scrollTo({ 
                  top: Math.max(0, targetScroll), 
                  behavior: 'smooth' 
                });
                
                // Focus the input after scroll
                setTimeout(() => {
                  firstInput.focus({ preventScroll: true });
                }, 400);
              }, 100);
            } else {
              // Fallback: scroll to show section header
              const headerHeight = 100;
              const y = element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
              window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
            }
          }
        } else {
          // Desktop: Always scroll to show progress dots + header
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
      }, 300); // Wait for accordion expansion
    }
  }, [state, step]); // Added 'step' to dependencies

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