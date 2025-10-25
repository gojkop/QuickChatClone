import { useState, useMemo } from 'react';

export function useInbox(questions = []) {
  const [filters, setFilters] = useState({
    status: 'pending', // 'pending', 'answered', 'all'
    priceMin: 0,
    priceMax: 10000,
    slaFilter: 'all', // 'all', 'urgent', 'normal'
    questionType: 'all', // 'all', 'quick', 'deep_dive'
    searchQuery: '',
    sortBy: 'time_left', // 'time_left', 'price_high', 'price_low', 'date_new', 'date_old'
    showHidden: false,
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Calculate remaining time for SLA
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

  // Filter questions
  const filteredQuestions = useMemo(() => {
    let filtered = [...questions];

    // Always exclude pending offers
    filtered = filtered.filter(q => q.pricing_status !== 'offer_pending');

    // Status filter
    if (filters.status === 'pending') {
      filtered = filtered.filter(q => {
        const isUnanswered = q.status === 'paid' && !q.answered_at;
        const isNotDeclined = q.pricing_status !== 'offer_declined' && q.status !== 'declined';
        const isNotHidden = filters.showHidden || !q.hidden;
        return isUnanswered && isNotDeclined && isNotHidden;
      });
    } else if (filters.status === 'answered') {
      filtered = filtered.filter(q => 
        q.status === 'closed' || q.status === 'answered' || q.answered_at
      );
    } else if (filters.status === 'all') {
      if (!filters.showHidden) {
        filtered = filtered.filter(q => !q.hidden);
      }
    }

    // Price filter
    filtered = filtered.filter(q => {
      const priceUsd = (q.price_cents || 0) / 100;
      return priceUsd >= filters.priceMin && priceUsd <= filters.priceMax;
    });

    // SLA filter
    if (filters.slaFilter === 'urgent') {
      filtered = filtered.filter(q => {
        const remaining = getRemainingTime(q);
        return remaining < 12 * 3600 && remaining > 0;
      });
    }

    // Question type filter
    if (filters.questionType === 'quick') {
      filtered = filtered.filter(q => q.pricing_tier === 'tier1' || !q.pricing_tier);
    } else if (filters.questionType === 'deep_dive') {
      filtered = filtered.filter(q => q.pricing_tier === 'tier2');
    }

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        (q.question_text || '').toLowerCase().includes(query) ||
        (q.user_name || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [questions, filters]);

  // Sort questions
  const sortedQuestions = useMemo(() => {
    const sorted = [...filteredQuestions];

    switch (filters.sortBy) {
      case 'time_left':
        return sorted.sort((a, b) => {
          const isPendingA = a.status === 'paid' && !a.answered_at;
          const isPendingB = b.status === 'paid' && !b.answered_at;
          
          if (isPendingA && isPendingB) {
            return getRemainingTime(a) - getRemainingTime(b);
          }
          return 0;
        });
      
      case 'price_high':
        return sorted.sort((a, b) => (b.price_cents || 0) - (a.price_cents || 0));
      
      case 'price_low':
        return sorted.sort((a, b) => (a.price_cents || 0) - (b.price_cents || 0));
      
      case 'date_new':
        return sorted.sort((a, b) => b.created_at - a.created_at);
      
      case 'date_old':
        return sorted.sort((a, b) => a.created_at - b.created_at);
      
      default:
        return sorted;
    }
  }, [filteredQuestions, filters.sortBy]);

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
    filteredQuestions: sortedQuestions,
    selectedQuestions,
    toggleSelectQuestion,
    selectAll,
    clearSelection,
    totalCount: questions.length,
    filteredCount: sortedQuestions.length,
  };
}