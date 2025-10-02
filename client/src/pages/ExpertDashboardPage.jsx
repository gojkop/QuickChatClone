import React, { useState, useEffect } from 'react';
import apiClient from '@/api';
import SettingsModal from '@/components/dashboard/SettingsModal';

function ExpertDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to format cents to dollars
  const dollarsFromCents = (cents) => Math.round((cents || 0) / 100);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Using the bootstrap endpoint as in the original expert.html
        const response = await apiClient.post('/3B14WLbJ/me/bootstrap');
        const expertProfile = response.data.expert_profile || {};
        
        // Prepare data for the form
        const processedProfile = {
          ...expertProfile,
          priceUsd: dollarsFromCents(expertProfile.price_cents),
          slaHours: expertProfile.sla_hours,
          isPublic: expertProfile.public,
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

  const handleSaveSettings = (updatedProfile) => {
    // Process updated profile from modal to match display format
    const processedProfile = {
      ...updatedProfile,
      priceUsd: dollarsFromCents(updatedProfile.price_cents),
      slaHours: updatedProfile.sla_hours,
      isPublic: updatedProfile.public,
    };
    setProfile(processedProfile);
  };
  
  const handleCopyToClipboard = () => {
    if (profile?.handle) {
      const url = `${window.location.origin}/u/${profile.handle}`;
      navigator.clipboard.writeText(url);
      // You can add a toast notification here for better UX
    }
  };

  if (isLoading) {
    return <div className="text-center py-40">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-40 text-red-500">{error}</div>;
  }

  return (
    <>
      <main className="container mx-auto px-6 pt-28 pb-12">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.user?.name || 'Expert'}</h1>
        <p className="text-sm text-gray-500 mt-1">Signed in as {profile?.user?.email || '...'}</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings card */}
          <section className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900">Your Settings</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-gray-600">Price per Question:</span><span className="font-semibold">${profile.priceUsd || '—'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Response Time (SLA):</span><span className="font-semibold">{profile.slaHours ? `${profile.slaHours}h` : '—'}</span></div>
              
              <div className="pt-1">
                <label className="block text-xs text-gray-500 mb-1">Public URL</label>
                <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                  <a href={`/u/${profile.handle}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-indigo-600 font-semibold truncate hover:underline">
                    {profile.handle ? `${window.location.origin}/u/${profile.handle}` : 'Set handle in Settings'}
                  </a>
                  <button onClick={handleCopyToClipboard} className="text-xs bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded hover:bg-gray-300 transition">Copy</button>
                </div>
              </div>

              <div className="pt-3">
                <span className="text-gray-600">Bio / Expertise:</span>
                <p className="font-semibold mt-1 text-gray-800 bg-gray-50 p-2 rounded">{profile.bio || 'Not set'}</p>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="mt-6 w-full bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition">Edit Settings</button>
          </section>

          {/* Right column */}
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-900">Pending Questions</h2>
              <div className="mt-4 text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-900">Your Stats <span className="text-sm font-normal text-gray-400">(Coming Soon)</span></h2>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-center opacity-50">
                  <div className="bg-gray-100 p-4 rounded-lg"><p className="text-2xl font-bold text-gray-800">€0</p><p className="text-xs text-gray-500">Earnings (30 days)</p></div>
                  <div className="bg-gray-100 p-4 rounded-lg"><p className="text-2xl font-bold text-gray-800">0</p><p className="text-xs text-gray-500">Questions Answered</p></div>
                  <div className="bg-gray-100 p-4 rounded-lg"><p className="text-2xl font-bold text-gray-800">- hrs</p><p className="text-xs text-gray-500">Avg. Response Time</p></div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {profile && (
        <SettingsModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          profile={profile}
          onSave={handleSaveSettings}
        />
      )}
    </>
  );
}

export default ExpertDashboardPage;