import React, { useState, useEffect } from 'react';
import apiClient from '@/api';
import SettingsModal from '@/components/dashboard/SettingsModal';
import AccountModal from '@/components/dashboard/AccountModal';
import SocialImpactStats from '@/components/dashboard/SocialImpactStats';
import StatsSection from '@/components/dashboard/StatsSection';
import DefaultAvatar from '@/components/dashboard/DefaultAvatar';
import QuestionTable from '@/components/dashboard/QuestionTable';

function ExpertDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [error, setError] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, answered, all

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
          total_donated: expertProfile.total_donated || 0
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
    // TODO: Update profile with account changes
    console.log('Account updated:', updatedAccount);
  };
  
  const handleCopyProfileLink = () => {
    if (profile?.handle) {
      const url = `${window.location.origin}/u/${profile.handle}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAnswerQuestion = (question) => {
    // TODO: Navigate to question detail/answer page
    console.log('Answer question:', question);
    alert(`Question answer page coming soon!\n\nQuestion ID: ${question.id}\nTitle: ${question.title}`);
  };

  const handleDeleteQuestion = (question) => {
    // TODO: Implement delete confirmation and API call
    console.log('Delete question:', question);
    if (window.confirm(`Are you sure you want to delete this question?\n\n"${question.title}"\n\nThis action cannot be undone.`)) {
      alert('Delete functionality will be implemented soon!');
      // Future implementation:
      // await apiClient.delete(`/me/questions/${question.id}`);
      // setQuestions(questions.filter(q => q.id !== question.id));
    }
  };

  const pendingCount = questions.filter(q => q.status === 'paid' && !q.answered_at).length;

  // Mock stats data - TODO: fetch from API
  const stats = {
    thisMonthEarnings: 280000, // $2,800 in cents
    allTimeEarnings: 1560000, // $15,600 in cents
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left side - Avatar and Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-indigo-100"
                  />
                ) : (
                  <DefaultAvatar size={48} className="sm:w-16 sm:h-16" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 truncate">
                    Welcome, {profile?.user?.name || 'Expert'}
                  </h1>
                  {/* Profile Link Badge */}
                  {profile?.handle && profile.isPublic && (
                    <button
                      onClick={handleCopyProfileLink}
                      className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition group"
                      title="Copy profile link"
                    >
                      <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="text-xs font-semibold text-indigo-600 max-w-[100px] truncate">
                        {copied ? 'Copied!' : `/u/${profile.handle}`}
                      </span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {profile?.user?.email || '...'}
                  </p>
                  {/* Mobile Profile Link */}
                  {profile?.handle && profile.isPublic && (
                    <button
                      onClick={handleCopyProfileLink}
                      className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-semibold text-indigo-600"
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

            {/* Right side - Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Account</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Social Impact */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <StatsSection stats={stats} />

            {/* Social Impact Card */}
            <SocialImpactStats 
              totalDonated={profile.total_donated || 0}
              charityPercentage={profile.charity_percentage || 0}
              selectedCharity={profile.selected_charity}
            />
          </div>

          {/* Right Column - Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Questions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
              
              {/* Tab Navigation */}
              <div className="inline-flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition ${
                    activeTab === 'pending'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
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
                >
                  All
                </button>
              </div>
            </div>

            {/* Questions Table */}
            {isLoadingQuestions ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : (
              <QuestionTable 
                questions={questions}
                onAnswer={handleAnswerQuestion}
                onDelete={handleDeleteQuestion}
              />
            )}
          </div>
        </div>
      </main>

      {/* Profile Settings Modal */}
      {profile && (
        <SettingsModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
          profile={profile}
          onSave={handleSaveSettings}
        />
      )}

      {/* Account Modal */}
      {profile && (
        <AccountModal 
          isOpen={isAccountModalOpen} 
          onClose={() => setIsAccountModalOpen(false)} 
          profile={profile}
          onSave={handleSaveAccount}
        />
      )}
    </div>
  );
}

export default ExpertDashboardPage;