import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/api';

// Helper to format price from cents
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  if (amount % 1 !== 0) {
      return `${symbol}${amount.toFixed(2)}`;
  }
  return `${symbol}${amount.toFixed(0)}`;
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

// Social Impact Card
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

    const coercePublic = (val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'boolean') return val;
      if (typeof val === 'number') return val === 1;
      if (typeof val === 'string') {
        const v = val.trim().toLowerCase();
        return v === '1' || v === 'true' || v === 't' || v === 'yes' || v === 'on';
      }
      return false;
    };

    const fetchPublicProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const { data } = await apiClient.get(
          `/3B14WLbJ/public/profile?handle=${encodeURIComponent(handle)}`
        );

        console.log('Public profile API response:', data);

        const ep = data?.expert_profile ?? data ?? null;
        const user = data?.user ?? ep?.user ?? null;

        if (!ep) {
          throw new Error('This profile does not exist.');
        }

        console.log('Checking public fields:', {
          public: ep.public,
          is_public: ep.is_public,
          isPublic: ep.isPublic,
          allKeys: Object.keys(ep)
        });

        const publicValue = ep.public ?? ep.is_public ?? ep.isPublic;
        const isPublic = coercePublic(publicValue);
        
        console.log('Profile public status:', { 
          raw: publicValue, 
          coerced: isPublic,
          type: typeof publicValue
        });

        if (!isPublic) {
          throw new Error('This profile is private.');
        }

        setProfile({
          ...ep,
          isPublic,
          user,
          name: ep.name ?? user?.name ?? null,
          avatar_url: ep.avatar_url ?? ep.avatar ?? null,
          charity_percentage: ep.charity_percentage ?? 25,
          selected_charity: ep.selected_charity ?? 'unicef',
        });
      } catch (err) {
        console.error('Public profile fetch error:', err);
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
          <div className="text-center p-12">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        );
    }
    
    if (error) {
        const isNotFound = error.includes('does not exist') || error.includes('not found');
        const isPrivate = error.includes('private');
        
        if (isNotFound) {
          return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Expert Not Found</h2>
              <p className="text-gray-600 mb-2">
                <span className="font-semibold text-gray-900">@{handle}</span> isn't on QuickChat yet.
              </p>
              <p className="text-gray-600 mb-6">
                But you can invite them to join!
              </p>
              
              
                href={`https://quickchat-deploy.vercel.app/invite?expert=${encodeURIComponent(handle)}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Invite {handle} to QuickChat</span>
              </a>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">or</p>
                <a 
                  href="/"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Browse other experts</span>
                </a>
              <div>
            </div>
          );
        }
        
        if (isPrivate) {
          return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Profile is Private</h2>
              <p className="text-gray-600 mb-6">
                This expert has set their profile to private.
              </p>
              
              <a 
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <span>Browse other experts</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          );
        }
        
        return (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <a 
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <span>Go to homepage</span>
            </a>
          </div>
        );
    }

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
                    alt={`${profile.name || 'Expert'}'s avatar`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div 
                  className="w-24 h-24 flex-shrink-0" 
                  style={{ display: profile.avatar_url ? 'none' : 'block' }}
                >
                  <DefaultAvatar size={96} />
                </div>
                <div className="pt-14 flex-1">
                  <div className="flex items-center justify-end gap-4">
                    {profile.socials?.twitter && (
                      <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </a>
                    )}
                    {profile.socials?.website && (
                      <a href={profile.socials.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name || 'Expert'}</h1>
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
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 items-center gap-4">
                 <div className="text-center">
                   <div className="text-xs text-gray-500">Response</div>
                   <div className="font-bold text-gray-900">{profile.sla_hours}h</div>
                 </div>
                 <div className="text-center border-l border-gray-200">
                   <div className="text-xs text-gray-500">Price</div>
                   <div className="font-bold text-gray-900">{formatPrice(profile.price_cents, profile.currency)}</div>
                 </div>
              </div>

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
    <div className="min-h-screen bg-gray-50 flex justify-center items-start sm:items-center p-4 pt-28 sm:p-6">
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