import { useState, useMemo } from 'react';

/**
 * Simplified useInbox hook - Now only handles client-side search filtering
 * Server-side filtering handles: status, price range, sorting
 * Client-side filtering handles: search query (complex to do server-side)
 */
export function useInbox(questions = []) {
  const [filters, setFilters] = useState({
    status: 'pending', // 'pending', 'answered', 'all' - HANDLED SERVER-SIDE
    priceMin: 0, // HANDLED SERVER-SIDE
    priceMax: 10000, // HANDLED SERVER-SIDE
    slaFilter: 'all', // 'all', 'urgent', 'normal' - CLIENT-SIDE ONLY (advanced filter)
    questionType: 'all', // 'all', 'quick', 'deep_dive' - CLIENT-SIDE ONLY (advanced filter)
    searchQuery: '', // CLIENT-SIDE ONLY
    sortBy: 'time_left', // HANDLED SERVER-SIDE
    showHidden: false, // CLIENT-SIDE ONLY
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Calculate remaining time for SLA (client-side helper)
  const getRemainingTime = (question) => {
    if (!question.sla_hours_snapshot || question.sla_hours_snapshot <= 0) {
      return Infinity;
    }

    const now = Date.now() / 1000;
    const createdAtSeconds = question.created_at > 4102444800
      ? question.created_at / 1000
      : question.created_at;

    const elapsed = now - createdAtSeconds;
    const slaSeconds = question.sla_hours_snapshot * 3600;
    const remaining = slaSeconds - elapsed;

    return remaining;
  };

  // CLIENT-SIDE ONLY: Apply advanced filters on top of server-filtered results
  // Note: Search is now handled server-side
  const filteredQuestions = useMemo(() => {
    let filtered = [...questions];

    // Advanced filters (client-side only - not critical for main flow)

    // SLA filter
    if (filters.slaFilter === 'urgent') {
      filtered = filtered.filter(q => {
        const remaining = getRemainingTime(q);
        return remaining < 12 * 3600 && remaining > 0;
      });
    }

    // Question type filter
    if (filters.questionType === 'quick') {
      filtered = filtered.filter(q => q.question_tier === 'tier1' || !q.question_tier);
    } else if (filters.questionType === 'deep_dive') {
      filtered = filtered.filter(q => q.question_tier === 'tier2');
    }

    // Show hidden toggle (client-side for 'all' tab)
    if (filters.status === 'all' && !filters.showHidden) {
      filtered = filtered.filter(q => !q.hidden);
    }

    return filtered;
  }, [questions, filters.slaFilter, filters.questionType, filters.showHidden, filters.status]);

  // Update filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Bulk select
  const toggleSelectQuestion = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAll = () => {
    setSelectedQuestions(sortedQuestions.map(q => q.id));
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  return {
    filters,
    updateFilter,
    filteredQuestions, // Already sorted and filtered by server, just has client-side search applied
    selectedQuestions,
    toggleSelectQuestion,
    selectAll,
    clearSelection,
    totalCount: questions.length, // This is server-filtered count (10 per page)
    filteredCount: filteredQuestions.length, // After client-side search filter
  };
}