import React, { useEffect, useState } from 'react';
import QuestionTable from './QuestionTable';
import MobileQuestionCard from './MobileQuestionCard';
import EmptyState from '../shared/EmptyState';
import { Inbox } from 'lucide-react';

function QuestionListView({
  questions,
  selectedQuestions,
  activeQuestionId,
  onSelectQuestion,
  onQuestionClick,
  onSelectAll
}) {
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
    <div className="flex-1 w-full flex flex-col min-h-0">
      {isMobile ? (
        // Mobile: Card-based layout
        <div className="flex-1 overflow-y-auto min-h-0">
          {questions.map((question) => (
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
        // Desktop: Table layout - takes all available space
        <div className="flex-1 min-h-0">
          <QuestionTable
            questions={questions}
            selectedQuestions={selectedQuestions}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={onSelectQuestion}
            onQuestionClick={onQuestionClick}
            onSelectAll={handleSelectAll}
          />
        </div>
      )}
    </div>
  );
}

export default QuestionListView;