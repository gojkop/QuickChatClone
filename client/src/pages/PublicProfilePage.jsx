// client/src/pages/PublicProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/api';

// Helper to format price from cents
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};

// Default Avatar Component
const DefaultAvatar = ({ size = 120 }) => (
  <div 
    className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg"
    style={{ width: size, height: size }}
  >
    <svg 
      className="text-white" 
      style={{ width: size / 2, height: size / 2 }}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
      />
    </svg>
  </div>
);

// Social Impact Badge Component
const SocialImpactBadge = ({ charityPercentage, selectedCharity }) => {
  const charityInfo = {
    'unicef': { name: 'UNICEF', icon: '👶', color: 'from-blue-400 to-blue-600' },
    'doctors-without-borders': { name: 'Doctors Without Borders', icon: '🏥', color: 'from-red-400 to-red-600' },
    'malala-fund': { name: 'Malala Fund', icon: '📚', color: 'from-pink-400 to-pink-600' },
    'wwf': { name: 'WWF', icon: '🐼', color: 'from-green-400 to-green-600' },
    'charity-water': { name: 'charity: water', icon: '💧', color: 'from-cyan-400 to-cyan-600' }
  };

  const charity = charityInfo[selectedCharity] || { name: 'Charity', icon: '❤️', color: 'from-purple-400 to-purple-600' };

  if (!charityPercentage || charityPercentage === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 rounded-xl p-5 border border-orange-200 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${charity.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
          {charity.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-sm font-bold text-gray-900">Making an Impact</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-bold text-orange-700">{charityPercentage}%</span> of earnings support{' '}
            <span className="font-bold text-gray-900">{charity.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Info Card Component
const InfoCard = ({ icon, label, value, gradient = "from-indigo-50 to-violet-50" }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-5 border border-indigo-100 shadow-sm`}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-gray-600 mb-0.5">{label}</div>
        <div className="text-lg font-black text-gray-900">{value}</div>
      </div>
    </div>
  </div>
);

function PublicProfilePage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!handle) {
      setIsLoading(false);
      setError('No expert handle provided.');
      return;
    }

    const fetchPublicProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        // This public endpoint doesn't require auth
        const response = await apiClient.get(`/3B14WLbJ/public/profile?handle=${handle}`);
        if (!response.data || !response.data.public) {
          throw new Error('This profile is private or does not exist.');
        }
        
        // Mock charity data for now - will come from database later
        const profileData = {
          ...response.data,
          avatar_url: response.data.avatar_url || null,
          charity_percentage: response.data.charity_percentage || 25, // MOCK: Remove this line when DB ready
          selected_charity: response.data.selected_charity || 'unicef', // MOCK: Remove this line when DB ready
        };
        
        setProfile(profileData);
      } catch (err) {
        console.error("Fetch public profile error:", err);
        setError(err.message || 'Could not load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicProfile();
  }, [handle]);

  const handleAskQuestion = () => {
    navigate(`/ask?expert=${handle}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center text-center py-12">
          <div className="h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-600">Loading profile…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 text-sm">Please check the URL or try again later.</p>
        </div>
      );
    }

    if (profile) {
      return (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center">
            {/* Avatar */}
            <div className="mb-5 flex justify-center">
              {profile.avatar_url ? (
                <img 
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-xl" 
                  src={profile.avatar_url}
                  alt={`${profile.user?.name || 'Expert'}'s avatar`}
                />
              ) : (
                <DefaultAvatar size={112} />
              )}
            </div>

            {/* Name & Handle */}
            <h1 className="text-3xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {profile.user?.name || 'Expert'}
              </span>
            </h1>
            <p className="text-sm text-gray-500 font-medium mb-4">@{profile.handle}</p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 text-base leading-relaxed max-w-xl mx-auto">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard 
              icon={
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Response Time"
              value={`${profile.sla_hours} hours`}
              gradient="from-indigo-50 to-violet-50"
            />
            
            <InfoCard 
              icon={
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Price per Question"
              value={formatPrice(profile.price_cents, profile.currency)}
              gradient="from-green-50 to-emerald-50"
            />
          </div>

          {/* Social Impact Badge - Only shown if expert is donating */}
          <SocialImpactBadge 
            charityPercentage={profile.charity_percentage}
            selectedCharity={profile.selected_charity}
          />

          {/* CTA Button */}
          <button
            onClick={handleAskQuestion}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span>Ask for {formatPrice(profile.price_cents, profile.currency)}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          {/* Trust Signals */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Guaranteed response</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors group"
          >
            <span>Powered by</span>
            <span className="font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-violet-700">
              QuickChat
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default PublicProfilePage;