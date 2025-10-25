import React from 'react';
import QuestionCard from './QuestionCard';
import EmptyState from '../shared/EmptyState';
import { Inbox } from 'lucide-react';

function QuestionListView({ 
  questions, 
  selectedQuestions,
  onSelectQuestion,
  onQuestionClick 
}) {
  if (questions.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No questions found"
        description="Try adjusting your filters or check back later for new questions."
      />
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          isSelected={selectedQuestions.includes(question.id)}
          onSelect={onSelectQuestion}
          onClick={() => onQuestionClick(question)}
        />
      ))}
    </div>
  );
}

export default QuestionListView;