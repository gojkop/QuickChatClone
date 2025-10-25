import { useState, useEffect, useMemo } from 'react';

export function useSearch(data = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardv2_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search function with fuzzy matching
  const fuzzyMatch = (text, query) => {
    if (!text || !query) return false;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match or includes
    if (textLower.includes(queryLower)) return true;
    
    // Fuzzy match: check if all query characters appear in order
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === queryLower.length;
  };

  // Search through questions
  const searchQuestions = (questions, query) => {
    if (!query.trim()) return [];
    
    return questions
      .filter(q => 
        fuzzyMatch(q.question_text, query) ||
        fuzzyMatch(q.question_details, query) ||
        fuzzyMatch(q.user_name, query) ||
        fuzzyMatch(q.user_email, query)
      )
      .slice(0, 5)
      .map(q => ({
        type: 'question',
        id: q.id,
        title: q.question_text || 'Untitled Question',
        subtitle: q.user_name || 'Anonymous',
        action: `/dashboard/inbox#question-${q.id}`,
        icon: 'message',
        metadata: {
          price: q.price_cents,
          status: q.status,
          answered: q.answered_at ? true : false,
        }
      }));
  };

  // Search through navigation/settings
  const searchNavigation = (query) => {
    if (!query.trim()) return [];

    const navItems = [
      { title: 'Dashboard', subtitle: 'Overview and metrics', action: '/dashboard', icon: 'home' },
      { title: 'Inbox', subtitle: 'Manage questions', action: '/dashboard/inbox', icon: 'inbox' },
      { title: 'Analytics', subtitle: 'Performance insights', action: '/dashboard/analytics', icon: 'chart' },
      { title: 'Marketing', subtitle: 'Campaigns and growth', action: '/expert/marketing', icon: 'megaphone' },
      { title: 'Profile Settings', subtitle: 'Edit your profile', action: '/expert#profile-settings', icon: 'user' },
      { title: 'Account Settings', subtitle: 'Account preferences', action: '/expert#account-settings', icon: 'settings' },
      { title: 'Help & FAQ', subtitle: 'Get support', action: '/faq', icon: 'help' },
    ];

    return navItems
      .filter(item => 
        fuzzyMatch(item.title, query) || 
        fuzzyMatch(item.subtitle, query)
      )
      .slice(0, 3)
      .map(item => ({
        type: 'navigation',
        ...item
      }));
  };

  // Quick actions
  const searchActions = (query) => {
    if (!query.trim()) return [];

    const actions = [
      { title: 'Toggle Availability', subtitle: 'Change your online status', action: 'toggle-availability', icon: 'toggle' },
      { title: 'Export Questions', subtitle: 'Download as CSV', action: 'export-questions', icon: 'download' },
      { title: 'View Public Profile', subtitle: 'See how others see you', action: 'view-profile', icon: 'eye' },
      { title: 'Copy Profile Link', subtitle: 'Share your profile', action: 'copy-link', icon: 'link' },
    ];

    return actions
      .filter(action => 
        fuzzyMatch(action.title, query) || 
        fuzzyMatch(action.subtitle, query)
      )
      .slice(0, 2)
      .map(action => ({
        type: 'action',
        ...action
      }));
  };

  // Combined search results
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return {
        questions: [],
        navigation: [],
        actions: [],
        total: 0
      };
    }

    const questions = searchQuestions(data.questions || [], debouncedQuery);
    const navigation = searchNavigation(debouncedQuery);
    const actions = searchActions(debouncedQuery);

    return {
      questions,
      navigation,
      actions,
      total: questions.length + navigation.length + actions.length
    };
  }, [debouncedQuery, data.questions]);

  // All results flattened for keyboard navigation
  const allResults = useMemo(() => {
    return [
      ...searchResults.questions,
      ...searchResults.navigation,
      ...searchResults.actions
    ];
  }, [searchResults]);

  // Add to recent searches
  const addRecentSearch = (query) => {
    if (!query.trim()) return;
    
    const updated = [
      query,
      ...recentSearches.filter(s => s !== query)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('dashboardv2_recent_searches', JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('dashboardv2_recent_searches');
  };

  // Keyboard navigation
  const moveSelection = (direction) => {
    if (allResults.length === 0) return;
    
    setSelectedIndex(prev => {
      if (direction === 'down') {
        return prev < allResults.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : allResults.length - 1;
      }
    });
  };

  const getSelectedResult = () => {
    return allResults[selectedIndex];
  };

  // Reset on close
  const close = () => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  return {
    searchQuery,
    setSearchQuery,
    isOpen,
    setIsOpen,
    close,
    searchResults,
    allResults,
    selectedIndex,
    moveSelection,
    getSelectedResult,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}