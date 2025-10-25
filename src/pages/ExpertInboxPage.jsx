import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '@/api';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import InboxLayout from '@/components/dashboardv2/inbox/InboxLayout';
import QuestionFilters from '@/components/dashboardv2/inbox/QuestionFilters';
import QuickActions from '@/components/dashboardv2/inbox/QuickActions';
import QuestionListView from '@/components/dashboardv2/inbox/QuestionListView';
import QuestionDetailPanel from '@/components/dashboardv2/inbox/QuestionDetailPanel';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import { useInbox } from '@/hooks/dashboardv2/useInbox';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';

// Import modal for answering (reuse from old dashboard)
import QuestionDetailModal from '@/components/dashboard/QuestionDetailModal';

function ExpertInboxPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const metrics = useMetrics(questions);
  const {
    filters,
    updateFilter,
    filteredQuestions,
    selectedQuestions,
    toggleSelectQuestion,
    selectAll,
    clearSelection,
    totalCount,
    filteredCount,
  } = useInbox(questions);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, questionsRes] = await Promise.all([
          apiClient.get('/me/profile'),
          apiClient.get('/me/questions'),
        ]);

        setProfile(profileRes.data.expert_profile || {});
        setQuestions(questionsRes.data || []);
      } catch (err) {
        console.error('Failed to load inbox data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle URL hash for question selection
  useEffect(() => {
    const hash = location.hash;
    
    if (hash.startsWith('#question-')) {
      const questionId = parseInt(hash.replace('#question-', ''), 10);
      
      if (!isNaN(questionId) && questions.length > 0) {
        const question = questions.find(q => q.id === questionId);
        
        if (question) {
          setSelectedQuestion(question);
        }
      }
    } else if (hash === '') {
      // Auto-select first question on desktop
      if (!isMobile && filteredQuestions.length > 0 && !selectedQuestion) {
        setSelectedQuestion(filteredQuestions[0]);
      }
    }
  }, [location.hash, questions, isMobile, filteredQuestions]);

  // Refresh questions
  const refreshQuestions = async () => {
    try {
      const response = await apiClient.get('/me/questions');
      setQuestions(response.data || []);
    } catch (err) {
      console.error('Failed to refresh questions:', err);
    }
  };

  // Bulk actions
  const handleBulkHide = async () => {
    if (selectedQuestions.length === 0) return;
    
    try {
      await Promise.all(
        selectedQuestions.map(id => 
          apiClient.post(`/expert/questions/${id}/hide`)
        )
      );
      await refreshQuestions();
      clearSelection();
    } catch (err) {
      console.error('Failed to hide questions:', err);
    }
  };

  const handleExport = () => {
    const selectedQs = questions.filter(q => selectedQuestions.includes(q.id));
    
    const csv = [
      ['ID', 'Question', 'User', 'Price', 'Created', 'Status'].join(','),
      ...selectedQs.map(q => [
        q.id,
        `"${(q.question_text || '').replace(/"/g, '""')}"`,
        q.user_name || '',
        (q.price_cents || 0) / 100,
        new Date(q.created_at * 1000).toISOString(),
        q.status,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    navigate(`/dashboard/inbox#question-${question.id}`, { replace: false });
  };

  const handleCloseDetail = () => {
    setSelectedQuestion(null);
    if (location.hash.startsWith('#question-')) {
      navigate('/dashboard/inbox', { replace: true });
    }
  };

  const handleAnswerQuestion = () => {
    setShowAnswerModal(true);
  };

  const handleCloseAnswerModal = () => {
    setShowAnswerModal(false);
  };

  const handleAvailabilityChange = (newStatus) => {
    setProfile(prev => ({ ...prev, accepting_questions: newStatus }));
  };

  if (isLoading) {
    return (
      <DashboardLayout 
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Inbox' }
        ]}
      >
        <LoadingState />
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Inbox' }
        ]}
        pendingCount={metrics.pendingCount}
        isAvailable={profile?.accepting_questions ?? true}
        onAvailabilityChange={handleAvailabilityChange}
      >
        <InboxLayout
          selectedQuestion={selectedQuestion}
          isMobile={isMobile}
          filters={
            <QuestionFilters
              filters={filters}
              onFilterChange={updateFilter}
              filteredCount={filteredCount}
              totalCount={totalCount}
            />
          }
          quickActions={
            <QuickActions
              selectedCount={selectedQuestions.length}
              onClearSelection={clearSelection}
              onBulkHide={handleBulkHide}
              onExport={handleExport}
            />
          }
          questionList={
            <QuestionListView
              questions={filteredQuestions}
              selectedQuestions={selectedQuestions}
              activeQuestionId={selectedQuestion?.id}
              onSelectQuestion={toggleSelectQuestion}
              onQuestionClick={handleQuestionClick}
            />
          }
          questionDetail={
            <QuestionDetailPanel
              question={selectedQuestion}
              onClose={handleCloseDetail}
              onAnswer={handleAnswerQuestion}
              isMobile={isMobile}
            />
          }
        />
      </DashboardLayout>

      {/* Answer Modal - Reuse from old dashboard */}
      {profile && selectedQuestion && (
        <QuestionDetailModal
          isOpen={showAnswerModal}
          onClose={handleCloseAnswerModal}
          question={selectedQuestion}
          userId={profile?.user?.id || profile?.id}
          onAnswerSubmitted={() => {
            refreshQuestions();
            handleCloseAnswerModal();
          }}
        />
      )}
    </>
  );
}

export default ExpertInboxPage;