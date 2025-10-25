import React, { useState, useEffect } from 'react';
import QuestionTable from './QuestionTable';
import MobileQuestionCard from './MobileQuestionCard';
import EmptyState from '../shared/EmptyState';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

function QuestionListView({ 
  questions, 
  selectedQuestions,
  activeQuestionId,
  onSelectQuestion,
  onQuestionClick,
  onSelectAll
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset to page 1 when questions change
  useEffect(() => {
    setCurrentPage(1);
  }, [questions.length]);

  // Pagination calculations
  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current, and surrounding pages
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    }
  };

  if (questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center py-8">
        <EmptyState
          icon={Inbox}
          title="No questions found"
          description="Try adjusting your filters or check back later for new questions."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Question List - Scrollable */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile: Card-based layout
          <div className="h-full overflow-y-auto">
            {paginatedQuestions.map((question) => (
              <MobileQuestionCard
                key={question.id}
                question={question}
                isSelected={selectedQuestions.includes(question.id)}
                isActive={question.id === activeQuestionId}
                onSelect={onSelectQuestion}
                onClick={() => onQuestionClick(question)}
              />
            ))}
          </div>
        ) : (
          // Desktop: Table layout
          <QuestionTable
            questions={paginatedQuestions}
            selectedQuestions={selectedQuestions}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={onSelectQuestion}
            onQuestionClick={onQuestionClick}
            onSelectAll={handleSelectAll}
          />
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
          {/* Page Info */}
          <div className="text-xs text-gray-600">
            <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, questions.length)}</span>
            {' '}of{' '}
            <span className="font-semibold">{questions.length}</span>
          </div>

          {/* Page Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      min-w-[28px] h-7 px-2 rounded text-xs font-medium
                      transition-colors
                      ${currentPage === page 
                        ? 'bg-indigo-600 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            {/* Mobile: Just show current page */}
            <div className="sm:hidden text-xs font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionListView;