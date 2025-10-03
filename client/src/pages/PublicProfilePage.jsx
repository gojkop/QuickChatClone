import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/api';

// Helper to format price from cents
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  // Use toFixed(2) to show cents for donation amount
  if (amount % 1 !== 0) {
      return `${symbol}${amount.toFixed(2)}`;
  }
  return `${symbol}${amount.toFixed(0)}`;
};

// Default Avatar Component (no changes needed)
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

// --- NEW: Social Impact Card with Donation Calculation ---
const SocialImpactCard = ({ charityPercentage, selectedCharity, priceCents, currency }) => {
  const charityInfo = {
    'unicef': { name: 'UNICEF', icon: '💖' },
    'doctors-without-borders': { name: 'Doctors Without Borders', icon: '🏥' },
    'malala-fund': { name: 'Malala Fund', icon: '📚' },
    'wwf': { name: 'WWF', icon: '🐼' },
    'charity-water': { name: 'charity: water', icon: '💧' }
  };

  const charity = charityInfo[selectedCharity];

  if (!charityPercentage || charityPercentage === 0 || !charity) {
    return null;
  }

  const donationAmount = (priceCents * charityPercentage) / 100;

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-lg p-4 border border-orange-200">
        <div className="flex items-center gap-3">
            <span className="text-2xl">{charity.icon}</span>
            <p className="text-sm text-gray-700 leading-snug">
                A <span className="font-bold">{charityPercentage}% donation</span> ({formatPrice(donationAmount, currency)}) of your payment will go to <span className="font-bold text-gray-900">{charity.name}</span>.
            </p>
        </div>
    </div>
  );
};


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
        const response = await apiClient.get(`/3B14WLbJ/public/profile?handle=${handle}`);
        if (!response.data || !response.data.public) {
          throw new Error('This profile is private or does not exist.');
        }
        
        const profileData = {
          ...response.data,
          tagline: "Former VP Marketing at 3 Unicorns", 
          tags: ["SaaS", "B2B Marketing", "Growth", "PLG"], 
          socials: {
            twitter: "https://twitter.com/handle",
            website: "https://website.com"
          },
          charity_percentage: response.data.charity_percentage || 25,
          selected_charity: response.data.selected_charity || 'unicef',
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
    if (isLoading) { /* ... loading spinner ... */ }
    if (error) { /* ... error message ... */ }

    if (profile) {
      return (
        <>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            
            <div className="h-24 bg-gradient-to-br from-indigo-100 to-violet-100"></div>

            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4 -mt-16">
                {profile.avatar_url ? (
                  <img 
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg" 
                    src={profile.avatar_url}
                    alt={`${profile.user?.name || 'Expert'}'s avatar`}
                  />
                ) : (
                  <div className="w-24 h-24 flex-shrink-0"><DefaultAvatar size={96} /></div>
                )}
                <div className="pt-14 flex-1">
                  <div className="flex items-center justify-end gap-3">
                    {profile.socials?.twitter && ( <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">...</a> )}
                    {profile.socials?.website && ( <a href={profile.socials.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">...</a> )}
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.user?.name || 'Expert'}</h1>
                <p className="text-sm text-gray-500 font-medium">@{profile.handle}</p>
                {profile.tagline && (
                  <p className="mt-1 text-base text-gray-700 font-semibold">{profile.tagline}</p>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
              )}

              {profile.tags && profile.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Response</div>
                      <div className="font-bold text-gray-900">{profile.sla_hours}h</div>
                    </div>
                    <div className="h-8 border-l border-gray-200"></div>
                     <div className="text-center">
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="font-bold text-gray-900">{formatPrice(profile.price_cents, profile.currency)}</div>
                    </div>
                 </div>
              </div>

              {/* --- NEW Social Impact Card Placement --- */}
              <SocialImpactCard
                charityPercentage={profile.charity_percentage}
                selectedCharity={profile.selected_charity}
                priceCents={profile.price_cents}
                currency={profile.currency}
              />
            </div>
            
            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
               <button
                onClick={handleAskQuestion}
                className="w-full group bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg text-base hover:shadow-lg transition-all"
              >
                Ask Your Question
              </button>
            </div>
          </div>
        
          <div className="pt-6">
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-gray-500">
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
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {renderContent()}
        
        <div className="text-center mt-6">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors group">
            <span>Powered by</span>
            <span className="font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              QuickChat
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default PublicProfilePage;