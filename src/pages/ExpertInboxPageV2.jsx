// src/pages/ExpertInboxPageV2.jsx
// Updated inbox page with cascading panel layout (Linear-style)

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '@/api';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import PanelContainer from '@/components/dashboardv2/inbox/PanelContainer';
import QuestionFilters from '@/components/dashboardv2/inbox/QuestionFilters';
import QuickActions from '@/components/dashboardv2/inbox/QuickActions';
import QuestionListView from '@/components/dashboardv2/inbox/QuestionListView';
import QuestionDetailPanel from '@/components/dashboardv2/inbox/QuestionDetailPanel';
import AnswerComposerPanel from '@/components/dashboardv2/inbox/AnswerComposerPanel';
import LoadingState from '@/components/dashboardv2/shared/LoadingState';
import { useInbox } from '@/hooks/dashboardv2/useInbox';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';
import { usePanelStack } from '@/hooks/dashboardv2/usePanelStack';

function ExpertInboxPageV2() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const metrics = useMetrics(questions);
  const {
    filters,
    updateFilter,
    filteredQuestions,
    selectedQuestions,
    toggleSelectQuestion,
    selectAll,
    clearSelection,
    filteredCount,
  } = useInbox(questions);

  // Panel stack management
  const {
    panels,
    openPanel,
    closePanel,
    closeTopPanel,
    closeAllPanels,
    isPanelOpen,
    getPanelData,
    screenWidth
  } = usePanelStack();

  const totalCount = pagination?.total || questions.length;

  // Load data with server-side filtering
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('per_page', 10);

        if (filters.status === 'pending') {
          params.append('filter_type', 'pending');
        } else if (filters.status === 'answered') {
          params.append('filter_type', 'answered');
        } else {
          params.append('filter_type', 'all');
        }

        params.append('sort_by', filters.sortBy || 'time_left');

        if (filters.priceMin > 0) {
          params.append('price_min', filters.priceMin);
        }
        if (filters.priceMax < 10000) {
          params.append('price_max', filters.priceMax);
        }

        if (filters.searchQuery && filters.searchQuery.trim()) {
          params.append('search', filters.searchQuery.trim());
        }

        const [profileRes, questionsRes] = await Promise.all([
          apiClient.get('/me/profile'),
          apiClient.get(`/me/questions?${params.toString()}`),
        ]);

        setProfile(profileRes.data.expert_profile || {});
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
          // Open detail panel with question data
          openPanel('detail', question);
        }
      }
    } else if (hash === '') {
      // Close all panels when navigating back to list
      closeAllPanels();
    }
  }, [location.hash, questions]);

  // Sync URL when panels change
  useEffect(() => {
    const detailPanel = getPanelData('detail');

    if (detailPanel && detailPanel.id) {
      const expectedHash = `#question-${detailPanel.id}`;
      if (location.hash !== expectedHash) {
        navigate(`/dashboard/inbox${expectedHash}`, { replace: true });
      }
    } else if (!isPanelOpen('detail') && location.hash.startsWith('#question-')) {
      navigate('/dashboard/inbox', { replace: true });
    }
  }, [panels, navigate, location.hash, getPanelData, isPanelOpen]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.sortBy, filters.priceMin, filters.priceMax, filters.searchQuery]);

  // Refresh questions
  const refreshQuestions = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('per_page', 10);

      if (filters.status === 'pending') {
        params.append('filter_type', 'pending');
      } else if (filters.status === 'answered') {
        params.append('filter_type', 'answered');
      } else {
        params.append('filter_type', 'all');
      }

      params.append('sort_by', filters.sortBy || 'time_left');

      if (filters.priceMin > 0) {
        params.append('price_min', filters.priceMin);
      }
      if (filters.priceMax < 10000) {
        params.append('price_max', filters.priceMax);
      }

      if (filters.searchQuery && filters.searchQuery.trim()) {
        params.append('search', filters.searchQuery.trim());
      }

      const response = await apiClient.get(`/me/questions?${params.toString()}`);
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
    openPanel('detail', question);
  };

  const handleAnswerQuestion = () => {
    const detailPanel = getPanelData('detail');
    if (detailPanel) {
      openPanel('answer', detailPanel);
    }
  };

  const handleAnswerSubmitted = () => {
    refreshQuestions();
    closePanel('answer');
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

  // Render panel content based on type
  const renderPanel = (panel) => {
    switch (panel.type) {
      case 'list':
        return (
          <div className="h-full flex flex-col overflow-hidden bg-gray-50">
            {/* Filters */}
            <div className="flex-shrink-0 overflow-y-auto border-b border-gray-200 bg-white max-h-[30vh] lg:max-h-[35vh]">
              <QuestionFilters
                filters={filters}
                onFilterChange={updateFilter}
                filteredCount={filteredCount}
                totalCount={totalCount}
              />
            </div>

            {/* Quick Actions */}
            {selectedQuestions.length > 0 && (
              <div className="flex-shrink-0 p-3 bg-white border-b border-gray-200">
                <QuickActions
                  selectedCount={selectedQuestions.length}
                  onClearSelection={clearSelection}
                  onBulkHide={handleBulkHide}
                  onExport={handleExport}
                />
              </div>
            )}

            {/* Question List */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <QuestionListView
                questions={filteredQuestions}
                selectedQuestions={selectedQuestions}
                activeQuestionId={getPanelData('detail')?.id}
                onSelectQuestion={toggleSelectQuestion}
                onQuestionClick={handleQuestionClick}
                onSelectAll={handleSelectAll}
              />
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex-shrink-0 bg-white relative z-20">
                <div className="flex items-center justify-between px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
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
              </div>
            )}
          </div>
        );

      case 'detail':
        return (
          <QuestionDetailPanel
            question={panel.data}
            onClose={() => closePanel('detail')}
            onAnswer={handleAnswerQuestion}
            isMobile={screenWidth < 1024}
          />
        );

      case 'answer':
        return (
          <AnswerComposerPanel
            question={panel.data}
            profile={profile}
            onClose={() => closePanel('answer')}
            onAnswerSubmitted={handleAnswerSubmitted}
          />
        );

      default:
        return null;
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
      <div className="w-full h-[calc(100vh-4rem)]">
        <PanelContainer
          panels={panels}
          onClosePanel={closePanel}
          onCloseTopPanel={closeTopPanel}
          renderPanel={renderPanel}
        />
      </div>
    </DashboardLayout>
  );
}

export default ExpertInboxPageV2;