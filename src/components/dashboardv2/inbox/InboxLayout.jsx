import React, { useState, useEffect } from 'react';

function InboxLayout({
  filters,
  quickActions,
  questionList,
  pagination,
  questionDetail,
  selectedQuestion,
  isMobile = false
}) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [splitRatio, setSplitRatio] = useState(50); // Percentage for left panel
  const [isResizing, setIsResizing] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle split pane resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const container = document.getElementById('inbox-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 30% and 70%
      setSplitRatio(Math.max(30, Math.min(70, newRatio)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Determine layout based on window width
  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobileView = windowWidth < 768;

  return (
    <div 
      id="inbox-container"
      className="w-full h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden relative"
    >
      {/* Left Panel: Filters + Question List */}
      <div
        className={`
          flex flex-col border-r border-gray-200 bg-gray-50
          ${(isMobileView || isTablet) && selectedQuestion ? 'hidden' : 'flex'}
          ${isDesktop ? 'h-full' : 'h-full'}
        `}
        style={{
          width: isDesktop ? `${splitRatio}%` : '100%',
          minWidth: isDesktop ? '320px' : undefined,
          maxWidth: isDesktop ? '70%' : undefined,
        }}
      >
        {/* Filters - Scrollable */}
        <div className="flex-shrink-0 overflow-y-auto border-b border-gray-200 bg-white max-h-[40vh] lg:max-h-[50vh]">
          {filters}
        </div>

        {/* Quick Actions */}
        {quickActions && (
          <div className="flex-shrink-0 p-3 bg-white border-b border-gray-200">
            {quickActions}
          </div>
        )}

        {/* Question List - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {questionList}
        </div>

        {/* Pagination - Fixed at bottom */}
        {pagination && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            {pagination}
          </div>
        )}
      </div>

      {/* Resize Handle - Desktop Only */}
      {isDesktop && (
        <div
          className="hidden lg:block w-1 bg-gray-200 hover:bg-indigo-400 cursor-col-resize relative group transition-colors z-10 flex-shrink-0"
          onMouseDown={startResize}
        >
          {/* Visual indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-gray-400 group-hover:bg-indigo-500 rounded-full transition-colors opacity-0 group-hover:opacity-100" />
          
          {/* Grab handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
              <div className="w-0.5 h-4 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Right Panel: Question Detail */}
      <div 
        className={`
          flex flex-col bg-white
          ${(isMobileView || isTablet) && !selectedQuestion ? 'hidden' : 'flex'}
          ${isDesktop ? 'h-full' : 'h-full'}
        `}
        style={{
          width: isDesktop ? `${100 - splitRatio}%` : '100%',
          minWidth: isDesktop ? '320px' : undefined,
        }}
      >
        {questionDetail}
      </div>

      {/* Resize Overlay */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize bg-black/5" />
      )}
    </div>
  );
}

export default InboxLayout;