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
    
    // ✅ ADAPTIVE SCROLL: Different behavior for mobile vs desktop
    if (shouldExpand && sectionRef.current) {
      setTimeout(() => {
        const section = sectionRef.current;
        const isMobile = window.innerWidth < 640;
        
        if (isMobile) {
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          // MOBILE: Scroll to first input for keyboard optimization
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          const firstInput = section.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea');
          
          if (firstInput) {
            const inputTop = firstInput.getBoundingClientRect().top;
            const absoluteInputTop = inputTop + window.pageYOffset;
            const viewportCenter = window.innerHeight / 3;
            const scrollTarget = absoluteInputTop - viewportCenter;
            
            window.scrollTo({ 
              top: Math.max(0, scrollTarget),
              behavior: 'smooth' 
            });
            
            console.log('📱 Mobile: Scrolled to input field');
          } else {
            const headerOffset = 60;
            const sectionTop = section.getBoundingClientRect().top;
            const absoluteTop = sectionTop + window.pageYOffset;
            const scrollTarget = absoluteTop - headerOffset;
            
            window.scrollTo({ 
              top: Math.max(0, scrollTarget),
              behavior: 'smooth' 
            });
          }
        } else {
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          // DESKTOP: Scroll to show PROGRESS DOTS + accordion header
          // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          
          // Find the FlowContainer (parent container with progress dots)
          const flowContainer = section.closest('.max-w-4xl');
          
          if (flowContainer) {
            // Find the progress dots element (first child of flow container)
            const progressDots = flowContainer.querySelector('.progress-dots-container');
            
            if (progressDots) {
              // Scroll to show progress dots at the top
              const dotsTop = progressDots.getBoundingClientRect().top;
              const absoluteDotsTop = dotsTop + window.pageYOffset;
              
              // Account for fixed navbar (~80px) + small padding (20px)
              const navbarOffset = 100;
              const scrollTarget = absoluteDotsTop - navbarOffset;
              
              window.scrollTo({ 
                top: Math.max(0, scrollTarget),
                behavior: 'smooth' 
              });
              
              console.log('🖥️ Desktop: Scrolled to progress dots (context preserved)');
            } else {
              // Fallback: scroll to flow container if progress dots not found
              const containerTop = flowContainer.getBoundingClientRect().top;
              const absoluteContainerTop = containerTop + window.pageYOffset;
              const scrollTarget = absoluteContainerTop - 100;
              
              window.scrollTo({ 
                top: Math.max(0, scrollTarget),
                behavior: 'smooth' 
              });
              
              console.log('🖥️ Desktop: Scrolled to container (fallback)');
            }
          } else {
            // Final fallback: use original method with larger offset
            const largeOffset = 200; // Navbar + progress dots + spacing
            const sectionTop = section.getBoundingClientRect().top;
            const absoluteTop = sectionTop + window.pageYOffset;
            const scrollTarget = absoluteTop - largeOffset;
            
            window.scrollTo({ 
              top: Math.max(0, scrollTarget),
              behavior: 'smooth' 
            });
            
            console.log('🖥️ Desktop: Scrolled with large offset (final fallback)');
          }
        }
      }, 300);
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