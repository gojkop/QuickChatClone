import React from 'react';
import QuestionCard from './QuestionCard';
import EmptyState from '../shared/EmptyState';
import { Inbox } from 'lucide-react';

function QuestionListView({ 
  questions, 
  selectedQuestions,
  activeQuestionId,
  onSelectQuestion,
  onQuestionClick 
}) {
  if (questions.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          icon={Inbox}
          title="No questions found"
          description="Try adjusting your filters or check back later for new questions."
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          isSelected={selectedQuestions.includes(question.id)}
          isActive={question.id === activeQuestionId}
          onSelect={onSelectQuestion}
          onClick={() => onQuestionClick(question)}
        />
      ))}
    </div>
  );
}

export default QuestionListView;