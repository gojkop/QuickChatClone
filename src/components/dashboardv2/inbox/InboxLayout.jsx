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
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col lg:flex-row">
      {/* Left Panel: Filters + Question List - 50% on desktop */}
      <div className={`
        flex flex-col border-r border-gray-200 bg-gray-50
        ${isMobile && selectedQuestion ? 'hidden' : 'flex'}
        lg:w-1/2
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
        <div className="flex-1 overflow-hidden">
          {questionList}
        </div>
      </div>

      {/* Right Panel: Question Detail - 50% on desktop */}
      <div className={`
        flex flex-col bg-white
        ${isMobile && !selectedQuestion ? 'hidden' : 'flex'}
        lg:w-1/2
      `}>
        {questionDetail}
      </div>
    </div>
  );
}

export default InboxLayout;