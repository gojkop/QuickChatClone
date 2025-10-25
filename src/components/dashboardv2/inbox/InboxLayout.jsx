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
    <div className="h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[minmax(320px,400px)_minmax(600px,1fr)]">
      {/* Left Panel: Filters + Question List */}
      <div className={`
        flex flex-col border-r border-gray-200 bg-gray-50
        ${isMobile && selectedQuestion ? 'hidden' : 'flex'}
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

      {/* Right Panel: Question Detail */}
      <div className={`
        overflow-hidden bg-white
        ${isMobile && !selectedQuestion ? 'hidden' : 'flex'}
      `}>
        {questionDetail}
      </div>
    </div>
  );
}

export default InboxLayout;