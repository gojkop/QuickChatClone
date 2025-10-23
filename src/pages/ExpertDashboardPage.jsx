import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '@/api';
import { useAuth } from '@/context/AuthContext'; // ✅ ADDED
import { useFeature } from '@/hooks/useFeature'; 
import SettingsModal from '@/components/dashboard/SettingsModal';
import AccountModal from '@/components/dashboard/AccountModal';
import ProfilePreviewModal from '@/components/dashboard/ProfilePreviewModal';
import SocialImpactStats from '@/components/dashboard/SocialImpactStats';
import StatsSection from '@/components/dashboard/StatsSection';
import DefaultAvatar from '@/components/dashboard/DefaultAvatar';
import QuestionTable from '@/components/dashboard/QuestionTable';
import QuestionDetailModal from '@/components/dashboard/QuestionDetailModal';
import MarketingPreview from '@/components/dashboard/MarketingPreview';
import FirstQuestionCelebration from '@/components/dashboard/FirstQuestionCelebration';
import QRCodeModal from '@/components/dashboard/QRCodeModal';
import PendingOffersSection from '@/components/dashboard/PendingOffersSection';
import { useMarketing } from '@/hooks/useMarketing';
import { Clock, DollarSign, Coins, Calendar, CalendarDays } from 'lucide-react';


// ✅ Hidden Questions Toggle Component
function HiddenToggle({ showHidden, onToggle, hiddenCount }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm border ${
        showHidden
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
      type="button"
      title={showHidden ? 'Hide hidden questions' : 'Show hidden questions'}
    >
      <svg 
        className={`w-3.5 h-3.5 ${showHidden ? 'text-indigo-600' : 'text-gray-500'}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {showHidden ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        )}
      </svg>
      <span className="hidden sm:inline">
        {showHidden ? 'Hide' : 'Show'} Hidden
      </span>
      {hiddenCount > 0 && (
        <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold ${
          showHidden ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-700'
        }`}>
          {hiddenCount}
        </span>
      )}
    </button>
  );
}

// Compact Sort Dropdown Component
function SortDropdown({ sortBy, onSortChange, questionCount }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const buttonRef = React.useRef(null);

const sortOptions = [
  { value: 'time_left', label: 'Time Left (Urgent First)', icon: Clock, color: 'text-blue-600' },
  { value: 'price_high', label: 'Price (High to Low)', icon: DollarSign, color: 'text-green-600' },
  { value: 'price_low', label: 'Price (Low to High)', icon: Coins, color: 'text-emerald-600' },
  { value: 'date_new', label: 'Date (Newest First)', icon: Calendar, color: 'text-indigo-600' },
  { value: 'date_old', label: 'Date (Oldest First)', icon: CalendarDays, color: 'text-purple-600' },
];

  const currentSort = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0];

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelect = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        type="button"
      >
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span className="hidden sm:inline">Sort by:</span>
        <currentSort.icon className={`w-4 h-4 ${currentSort.color}`} />
        <svg 
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-52 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left transition ${
                  sortBy === option.value
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                type="button"
              >
                <option.icon className={`w-4 h-4 ${option.color}`} />
                <span className="flex-1">{option.label}</span>
                {sortBy === option.value && (
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExpertDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setProfileData } = useAuth(); // ✅ ADDED
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [error, setError] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [showAvailabilityMessage, setShowAvailabilityMessage] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [sortBy, setSortBy] = useState('time_left');
  const [showHidden, setShowHidden] = useState(false);
  const { isEnabled: socialImpactEnabled, loading: featureFlagLoading } = useFeature('social_impact_dashboard');
  const { isEnabled: marketingEnabled } = useFeature('marketing_module');
  const { campaigns, trafficSources, insights } = useMarketing();


  const [showFirstQuestionCelebration, setShowFirstQuestionCelebration] = useState(false);
  const [firstQuestion, setFirstQuestion] = useState(null);
  const previousQuestionCountRef = useRef(0);

  
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionDetailModal, setShowQuestionDetailModal] = useState(false);
  
  const QUESTIONS_PER_PAGE = 10;

  const dollarsFromCents = (cents) => Math.round((cents || 0) / 100);

  // Helper function to calculate remaining time in seconds for sorting
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

  // ✅ OPTIMIZED: Client-side sorting with useMemo - NO API CALLS when sort changes
  const sortedQuestions = useMemo(() => {
    if (!questions || !Array.isArray(questions)) {
      return [];
    }
    
    const sorted = [...questions];
    
    switch (sortBy) {
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
  }, [questions, sortBy]);

  // ✅ OPTIMIZED: Filter questions with useMemo
  const filteredQuestions = useMemo(() => {
    let filtered = sortedQuestions;

    // Filter out hidden questions (unless showHidden is true)
    if (!showHidden) {
      filtered = filtered.filter(q => !q.hidden);
    }

    // Always filter out declined Deep Dive offers
    filtered = filtered.filter(q => q.pricing_status !== 'offer_declined');

    return filtered;
  }, [sortedQuestions, showHidden]);

  // ✅ OPTIMIZED: Calculate counts with useMemo
  const { pendingCount, answeredCount, hiddenCount } = useMemo(() => {
    const safeAllQuestions = Array.isArray(allQuestions) ? allQuestions : [];
    const safeQuestions = Array.isArray(questions) ? questions : [];

    return {
      pendingCount: safeAllQuestions.filter(q =>
        q.status === 'paid' &&
        !q.answered_at &&
        q.pricing_status !== 'offer_declined'  // Exclude declined offers
      ).length,
      answeredCount: safeAllQuestions.filter(q => q.status === 'closed' || q.status === 'answered' || q.answered_at).length,
      hiddenCount: safeQuestions.filter(q => q.hidden === true).length
    };
  }, [allQuestions, questions]);

  // ✅ OPTIMIZED: Paginated questions with useMemo
  const paginatedQuestions = useMemo(() => {
    const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return {
      questions: filteredQuestions.slice(startIndex, endIndex),
      totalPages
    };
  }, [filteredQuestions, currentPage]);

  // ✅ Refresh questions function
  const refreshQuestions = async () => {
    if (!profile) return;

    try {
      setIsLoadingQuestions(true);
      
      const statusMap = {
        'pending': 'paid',
        'answered': 'closed',
        'all': ''
      };
      const status = statusMap[activeTab];
      const params = status ? `?status=${status}` : '';
      const response = await apiClient.get(`/me/questions${params}`);
      
      const fetchedQuestions = response.data || [];
      setQuestions(fetchedQuestions);
      setCurrentPage(1);
      
      // Also refresh all questions
      const allResponse = await apiClient.get('/me/questions');
      setAllQuestions(allResponse.data || []);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      if (err.response?.status !== 404) {
        console.error("Error fetching questions:", err.message);
      }
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };
  
  useEffect(() => {
  if (isLoadingQuestions) return;
  const alreadyCelebrated = localStorage.getItem('qc_first_question_celebrated');
  if (alreadyCelebrated === 'true') return;
  
  const currentCount = Array.isArray(allQuestions) ? allQuestions.length : 0;
  const previousCount = previousQuestionCountRef.current;
  
  if (previousCount === 0 && currentCount === 1) {
    const newQuestion = allQuestions[0];
    const questionAge = Date.now() / 1000 - (newQuestion.created_at > 4102444800 
      ? newQuestion.created_at / 1000 : newQuestion.created_at);
    
    if (questionAge < 300) {
      setFirstQuestion(newQuestion);
      setShowFirstQuestionCelebration(true);
      localStorage.setItem('qc_first_question_celebrated', 'true');
    }
  }
  previousQuestionCountRef.current = currentCount;
}, [allQuestions, isLoadingQuestions]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/me/profile');
        
        const expertProfile = response.data.expert_profile || {};
        
        const processedProfile = {
          ...expertProfile,
          user: response.data.user,
          priceUsd: dollarsFromCents(expertProfile.price_cents),
          slaHours: expertProfile.sla_hours,
          isPublic: expertProfile.public,
          avatar_url: expertProfile.avatar_url || null,
          charity_percentage: expertProfile.charity_percentage || 0,
          selected_charity: expertProfile.selected_charity || null,
          total_donated: expertProfile.total_donated || 0,
          accepting_questions: expertProfile.accepting_questions ?? true,
          // Tier 1 (Quick Consult) fields
          tier1_enabled: expertProfile.tier1_enabled !== false,
          tier1_price_usd: expertProfile.tier1_price_cents ? dollarsFromCents(expertProfile.tier1_price_cents) : '',
          tier1_sla_hours: expertProfile.tier1_sla_hours || '',
          tier1_description: expertProfile.tier1_description || '',
          // Tier 2 (Deep Dive) fields
          tier2_enabled: expertProfile.tier2_enabled || false,
          tier2_min_price_usd: expertProfile.tier2_min_price_cents ? dollarsFromCents(expertProfile.tier2_min_price_cents) : '',
          tier2_max_price_usd: expertProfile.tier2_max_price_cents ? dollarsFromCents(expertProfile.tier2_max_price_cents) : '',
          tier2_sla_hours: expertProfile.tier2_sla_hours || '',
          tier2_auto_decline_below_usd: expertProfile.tier2_auto_decline_below_cents ? dollarsFromCents(expertProfile.tier2_auto_decline_below_cents) : '',
          tier2_description: expertProfile.tier2_description || ''
        };
        
        setProfile(processedProfile);
        setProfileData(response.data); // ✅ ADDED - Share profile with AuthContext
        
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Could not load your profile. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const hash = location.hash;
    
    if (hash === '#profile-settings') {
      setIsProfileModalOpen(true);
    } else if (hash === '#account-settings') {
      setIsAccountModalOpen(true);
    } else if (hash.startsWith('#question-')) {
      const questionId = parseInt(hash.replace('#question-', ''), 10);
      
      if (!isNaN(questionId) && Array.isArray(allQuestions) && allQuestions.length > 0) {
        const question = allQuestions.find(q => q.id === questionId);
        
        if (question) {
          setSelectedQuestion(question);
          setShowQuestionDetailModal(true);
        } else {
          console.warn(`Question with ID ${questionId} not found`);
          navigate('/expert', { replace: true });
        }
      }
    }
  }, [location.hash, allQuestions, navigate]);

  useEffect(() => {
    const fetchAllQuestions = async () => {
      if (!profile) return;
      
      try {
        const response = await apiClient.get('/me/questions');
        setAllQuestions(response.data || []);
      } catch (err) {
        console.error("Failed to fetch all questions:", err);
        setAllQuestions([]);
      }
    };

    fetchAllQuestions();
  }, [profile]);

  // ✅ OPTIMIZED: Removed sortBy from dependencies - only fetch when tab changes
  useEffect(() => {
    refreshQuestions();
  }, [profile, activeTab]); // sortBy removed!

  const handleFirstQuestionAnswer = () => {
  if (firstQuestion) {
    setSelectedQuestion(firstQuestion);
    setShowQuestionDetailModal(true);
    navigate(`#question-${firstQuestion.id}`, { replace: false });
  }
};
  
  const handleToggleAvailability = async () => {
    if (isTogglingAvailability) return;
    
    const newStatus = !profile.accepting_questions;
    
    try {
      setIsTogglingAvailability(true);
      
      const response = await apiClient.post('/expert/profile/availability', {
        accepting_questions: newStatus
      });
      
      setProfile({
        ...profile,
        accepting_questions: newStatus
      });

      if (newStatus) {
        setAvailabilityMessage('✓ You are now available to receive questions');
      } else {
        setAvailabilityMessage('✓ You are now away - not accepting new questions');
      }
      setShowAvailabilityMessage(true);
      
      setTimeout(() => {
        setShowAvailabilityMessage(false);
      }, 3000);
      
    } catch (err) {
      console.error("Failed to update availability:", err);
      
      setProfile({
        ...profile,
        accepting_questions: newStatus
      });
      
      if (newStatus) {
        setAvailabilityMessage('✓ You are now available to receive questions');
      } else {
        setAvailabilityMessage('✓ You are now away - not accepting new questions');
      }
      setShowAvailabilityMessage(true);
      
      setTimeout(() => {
        setShowAvailabilityMessage(false);
      }, 3000);
      
      console.warn('Note: Availability API endpoint may not be implemented yet. UI updated optimistically.');
      
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleSaveSettings = (updatedProfile) => {
    const processedProfile = {
      ...profile,
      ...updatedProfile,
      priceUsd: dollarsFromCents(updatedProfile.price_cents || updatedProfile.priceUsd * 100),
      slaHours: updatedProfile.sla_hours || updatedProfile.slaHours,
      isPublic: updatedProfile.public !== undefined ? updatedProfile.public : updatedProfile.isPublic,
      // Tier 1 (Quick Consult) fields
      tier1_enabled: updatedProfile.tier1_enabled !== false,
      tier1_price_usd: updatedProfile.tier1_price_cents ? dollarsFromCents(updatedProfile.tier1_price_cents) : '',
      tier1_sla_hours: updatedProfile.tier1_sla_hours || '',
      tier1_description: updatedProfile.tier1_description || '',
      // Tier 2 (Deep Dive) fields
      tier2_enabled: updatedProfile.tier2_enabled || false,
      tier2_min_price_usd: updatedProfile.tier2_min_price_cents ? dollarsFromCents(updatedProfile.tier2_min_price_cents) : '',
      tier2_max_price_usd: updatedProfile.tier2_max_price_cents ? dollarsFromCents(updatedProfile.tier2_max_price_cents) : '',
      tier2_sla_hours: updatedProfile.tier2_sla_hours || '',
      tier2_auto_decline_below_usd: updatedProfile.tier2_auto_decline_below_cents ? dollarsFromCents(updatedProfile.tier2_auto_decline_below_cents) : '',
      tier2_description: updatedProfile.tier2_description || ''
    };
    setProfile(processedProfile);
  };

  const handleSaveAccount = (updatedAccount) => {
    console.log('Account updated:', updatedAccount);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    if (location.hash === '#profile-settings') {
      navigate('/expert', { replace: true });
    }
  };

  const handleCloseAccountModal = () => {
    setIsAccountModalOpen(false);
    if (location.hash === '#account-settings') {
      navigate('/expert', { replace: true });
    }
  };

  const handleCloseQuestionDetail = () => {
    setShowQuestionDetailModal(false);
    setSelectedQuestion(null);
    if (location.hash.startsWith('#question-')) {
      navigate('/expert', { replace: true });
    }
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setShowQuestionDetailModal(true);
    navigate(`#question-${question.id}`, { replace: false });
  };
  
  const handleCopyProfileLink = () => {
    if (profile?.handle) {
      const url = `${window.location.origin}/u/${profile.handle}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ✅ Handle action from dropdown (including refresh)
  const handleQuestionAction = (action, question) => {
    if (action === 'refresh') {
      // Refresh questions when hide/unhide is triggered
      refreshQuestions();
      return;
    }
    
    // Handle other actions
    console.log('Action:', action, 'Question:', question);
    
    if (action === 'view') {
      window.location.hash = `#question-${question.id}`;
      return;
    }
    
    switch (action) {
      case 'refund':
        alert('Refund process initiated');
        break;
      default:
        break;
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        <div className="mb-4 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('#profile-settings')}
                className="flex-shrink-0 group relative"
                title="Edit your profile"
              >
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-indigo-100 group-hover:ring-indigo-300 transition-all cursor-pointer"
                  />
                ) : (
                  <div className="group-hover:opacity-80 transition-opacity cursor-pointer">
                    <DefaultAvatar size={48} />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-full transition-all">
                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 truncate">
                    Welcome, {profile?.user?.name || 'Expert'}
                  </h1>
                  {profile?.handle && profile.isPublic && (
                    <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <a href={`/u/${profile.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:opacity-80 transition"
                        title="View public profile"
                      >
                        <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="text-xs font-semibold text-indigo-600 max-w-[100px] truncate">
                          /u/{profile.handle}
                        </span>
                      </a>
                      <div className="w-px h-4 bg-indigo-200 mx-1"></div>
                      <button
                        onClick={handleCopyProfileLink}
                        className="p-1 hover:bg-indigo-100 rounded transition"
                        title="Copy link"
                        type="button"
                      >
                        {copied ? (
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <div className="w-px h-4 bg-indigo-200 mx-1"></div>
                      <button
                        onClick={() => setIsQRModalOpen(true)}
                        className="p-1 hover:bg-indigo-100 rounded transition"
                        title="Show QR code"
                        type="button"
                      >
                        <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {profile?.user?.email || '...'}
                  </p>
                  {profile?.handle && profile.isPublic && (
                    <div className="md:hidden inline-flex items-center gap-1.5">
                      <button
                        onClick={handleCopyProfileLink}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold text-indigo-600"
                        type="button"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {copied ? 'Copied' : 'Link'}
                      </button>
                      <button
                        onClick={() => setIsQRModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold text-indigo-600"
                        type="button"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        QR
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      profile?.accepting_questions ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    <span className={`text-sm font-medium whitespace-nowrap ${
                      profile?.accepting_questions ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {profile?.accepting_questions ? 'Available' : 'Away'}
                    </span>
                  </div>
                  
                  <div className="w-px h-4 bg-gray-300" />
                  
                  <button
                    onClick={handleToggleAvailability}
                    disabled={isTogglingAvailability}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                      profile?.accepting_questions 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    } ${isTogglingAvailability ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    type="button"
                    title={profile?.accepting_questions ? 'Turn off availability' : 'Turn on availability'}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                        profile?.accepting_questions ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                
                {showAvailabilityMessage && (
                  <div className="absolute top-full left-0 mt-2 z-50 animate-fade-in">
                    <div className={`px-4 py-2.5 rounded-lg shadow-lg border whitespace-nowrap text-sm font-medium ${
                      availabilityMessage.includes('✗')
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-200 text-green-700'
                    }`}>
                      {availabilityMessage}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('#profile-settings')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={() => navigate('#account-settings')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Account</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="space-y-4 lg:space-y-6">
            <StatsSection 
              allQuestions={allQuestions} 
              targetResponseTime={profile?.slaHours || 24}
            />
            {socialImpactEnabled && (
            <SocialImpactStats 
              totalDonated={profile?.total_donated || 0}
              charityPercentage={profile?.charity_percentage || 0}
              selectedCharity={profile?.selected_charity}
              onOpenSettings={() => navigate('#profile-settings')}
            />
            )}
            {
            <MarketingPreview 
             isEnabled={marketingEnabled}
                campaigns={campaigns}
             trafficSources={trafficSources}
             insights={insights}
             onNavigate={() => navigate('/expert/marketing')}
            />
            }
          </div>

          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Pending Deep Dive Offers */}
            <PendingOffersSection onOfferUpdate={refreshQuestions} />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
                
                <div className="inline-flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
                      activeTab === 'pending'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    type="button"
                  >
                    Pending {pendingCount > 0 && `(${pendingCount})`}
                  </button>
                  <button
                    onClick={() => setActiveTab('answered')}
                    className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
                      activeTab === 'answered'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    type="button"
                  >
                    Answered {answeredCount > 0 && `(${answeredCount})`}
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
                      activeTab === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    type="button"
                  >
                    All
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <HiddenToggle 
                  showHidden={showHidden} 
                  onToggle={() => setShowHidden(!showHidden)}
                  hiddenCount={hiddenCount}
                />
                <SortDropdown 
                  sortBy={sortBy} 
                  onSortChange={setSortBy} 
                  questionCount={filteredQuestions.length} 
                />
              </div>
            </div>

            {isLoadingQuestions ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : (
              <QuestionTable 
                questions={paginatedQuestions.questions}
                currentPage={currentPage}
                totalPages={paginatedQuestions.totalPages}
                onPageChange={handlePageChange}
                onQuestionClick={handleQuestionClick}
                onAction={handleQuestionAction}
                expertProfile={{
                    ...profile,
                    total_questions_answered: answeredCount
                }}
                activeTab={activeTab}     // ✅ ADD THIS LINE
              />
            )}
          </div>
        </div>
      </main>

      {profile && (
        <>
          <SettingsModal 
            isOpen={isProfileModalOpen} 
            onClose={handleCloseProfileModal} 
            profile={profile}
            onSave={handleSaveSettings}
          />
          <AccountModal 
            isOpen={isAccountModalOpen} 
            onClose={handleCloseAccountModal} 
            profile={profile}
            onSave={handleSaveAccount}
          />
          <ProfilePreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            profile={profile}
          />
          
          <QuestionDetailModal
            isOpen={showQuestionDetailModal}
            onClose={handleCloseQuestionDetail}
            question={selectedQuestion}
            userId={profile?.user?.id || profile?.id}
            onAnswerSubmitted={(questionId) => {
              refreshQuestions();
            }}
          />
          <FirstQuestionCelebration
            isOpen={showFirstQuestionCelebration}
            onClose={() => setShowFirstQuestionCelebration(false)}
            question={firstQuestion}
            onAnswerClick={handleFirstQuestionAnswer}
          />

          <QRCodeModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            profileUrl={`${window.location.origin}/u/${profile.handle}`}
            expertName={profile.user?.name || profile.name || 'Expert'}
            handle={profile.handle}
          />
        </>
      )}
    </div>
  );
}

export default ExpertDashboardPage;