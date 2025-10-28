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
import { downloadQuestionsAsZip } from '@/utils/exportQuestions';

// Import modal for answering (reuse from old dashboard)
import QuestionDetailModal from '@/components/dashboard/QuestionDetailModal';

function ExpertInboxPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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
    filteredCount, // After client-side search filter
  } = useInbox(questions);

  // Use server-side pagination total as the true total count
  const totalCount = pagination?.total || questions.length;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.sortBy, filters.priceMin, filters.priceMax, filters.searchQuery]);

  // Load data with server-side filtering
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Build query params for server-side filtering
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('per_page', 10);

        // Map status filter to filter_type
        if (filters.status === 'pending') {
          params.append('filter_type', 'pending');
        } else if (filters.status === 'answered') {
          params.append('filter_type', 'answered');
        } else {
          params.append('filter_type', 'all');
        }

        // Add sort
        params.append('sort_by', filters.sortBy || 'time_left');

        // Add price range if not default
        if (filters.priceMin > 0) {
          params.append('price_min', filters.priceMin);
        }
        if (filters.priceMax < 10000) {
          params.append('price_max', filters.priceMax);
        }

        // Add search query
        if (filters.searchQuery && filters.searchQuery.trim()) {
          params.append('search', filters.searchQuery.trim());
        }

        const [profileRes, questionsRes] = await Promise.all([
          apiClient.get('/me/profile'),
          apiClient.get(`/me/questions?${params.toString()}`),
        ]);

        setProfile(profileRes.data.expert_profile || {});
        // Handle new paginated response format
        setQuestions(questionsRes.data?.questions || questionsRes.data || []);
        setPagination(questionsRes.data?.pagination || null);
      } catch (err) {
        console.error('Failed to load inbox data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, filters.status, filters.sortBy, filters.priceMin, filters.priceMax, filters.searchQuery]);

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
      // Build query params for server-side filtering
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('per_page', 10);

      // Map status filter to filter_type
      if (filters.status === 'pending') {
        params.append('filter_type', 'pending');
      } else if (filters.status === 'answered') {
        params.append('filter_type', 'answered');
      } else {
        params.append('filter_type', 'all');
      }

      // Add sort
      params.append('sort_by', filters.sortBy || 'time_left');

      // Add price range if not default
      if (filters.priceMin > 0) {
        params.append('price_min', filters.priceMin);
      }
      if (filters.priceMax < 10000) {
        params.append('price_max', filters.priceMax);
      }

      // Add search query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        params.append('search', filters.searchQuery.trim());
      }

      const response = await apiClient.get(`/me/questions?${params.toString()}`);
      // Handle new paginated response format
      setQuestions(response.data?.questions || response.data || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      console.error('Failed to refresh questions:', err);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination?.has_next) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (pagination?.has_prev) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleExport = async () => {
    if (selectedQuestions.length === 0) {
      alert('No questions selected');
      return;
    }

    const selectedQs = questions.filter(q => selectedQuestions.includes(q.id));

    try {
      // Export questions as ZIP files
      await downloadQuestionsAsZip(selectedQs, (current, total) => {
        console.log(`📦 Progress: ${current}/${total}`);
      });

      alert(`Exported ${selectedQs.length} question(s) as ZIP`);
    } catch (err) {
      console.error('Failed to export questions:', err);
      alert('Failed to export questions. Please try again.');
    }
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

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      clearSelection();
    } else {
      selectAll();
    }
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
        searchData={{ questions }}
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
              onSelectAll={handleSelectAll}
            />
          }
          pagination={
            pagination && pagination.total_pages > 1 ? (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">{((pagination.page - 1) * 10) + 1}-{Math.min(pagination.page * 10, pagination.total)}</span>
                  {' '}of{' '}
                  <span className="font-semibold">{pagination.total}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={!pagination.has_prev}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      const totalPages = pagination.total_pages;
                      const currentPage = pagination.page;

                      if (totalPages <= maxVisible) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (currentPage <= 3) {
                          pages.push(1, 2, 3, 4, '...', totalPages);
                        } else if (currentPage >= totalPages - 2) {
                          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                        } else {
                          pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                        }
                      }

                      return pages.map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-2 text-gray-400 text-xs">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
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
                      ));
                    })()}
                  </div>

                  {/* Mobile: Just show current page */}
                  <div className="sm:hidden text-xs font-medium text-gray-700">
                    Page {pagination.page} of {pagination.total_pages}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.has_next}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : null
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