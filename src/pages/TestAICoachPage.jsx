import React, { useState } from 'react';
import { useQuestionCoach } from '../hooks/useQuestionCoach';
import { ValidationFeedback } from '../components/question/ValidationFeedback';
import { QuestionCoachDialog } from '../components/question/QuestionCoachDialog';

// ✅ Changed from "export function" to "export default function"
export default function TestAICoachPage() {
  const [step, setStep] = useState('input'); // input, validation, coaching, done
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const coach = useQuestionCoach();

  // Mock expert profile
  const mockExpert = {
    id: 'expert_123',
    name: 'Sarah Johnson',
    specialty: 'SaaS Pricing & Growth Strategy',
    user: { name: 'Sarah Johnson' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a question title');
      return;
    }

    try {
      // Tier 1: Validate
      const validation = await coach.validateQuestion(title, mockExpert.id);
      
      console.log('Validation result:', validation);
      
      // Show validation feedback
      setStep('validation');
      
    } catch (error) {
      alert('Validation failed: ' + error.message);
    }
  };

  const handleRequestCoaching = async () => {
    try {
      setStep('loading');
      
      // Tier 2: Get AI coaching
      const coaching = await coach.getCoaching(mockExpert, { text });
      
      console.log('Coaching result:', coaching);
      
      setStep('coaching');
      
    } catch (error) {
      alert('Coaching failed: ' + error.message);
      setStep('validation');
    }
  };

  const handleEditQuestion = () => {
    setStep('input');
  };

  const handleContinueWithoutCoaching = () => {
    setStep('done');
  };

  const handleCoachingComplete = async (responses) => {
    if (responses && Object.keys(responses).length > 0) {
      console.log('Clarification responses:', responses);
      await coach.submitClarificationResponses(responses);
      
      // Append to text
      const clarificationText = Object.entries(responses)
        .filter(([_, answer]) => answer.trim())
        .map(([id, answer]) => {
          const clarification = coach.tier2Result.clarifications.find(c => c.id === id);
          return `\n\n**${clarification.question}**\n${answer}`;
        })
        .join('');
      
      setText(prev => prev + clarificationText);
    }
    
    setStep('done');
  };

  const handleSkipCoaching = () => {
    setStep('done');
  };

  const handleReset = () => {
    setTitle('');
    setText('');
    setStep('input');
    coach.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Question Coach Test
          </h1>
          <p className="text-gray-600">
            Testing AI coaching flow without Xano
          </p>
        </div>

        {/* Mock Expert Card */}
        <div className="bg-white border-2 border-indigo-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-2xl">👩‍💼</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{mockExpert.name}</h3>
              <p className="text-sm text-gray-600">{mockExpert.specialty}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {step === 'input' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Question Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="e.g., How should I price my SaaS product?"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Try different questions: "help", "pricing strategy", "How do I improve conversion rates?"
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition"
                  rows="4"
                  placeholder="Add any extra details..."
                />
              </div>

              <button
                type="submit"
                disabled={coach.loading || !title.trim()}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {coach.loading ? 'Validating...' : 'Test AI Coach'}
              </button>
            </form>
          )}

          {step === 'validation' && coach.tier1Result && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Let's improve your question
                </h2>
              </div>
              
              <ValidationFeedback
                feedback={coach.tier1Result.feedback}
                clarityScore={coach.tier1Result.validation.clarityScore}
                onRetry={handleEditQuestion}
                onContinue={handleContinueWithoutCoaching}
                onRequestCoaching={handleRequestCoaching}
              />
            </div>
          )}

          {step === 'loading' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">AI is analyzing your question...</p>
              <p className="text-sm text-gray-500 mt-2">This may take 5-10 seconds</p>
            </div>
          )}

          {step === 'coaching' && coach.tier2Result && (
            <QuestionCoachDialog
              analysis={coach.tier2Result.analysis}
              clarifications={coach.tier2Result.clarifications}
              attachmentSuggestions={coach.tier2Result.attachmentSuggestions}
              expertName={mockExpert.name}
              onComplete={handleCoachingComplete}
              onSkip={handleSkipCoaching}
            />
          )}

          {step === 'done' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Coaching Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                Your question has been improved with AI coaching
              </p>

              {/* Show final data */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Final Question:</h4>
                <p className="text-sm text-gray-700 mb-3">{title}</p>
                
                {text && (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-2">Context:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{text}</p>
                  </>
                )}

                {coach.tier1Result && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Session ID: {coach.sessionId}
                      <br />
                      Clarity Score: {coach.tier1Result.validation.clarityScore}/100
                      {coach.tier2Result && (
                        <>
                          <br />
                          AI Clarity: {coach.tier2Result.analysis.clarity}/100
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Test Another Question
                </button>
                <button
                  onClick={() => alert('In production, this would proceed to payment')}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
                >
                  Proceed to Payment (Demo)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {(coach.tier1Result || coach.tier2Result) && (
          <div className="mt-6 bg-gray-900 text-gray-100 rounded-xl p-4 text-xs font-mono">
            <div className="mb-2 font-bold text-green-400">Debug Info (for testing):</div>
            {coach.tier1Result && (
              <div className="mb-2">
                <div className="text-yellow-400">Tier 1 Result:</div>
                <pre className="overflow-x-auto">{JSON.stringify(coach.tier1Result, null, 2)}</pre>
              </div>
            )}
            {coach.tier2Result && (
              <div>
                <div className="text-yellow-400">Tier 2 Result:</div>
                <pre className="overflow-x-auto">{JSON.stringify(coach.tier2Result, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}