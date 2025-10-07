import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '@/api';
import SettingsModal from '@/components/dashboard/SettingsModal';
import AccountModal from '@/components/dashboard/AccountModal';
import ProfilePreviewModal from '@/components/dashboard/ProfilePreviewModal';
import SocialImpactStats from '@/components/dashboard/SocialImpactStats';
import StatsSection from '@/components/dashboard/StatsSection';
import DefaultAvatar from '@/components/dashboard/DefaultAvatar';
import QuestionTable from '@/components/dashboard/QuestionTable';

function ExpertDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [error, setError] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const QUESTIONS_PER_PAGE = 10;

  const dollarsFromCents = (cents) => Math.round((cents || 0) / 100);

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
          accepting_questions: expertProfile.accepting_questions ?? true
        };
        
        setProfile(processedProfile);
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
    }
  }, [location]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const statusMap = {
          'pending': 'paid',
          'answered': 'answered',
          'all': ''
        };
        const status = statusMap[activeTab];
        const params = status ? `?status=${status}` : '';
        const response = await apiClient.get(`/me/questions${params}`);
        setQuestions(response.data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        if (err.response?.status !== 404) {
          console.error("Error fetching questions:", err.message);
        }
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    if (profile) {
      fetchQuestions();
    }
  }, [profile, activeTab]);

  const handleToggleAvailability = async () => {
    if (isTogglingAvailability) return;
    
    try {
      setIsTogglingAvailability(true);
      const newStatus = !profile.accepting_questions;
      
      const response = await apiClient.post('/expert/profile/availability', {
        accepting_questions: newStatus
      });
      
      // Update local state
      setProfile({
        ...profile,
        accepting_questions: newStatus
      });
    } catch (err) {
      console.error("Failed to update availability:", err);
      alert("Could not update your availability status. Please try again.");
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
  
  const handleCopyProfileLink = () => {
    if (profile?.handle) {
      const url = `${window.location.origin}/u/${profile.handle}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pendingCount = questions.filter(q => q.status === 'paid' && !q.answered_at).length;

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const paginatedQuestions = questions.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = {
    thisMonthEarnings: 280000,
    allTimeEarnings: 1560000,
    totalAnswered: 127,
    avgResponseTime: 8.5,
    targetResponseTime: 24,
    avgRating: 4.8,
    monthlyGrowth: 12
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
      <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        <div className="mb-4 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Clickable Avatar - Opens Profile Settings */}
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
                {/* Hover indicator */}
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
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {profile?.user?.email || '...'}
                  </p>
                  {profile?.handle && profile.isPublic && (
                    <button
                      onClick={handleCopyProfileLink}
                      className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold text-indigo-600"
                      type="button"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {copied ? 'Copied' : 'Link'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Availability Toggle */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Accepting
                  </span>
                  <button
                    onClick={handleToggleAvailability}
                    disabled={isTogglingAvailability}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      profile?.accepting_questions 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    } ${isTogglingAvailability ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    type="button"
                    title={profile?.accepting_questions ? 'Currently accepting questions' : 'Not accepting questions'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        profile?.accepting_questions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className={`flex items-center gap-1 ${
                  profile?.accepting_questions ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {profile?.accepting_questions ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
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
            <StatsSection stats={stats} />
            <SocialImpactStats 
              totalDonated={profile?.total_donated || 0}
              charityPercentage={profile?.charity_percentage || 0}
              selectedCharity={profile?.selected_charity}
            />
          </div>

          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
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
                  Answered
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

            {isLoadingQuestions ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : (
              <QuestionTable 
                questions={paginatedQuestions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
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
        </>
      )}
    </div>
  );
}

export default ExpertDashboardPage;