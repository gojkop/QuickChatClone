// client/src/pages/ExpertDashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/api';
import SettingsModal from '@/components/dashboard/SettingsModal';
import AvatarUpload from '@/components/dashboard/AvatarUpload';
import SocialImpactStats from '@/components/dashboard/SocialImpactStats';
import DefaultAvatar from '@/components/dashboard/DefaultAvatar';

function ExpertDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Helper to format cents to dollars
  const dollarsFromCents = (cents) => Math.round((cents || 0) / 100);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/me/profile');
        console.log('Profile response:', response.data);
        
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
        
        console.log('Processed profile:', processedProfile);
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

  const handleSaveSettings = (updatedProfile) => {
    // Process updated profile from modal to match display format
    const processedProfile = {
      ...profile, // Start with existing profile to preserve user object
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
          <div className="flex items-center gap-4 mb-2">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-100"
              />
            ) : (
              <DefaultAvatar size={64} />
            )}
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Welcome, {profile?.user?.name || 'Expert'}
              </h1>
              <p className="text-sm text-gray-500">{profile?.user?.email || '...'}</p>
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

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Questions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Pending Questions</h2>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  0 pending
                </span>
              </div>
              
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-1">You're all caught up!</p>
                <p className="text-sm text-gray-500">No pending questions at the moment</p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Stats</h2>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-5 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-900">$0</div>
                      <div className="text-xs text-gray-600">Earnings (30 days)</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-900">0</div>
                      <div className="text-xs text-gray-600">Questions Answered</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-900">—</div>
                      <div className="text-xs text-gray-600">Avg. Response Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Preview */}
            {profile.bio && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Your Bio</h2>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
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