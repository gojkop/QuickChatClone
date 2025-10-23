import React, { useState, useEffect } from 'react';

function MobileStickyFooter({ children, show = true }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile || !show) {
    return <div className="mt-6">{children}</div>;
  }

  return (
    <div className="mobile-sticky-footer">
      {children}
    </div>
  );
}

export default MobileStickyFooter;