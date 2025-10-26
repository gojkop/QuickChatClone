import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '@/api';
import DashboardLayout from '@/components/dashboardv2/layout/DashboardLayout';
import PanelContainer from '@/components/dashboardv2/inbox/PanelContainer';
import QuestionFilters from '@/components/dashboardv2/inbox/QuestionFilters';
import QuickActions from '@/components/dashboardv2/inbox/QuickActions';
import QuestionListView from '@/components/dashboardv2/inbox/QuestionListView';
import VirtualQuestionTable from '@/components/dashboardv2/inbox/VirtualQuestionTable';
import QuestionDetailPanel from '@/components/dashboardv2/inbox/QuestionDetailPanel';
import AnswerComposerPanel from '@/components/dashboardv2/inbox/AnswerComposerPanel';
import BottomSheet from '@/components/dashboardv2/inbox/BottomSheet';
import KeyboardShortcutsModal from '@/components/dashboardv2/inbox/KeyboardShortcutsModal';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonTable } from '@/components/common/Skeleton';
import { ToastContainer } from '@/components/common/Toast';
import { useInbox } from '@/hooks/dashboardv2/useInbox';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';
import { usePanelStack } from '@/hooks/dashboardv2/usePanelStack';
import { useURLSync } from '@/hooks/dashboardv2/useURLSync';
import { useKeyboardShortcuts } from '@/hooks/dashboardv2/useKeyboardShortcuts';
import { useBulkSelect } from '@/hooks/dashboardv2/useBulkSelect';
import { usePinnedQuestions } from '@/hooks/dashboardv2/usePinnedQuestions';
import { useUndoStack } from '@/hooks/useUndoStack';
import { useToast } from '@/components/common/Toast';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { copyToClipboard, getQuestionLink } from '@/utils/clipboard';
import { announceToScreenReader } from '@/utils/accessibility';

function ExpertInboxPageV2() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);


  const metrics = useMetrics(questions);
  const {
    filters,
    updateFilter,
    filteredQuestions: baseFilteredQuestions,
    selectedQuestions: legacySelected,
    toggleSelectQuestion: legacyToggle,
    selectAll: legacySelectAll,
    clearSelection: legacyClear,
    filteredCount,
  } = useInbox(questions);

  // New Phase 3 hooks
  const { toasts, showToast, hideToast, success, error, info } = useToast();
  const { pinnedIds, togglePin, isPinned, sortWithPinned } = usePinnedQuestions();
  const { undoStack, pushUndo, executeUndo } = useUndoStack();
  const { 
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectedCount
  } = useBulkSelect(baseFilteredQuestions);

  // Panel stack management
  const {
    panels,
    openPanel,
    closePanel,
    closeTopPanel,
    closeAllPanels,
    isPanelOpen,
    getPanelData,
    updatePanelData,
    screenWidth
  } = usePanelStack();

  const totalCount = pagination?.total || questions.length;
  const isMobile = screenWidth < 768;

  // Sort questions with pinned ones first
  const filteredQuestions = sortWithPinned(baseFilteredQuestions);

  // URL synchronization
  const { syncURL } = useURLSync({
    questions,
    openPanel,
    closePanel,
    closeAllPanels,
    isPanelOpen,
    getPanelData
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    questions: filteredQuestions,
    activeQuestionId: getPanelData('detail')?.id,
    onQuestionClick: (question) => {
      openPanel('detail', question);
      announceToScreenReader(`Opened question ${question.id}`);
    },
    onAnswer: () => {
      const detailPanel = getPanelData('detail');
      if (detailPanel) {
        openPanel('answer', detailPanel);
        announceToScreenReader('Opening answer composer');
      }
    },
    closeTopPanel: () => {
      closeTopPanel();
      announceToScreenReader('Panel closed');
    },
    closeAllPanels: () => {
      closeAllPanels();
      announceToScreenReader('All panels closed');
    },
    enabled: !isMobile
  });

  // Override keyboard handler to add help modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }

      // Copy link shortcut
      if (e.key === 'c' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        const detailPanel = getPanelData('detail');
        if (detailPanel) {
          e.preventDefault();
          handleCopyLink(detailPanel.id);
        }
      }

      // Pin shortcut
      if (e.key === 'p' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        const detailPanel = getPanelData('detail');
        if (detailPanel) {
          e.preventDefault();
          handleTogglePin(detailPanel.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [getPanelData]);

  // Mobile swipe gesture
  useSwipeGesture(
    () => {
      // Swipe right - go back
      if (isPanelOpen('answer')) {
        closePanel('answer');
      } else if (isPanelOpen('detail')) {
        closePanel('detail');
      }
    },
    null, // No left swipe action
    { enabled: isMobile }
  );

  // Enable virtualization for large lists
  useEffect(() => {
    setUseVirtualization(filteredQuestions.length > 50);
  }, [filteredQuestions.length]);

  // Helper function to enrich questions with media data
  const enrichQuestionsWithMedia = async (questions) => {
    if (!questions || questions.length === 0) return questions;

    // Collect all unique media_asset_ids (filter out 0, null, undefined)
    const mediaAssetIds = [...new Set(
      questions
        .map(q => q.media_asset_id)
        .filter(id => id != null && id !== undefined && id !== 0 && id > 0)
    )];

    if (mediaAssetIds.length === 0) {
      return questions;
    }

    console.log(`📊 Fetching ${mediaAssetIds.length} valid media assets`);

    // Fetch all media assets in parallel
    const mediaAssetPromises = mediaAssetIds.map(id =>
      apiClient.get(`/media_asset/${id}`)
        .then(res => res.data)
        .catch(err => {
          console.warn(`Failed to fetch media_asset ${id}:`, err.message);
          return null;
        })
    );

    const mediaAssets = await Promise.all(mediaAssetPromises);

    // Create a Map for O(1) lookup
    const mediaAssetMap = new Map(
      mediaAssets
        .filter(asset => asset !== null)
        .map(asset => [asset.id, asset])
    );

    console.log(`✅ Fetched ${mediaAssetMap.size}/${mediaAssetIds.length} media assets`);

    // Enrich questions with recording_segments
    return questions.map((question) => {
      // Skip if already has recording_segments
      if (question.recording_segments && question.recording_segments.length > 0) {
        return question;
      }

      // Parse attachments safely
      let cleanedAttachments = null;
      if (question.attachments) {
        try {
          cleanedAttachments = typeof question.attachments === 'string'
            ? JSON.parse(question.attachments)
            : question.attachments;
        } catch (e) {
          console.error(`Invalid attachments JSON for question ${question.id}:`, e.message);
          cleanedAttachments = null;
        }
      }

      // Get media asset from map
      let recordingSegments = [];

      if (question.media_asset_id) {
        const mediaAsset = mediaAssetMap.get(question.media_asset_id);

        if (mediaAsset) {
          // Parse metadata if it's a string
          let metadata = mediaAsset.metadata;
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata);
            } catch (e) {
              console.error(`Failed to parse metadata for media_asset ${question.media_asset_id}:`, e);
              metadata = null;
            }
          }

          // Transform media_asset into recording_segments format
          if (metadata?.type === 'multi-segment' && metadata?.segments) {
            recordingSegments = metadata.segments.map(seg => ({
              id: seg.uid,
              url: seg.playback_url,
              duration_sec: seg.duration,
              segment_index: seg.segment_index,
              metadata: { mode: seg.mode },
              provider: 'cloudflare_stream',
              asset_id: seg.uid
            }));
          } else {
            // Single media file (legacy format)
            recordingSegments = [{
              id: mediaAsset.id,
              url: mediaAsset.url,
              duration_sec: mediaAsset.duration_sec,
              segment_index: 0,
              metadata: metadata,
              provider: mediaAsset.provider,
              asset_id: mediaAsset.asset_id
            }];
          }
        } else {
          console.warn(`Media asset ${question.media_asset_id} not found for question ${question.id}`);
        }
      }

      return {
        ...question,
        attachments: cleanedAttachments,
        recording_segments: recordingSegments  // Always set, even if empty array
      };
    });
  };

  // Load data
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

        // Enrich questions with media data
        const rawQuestions = questionsRes.data?.questions || questionsRes.data || [];
        const enrichedQuestions = await enrichQuestionsWithMedia(rawQuestions);

        setQuestions(enrichedQuestions);
        setPagination(questionsRes.data?.pagination || null);
      } catch (err) {
        console.error('Failed to load inbox data:', err);
        error('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, filters.status, filters.sortBy, filters.priceMin, filters.priceMax, filters.searchQuery]);

  // Sync URL when panels change
  useEffect(() => {
    const detailPanel = getPanelData('detail');
    const isAnswering = isPanelOpen('answer');
    syncURL(detailPanel?.id, isAnswering);
  }, [panels, syncURL, getPanelData, isPanelOpen]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.sortBy, filters.priceMin, filters.priceMax, filters.searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // ? - Show shortcuts modal
      if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardHelp(true);
        return;
      }

      // j/k navigation only when detail panel is NOT open
      if (!isPanelOpen('detail')) {
        if (e.key === 'j') {
          e.preventDefault();
          setSelectedQuestionIndex(prev => Math.min(prev + 1, filteredQuestions.length - 1));
          return;
        }
        if (e.key === 'k') {
          e.preventDefault();
          setSelectedQuestionIndex(prev => Math.max(prev - 1, 0));
          return;
        }
        if (e.key === 'Enter' && filteredQuestions[selectedQuestionIndex]) {
          e.preventDefault();
          handleQuestionClick(filteredQuestions[selectedQuestionIndex]);
          return;
        }
      }

      // a - Answer question (only when detail panel is open)
      if (e.key === 'a' && isPanelOpen('detail')) {
        e.preventDefault();
        handleAnswerQuestion();
        return;
      }

      // p - Pin/unpin current question
      if (e.key === 'p') {
        e.preventDefault();
        const currentQuestion = isPanelOpen('detail')
          ? getPanelData('detail')
          : filteredQuestions[selectedQuestionIndex];
        if (currentQuestion) {
          togglePin(currentQuestion.id);
          success(isPinned(currentQuestion.id) ? 'Question unpinned' : 'Question pinned');
        }
        return;
      }

      // c - Copy question link
      if (e.key === 'c' && isPanelOpen('detail')) {
        e.preventDefault();
        const detailPanel = getPanelData('detail');
        if (detailPanel) {
          copyQuestionLink(detailPanel.id).then(() => {
            success('Question link copied to clipboard');
          });
        }
        return;
      }

      // Esc - Close top panel
      if (e.key === 'Escape') {
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
          return;
        }
        if (e.shiftKey) {
          e.preventDefault();
          closeAllPanels();
        } else if (panels.length > 1) {
          e.preventDefault();
          closeTopPanel();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredQuestions, selectedQuestionIndex, isPanelOpen, getPanelData, togglePin, isPinned, success, closeTopPanel, closeAllPanels, panels, showKeyboardHelp]);

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
      error('Failed to refresh questions');
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

  // Bulk actions with undo
  const handleBulkHide = async () => {
    if (selectedIds.length === 0) return;

    try {
      const idsToHide = [...selectedIds];

      await Promise.all(
        idsToHide.map(id =>
          apiClient.post('/question/hidden', {
            question_id: id,
            hidden: true
          })
        )
      );

      const undoId = pushUndo({
        description: `Hidden ${idsToHide.length} question(s)`,
        undo: async () => {
          await Promise.all(
            idsToHide.map(id =>
              apiClient.post('/question/hidden', {
                question_id: id,
                hidden: false
              })
            )
          );
          await refreshQuestions();
          success('Questions restored');
        }
      });

      await refreshQuestions();
      clearSelection();

      success(`Hidden ${idsToHide.length} question(s)`, {
        action: {
          label: 'Undo',
          onClick: () => executeUndo(undoId)
        },
        duration: 10000
      });

      announceToScreenReader(`Hidden ${idsToHide.length} questions. Press undo to restore.`);
    } catch (err) {
      console.error('Failed to hide questions:', err);
      error('Failed to hide questions');
    }
  };

  const handleBulkUnhide = async () => {
    if (selectedIds.length === 0) return;

    try {
      const idsToUnhide = [...selectedIds];

      await Promise.all(
        idsToUnhide.map(id =>
          apiClient.post('/question/hidden', {
            question_id: id,
            hidden: false
          })
        )
      );

      const undoId = pushUndo({
        description: `Unhidden ${idsToUnhide.length} question(s)`,
        undo: async () => {
          await Promise.all(
            idsToUnhide.map(id =>
              apiClient.post('/question/hidden', {
                question_id: id,
                hidden: true
              })
            )
          );
          await refreshQuestions();
          success('Questions hidden again');
        }
      });

      await refreshQuestions();
      clearSelection();

      success(`Unhidden ${idsToUnhide.length} question(s)`, {
        action: {
          label: 'Undo',
          onClick: () => executeUndo(undoId)
        },
        duration: 10000
      });

      announceToScreenReader(`Unhidden ${idsToUnhide.length} questions.`);
    } catch (err) {
      console.error('Failed to unhide questions:', err);
      error('Failed to unhide questions');
    }
  };

  const handleExport = () => {
    const selectedQs = questions.filter(q => selectedIds.includes(q.id));

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

    success(`Exported ${selectedIds.length} questions`);
    announceToScreenReader(`Exported ${selectedIds.length} questions to CSV`);
  };

  const handleQuestionClick = (question, event) => {
    toggleSelect(question.id, event);
  };

  const handleQuestionOpen = (question) => {
    openPanel('detail', question);
    announceToScreenReader(`Opened question ${question.id}`);
  };

  const handleAnswerQuestion = () => {
    const detailPanel = getPanelData('detail');
    if (detailPanel) {
      openPanel('answer', detailPanel);
      announceToScreenReader('Opening answer composer');
    }
  };

  const handleAnswerSubmitted = async () => {
    await refreshQuestions();
    closePanel('answer');
    closePanel('detail');
    success('Answer submitted successfully!');
    announceToScreenReader('Answer submitted successfully');
  };

  const handleAvailabilityChange = (newStatus) => {
    setProfile(prev => ({ ...prev, accepting_questions: newStatus }));
    info(newStatus ? 'Now accepting questions' : 'Paused accepting questions');
  };

  const handleSelectAll = () => {
    if (selectedCount === filteredQuestions.length) {
      clearSelection();
      announceToScreenReader('Selection cleared');
    } else {
      selectAll();
      announceToScreenReader(`Selected all ${filteredQuestions.length} questions`);
    }
  };

  // Copy question link
  const handleCopyLink = async (questionId) => {
    const link = getQuestionLink(questionId);
    const copied = await copyToClipboard(link);
    
    if (copied) {
      success('Link copied to clipboard');
      announceToScreenReader('Question link copied');
    } else {
      error('Failed to copy link');
    }
  };

  // Pin/unpin question
  const handleTogglePin = (questionId) => {
    togglePin(questionId);
    const pinned = !isPinned(questionId);
    
    if (pinned) {
      success('Question pinned');
      announceToScreenReader('Question pinned to top');
    } else {
      info('Question unpinned');
      announceToScreenReader('Question unpinned');
    }
  };

  // Render question list (virtualized or standard)
  const renderQuestionList = () => {
    if (filteredQuestions.length === 0) {
      return (
        <EmptyState
          icon={filters.searchQuery ? 'search' : filters.status !== 'all' ? 'filter' : 'inbox'}
          title={filters.searchQuery ? 'No matching questions' : filters.status !== 'all' ? 'No questions in this filter' : 'No questions yet'}
          description={filters.searchQuery ? 'Try adjusting your search terms' : filters.status !== 'all' ? 'Try changing your filters' : 'Questions will appear here when customers ask them'}
        />
      );
    }

    const ListComponent = useVirtualization ? VirtualQuestionTable : QuestionListView;

    return (
      <ListComponent
        questions={filteredQuestions}
        selectedQuestions={selectedIds}
        activeQuestionId={getPanelData('detail')?.id}
        onSelectQuestion={handleQuestionClick}
        onQuestionClick={handleQuestionOpen}
        onSelectAll={handleSelectAll}
        pinnedIds={pinnedIds}
        onTogglePin={handleTogglePin}
        onCopyLink={handleCopyLink}
        isPinned={isPinned}
      />
    );
  };

  // Render panel content
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
            {selectedCount > 0 && (
              <div className="flex-shrink-0 p-3 bg-white border-b border-gray-200">
                <QuickActions
                  selectedCount={selectedCount}
                  selectedQuestions={questions.filter(q => selectedIds.includes(q.id))}
                  onClearSelection={clearSelection}
                  onBulkHide={handleBulkHide}
                  onBulkUnhide={handleBulkUnhide}
                  onExport={handleExport}
                />
              </div>
            )}

            {/* Question List */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {isLoading ? <SkeletonTable rows={10} /> : renderQuestionList()}
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
                      {/* Pagination numbers - same as before */}
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

            {/* Keyboard Shortcuts Hint */}
            <div className="hidden lg:block absolute bottom-4 left-4">
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200 hover:bg-white transition-colors"
              >
                <p className="text-xs text-gray-600">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">?</kbd>
                  {' '}Keyboard shortcuts
                </p>
              </button>
            </div>
          </div>
        );

      case 'detail':
        return (
          <QuestionDetailPanel
            question={panel.data}
            onClose={() => closePanel('detail')}
            onAnswer={handleAnswerQuestion}
            onCopyLink={() => handleCopyLink(panel.data.id)}
            onTogglePin={() => handleTogglePin(panel.data.id)}
            isPinned={isPinned(panel.data.id)}
            isMobile={screenWidth < 1024}
            hideCloseButton={true}
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

  if (isLoading && questions.length === 0) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Inbox' }
        ]}
      >
        <div className="p-8">
          <SkeletonTable rows={10} />
        </div>
      </DashboardLayout>
    );
  }

  // Mobile: Use bottom sheet for answer composer
  if (isMobile && isPanelOpen('answer')) {
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
            panels={panels.filter(p => p.type !== 'answer')}
            onClosePanel={closePanel}
            onCloseTopPanel={closeTopPanel}
            renderPanel={renderPanel}
          />

          <BottomSheet
            isOpen={isPanelOpen('answer')}
            onClose={() => closePanel('answer')}
            title="Answer Question"
            snapPoints={[0.3, 0.6, 0.95]}
            defaultSnap={2}
          >
            <AnswerComposerPanel
              question={getPanelData('answer')}
              profile={profile}
              onClose={() => closePanel('answer')}
              onAnswerSubmitted={handleAnswerSubmitted}
            />
          </BottomSheet>
        </div>

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} onClose={hideToast} />

        {/* Keyboard shortcuts modal */}
        <KeyboardShortcutsModal
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
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

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={hideToast} />

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </DashboardLayout>
  );
}

export default ExpertInboxPageV2;