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
  onSelectAll,
  // ADDED: Pin-related props
  pinnedIds,
  onTogglePin,
  isPinned,
  // ADDED: Preview-related props
  onCopyLink
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
    <div className="h-full w-full overflow-y-auto">
      {isMobile ? (
        // Mobile: Card-based layout
        <div className="h-full">
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
        // Desktop: Table layout
        <QuestionTable
          questions={questions}
          selectedQuestions={selectedQuestions}
          activeQuestionId={activeQuestionId}
          onSelectQuestion={onSelectQuestion}
          onQuestionClick={onQuestionClick}
          onSelectAll={handleSelectAll}
          // ADDED: Pass pin props down to table
          pinnedIds={pinnedIds}
          onTogglePin={onTogglePin}
          isPinned={isPinned}
          onCopyLink={onCopyLink}
        />
      )}
    </div>
  );
}

export default QuestionListView;