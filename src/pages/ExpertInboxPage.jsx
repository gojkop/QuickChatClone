import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '@/api';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import InboxLayout from '@/components/dashboardv2/inbox/InboxLayout';
import QuestionFilters from '@/components/dashboardv2/inbox/QuestionFilters';
import QuickActions from '@/components/dashboardv2/inbox/QuickActions';
import QuestionListView from '@/components/dashboardv2/inbox/QuestionListView';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import { useInbox } from '@/hooks/dashboardv2/useInbox';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';

// Import the QuestionDetailModal from old dashboard (reuse it)
import QuestionDetailModal from '@/components/dashboard/QuestionDetailModal';

function ExpertInboxPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

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

  // Handle URL hash for question details
  useEffect(() => {
    const hash = location.hash;
    
    if (hash.startsWith('#question-')) {
      const questionId = parseInt(hash.replace('#question-', ''), 10);
      
      if (!isNaN(questionId) && questions.length > 0) {
        const question = questions.find(q => q.id === questionId);
        
        if (question) {
          setSelectedQuestion(question);
          setShowQuestionModal(true);
        }
      }
    }
  }, [location.hash, questions]);

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

  const handleBulkUnhide = async () => {
    if (selectedQuestions.length === 0) return;
    
    try {
      await Promise.all(
        selectedQuestions.map(id => 
          apiClient.post(`/expert/questions/${id}/unhide`)
        )
      );
      await refreshQuestions();
      clearSelection();
    } catch (err) {
      console.error('Failed to unhide questions:', err);
    }
  };

  const handleExport = () => {
    // Simple CSV export
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
    setShowQuestionModal(true);
    navigate(`/dashboard/inbox#question-${question.id}`, { replace: false });
  };

  const handleCloseModal = () => {
    setShowQuestionModal(false);
    setSelectedQuestion(null);
    if (location.hash.startsWith('#question-')) {
      navigate('/dashboard/inbox', { replace: true });
    }
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
            totalVisible={filteredCount}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onBulkHide={handleBulkHide}
            onBulkUnhide={handleBulkUnhide}
            onExport={handleExport}
          />
        }
      >
        <QuestionListView
          questions={filteredQuestions}
          selectedQuestions={selectedQuestions}
          onSelectQuestion={toggleSelectQuestion}
          onQuestionClick={handleQuestionClick}
        />
      </InboxLayout>

      {/* Question Detail Modal - Reuse from old dashboard */}
      {profile && (
        <QuestionDetailModal
          isOpen={showQuestionModal}
          onClose={handleCloseModal}
          question={selectedQuestion}
          userId={profile?.user?.id || profile?.id}
          onAnswerSubmitted={() => {
            refreshQuestions();
          }}
        />
      )}
    </DashboardLayout>
  );
}

export default ExpertInboxPage;