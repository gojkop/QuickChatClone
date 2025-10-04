import React, { useState, useEffect } from 'react';
import apiClient from '@/api';
import SettingsModal from '@/components/dashboard/SettingsModal';
import SocialImpactStats from '@/components/dashboard/SocialImpactStats';
import DefaultAvatar from '@/components/dashboard/DefaultAvatar';

// Helper to format currency
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

// Helper to format date
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Question Card Component
const QuestionCard = ({ question, onViewDetails }) => {
  const isAnswered = question.answered_at !== null;
  const statusColor = {
    'paid': 'bg-green-100 text-green-700 border-green-200',
    'pending_payment': 'bg-amber-100 text-amber-700 border-amber-200',
    'answered': 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {question.title}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor[question.status] || 'bg-gray-100 text-gray-700'}`}>
              {question.status}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {question.payer_email}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(question.created_at)}
            </span>
          </div>
        </div>

        <div className="text-right ml-4">
          <div className="text-2xl font-black text-gray-900">
            {formatPrice(question.price_cents, question.currency)}
          </div>
        </div>
      </div>

      {question.text && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {question.text}
        </p>
      )}

      <div className="flex items-center gap-3">
        {question.media_asset_id && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video/Audio
          </span>
        )}
        
        {question.attachments && JSON.parse(question.attachments).length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {JSON.parse(question.attachments).length} files
          </span>
        )}

        <div className="flex-1"></div>

        <button
          onClick={() => onViewDetails(question)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition text-sm"
        >
          <span>{isAnswered ? 'View Answer' : 'Answer Now'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

function ExpertDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(''); // Filter

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
        const params = selectedStatus ? `?status=${selectedStatus}` : '';
        const response = await apiClient.get(`/me/questions${params}`);
        setQuestions(response.data || []);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        // Don't show error if endpoint doesn't exist yet
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
  }, [profile, selectedStatus]);

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
  
  const handleCopyToClipboard = () => {
    if (profile?.handle) {
      const url = `${window.location.origin}/u/${profile.handle}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewDetails = (question) => {
    // TODO: Navigate to question detail page or open modal
    console.log('View question:', question);
    alert(`Question detail view coming soon!\n\nQuestion ID: ${question.id}\nTitle: ${question.title}`);
  };

  const pendingCount = questions.filter(q => q.status === 'paid' && !q.answered_at).length;

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
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
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
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 truncate">
                Welcome, {profile?.user?.name || 'Expert'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {profile?.user?.email || '...'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Settings & Impact */}
          <div className="space-y-6">
            {/* Quick Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Quick Settings</h2>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                >
                  Edit
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Price per Question</span>
                  <span className="font-bold text-gray-900">${profile.priceUsd || '—'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-bold text-gray-900">{profile.slaHours ? `${profile.slaHours}h` : '—'}</span>
                </div>
                
                <div className="py-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Public Profile</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      profile.isPublic 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${profile.isPublic ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                      {profile.isPublic ? 'Active' : 'Private'}
                    </span>
                  </div>
                  {profile.handle && profile.isPublic && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <a 
                          href={`/u/${profile.handle}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 text-xs text-indigo-600 font-semibold truncate hover:underline"
                        >
                          /u/{profile.handle}
                        </a>
                        <button 
                          onClick={handleCopyToClipboard}
                          className="flex-shrink-0 px-2.5 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                          {copied ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Copied
                            </span>
                          ) : (
                            'Copy'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Impact Card */}
            <SocialImpactStats 
              totalDonated={profile.total_donated || 0}
              charityPercentage={profile.charity_percentage || 0}
              selectedCharity={profile.selected_charity}
            />
          </div>

          {/* Right Column - Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Questions Header with Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Questions</h2>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                    {pendingCount} pending
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {['paid', 'answered', 'all'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status === 'all' ? '' : status)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      (status === 'all' && selectedStatus === '') || selectedStatus === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            {isLoadingQuestions ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-1">No questions yet!</p>
                <p className="text-sm text-gray-500">Share your profile link to start receiving questions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard 
                    key={question.id} 
                    question={question}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {profile && (
        <SettingsModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          profile={profile}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}

export default ExpertDashboardPage;