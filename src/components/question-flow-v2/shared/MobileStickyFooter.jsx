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

  // ✅ FIX: Don't render wrapper at all on desktop, just return children directly
  if (!isMobile || !show) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-sticky-footer">
      {children}
    </div>
  );
}

export default MobileStickyFooter;