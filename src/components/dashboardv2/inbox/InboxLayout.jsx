import React from 'react';

function InboxLayout({ 
  filters, 
  quickActions, 
  questionList, 
  questionDetail,
  selectedQuestion,
  isMobile = false 
}) {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Left Panel: Filters + Question List (35% on desktop, full width on mobile) */}
      <div className={`
        flex flex-col border-r border-gray-200 bg-gray-50
        ${isMobile && selectedQuestion ? 'hidden' : 'flex'}
        lg:flex lg:w-[35%] xl:w-[30%]
      `}>
        {/* Filters - Scrollable */}
        <div className="flex-shrink-0 overflow-y-auto border-b border-gray-200 bg-white">
          {filters}
        </div>

        {/* Quick Actions */}
        {quickActions && (
          <div className="flex-shrink-0 p-3 bg-white border-b border-gray-200">
            {quickActions}
          </div>
        )}

        {/* Question List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          {questionList}
        </div>
      </div>

      {/* Right Panel: Question Detail (65% on desktop, full screen on mobile when selected) */}
      <div className={`
        flex-1 overflow-hidden
        ${isMobile && !selectedQuestion ? 'hidden' : 'flex'}
        lg:flex lg:w-[65%] xl:w-[70%]
      `}>
        {questionDetail}
      </div>
    </div>
  );
}

export default InboxLayout;