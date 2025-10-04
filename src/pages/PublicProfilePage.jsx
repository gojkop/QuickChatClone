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

// Social Link Component - displays social media links with handles
const SocialLink = ({ platform, url, handle }) => {
  const socialConfig = {
    twitter: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      label: 'X (Twitter)',
      displayHandle: handle || url?.split('/').pop() || null
    },
    linkedin: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      label: 'LinkedIn',
      displayHandle: handle || url?.split('/in/').pop()?.split('/')[0] || null
    },
    instagram: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      label: 'Instagram',
      displayHandle: handle || url?.split('/').pop()?.replace('@', '') || null
    },
    github: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      label: 'GitHub',
      displayHandle: handle || url?.split('/').pop() || null
    },
    website: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: 'Website',
      displayHandle: handle || url?.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0] || null
    }
  };

  const config = socialConfig[platform];
  if (!config || !url) return null;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors group"
    >
      <span className="text-gray-400 group-hover:text-indigo-500 transition-colors">
        {config.icon}
      </span>
      <span className="font-medium">
        {config.displayHandle ? `@${config.displayHandle.replace('@', '')}` : config.label}
      </span>
    </a>
  );
};

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
        const response = await fetch(
          `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/public/profile?handle=${encodeURIComponent(handle)}`
        );
        
        if (!response.ok) {
          throw new Error('This profile does not exist.');
        }
        
        const data = await response.json();

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
          title: ep.title ?? ep.professional_title ?? null,
          avatar_url: ep.avatar_url ?? ep.avatar ?? null,
          charity_percentage: ep.charity_percentage ?? 25,
          selected_charity: ep.selected_charity ?? 'unicef',
          socials: ep.socials ?? {}
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
              <span className="font-semibold text-gray-900">@{handle}</span> is not on QuickChat yet.
            </p>
            <p className="text-gray-600 mb-6">
              But you can invite them to join!
            </p>
            <a
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
            </div>
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
      const hasSocials = profile.socials && Object.keys(profile.socials).some(key => profile.socials[key]);
      
      return (
        <>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-indigo-100 to-violet-100"></div>

            <div className="p-6 space-y-5">
              {/* Avatar Section */}
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
              </div>

              {/* Name, Title, and Handle Section */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name || 'Expert'}</h1>
                {profile.title && (
                  <p className="text-base text-indigo-600 font-semibold mt-0.5">{profile.title}</p>
                )}
                <p className="text-sm text-gray-500 font-medium mt-1">@{profile.handle}</p>
                {profile.tagline && (
                  <p className="mt-2 text-base text-gray-700">{profile.tagline}</p>
                )}
              </div>

              {/* Bio Section */}
              {profile.bio && (
                <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
              )}

              {/* Tags Section */}
              {profile.tags && profile.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Links Section */}
              {hasSocials && (
                <div className="pt-2 pb-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {profile.socials.twitter && (
                      <SocialLink 
                        platform="twitter" 
                        url={profile.socials.twitter}
                        handle={profile.socials.twitter_handle}
                      />
                    )}
                    {profile.socials.linkedin && (
                      <SocialLink 
                        platform="linkedin" 
                        url={profile.socials.linkedin}
                        handle={profile.socials.linkedin_handle}
                      />
                    )}
                    {profile.socials.instagram && (
                      <SocialLink 
                        platform="instagram" 
                        url={profile.socials.instagram}
                        handle={profile.socials.instagram_handle}
                      />
                    )}
                    {profile.socials.github && (
                      <SocialLink 
                        platform="github" 
                        url={profile.socials.github}
                        handle={profile.socials.github_handle}
                      />
                    )}
                    {profile.socials.website && (
                      <SocialLink 
                        platform="website" 
                        url={profile.socials.website}
                        handle={profile.socials.website_display}
                      />
                    )}
                  </div>
                </div>
              )}
              
              {/* Response Time and Price Section */}
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

              {/* Charity Donation Section */}
              <SocialImpactCard
                charityPercentage={profile.charity_percentage}
                selectedCharity={profile.selected_charity}
                priceCents={profile.price_cents}
                currency={profile.currency}
              />
            </div>
            
            {/* CTA Button */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
              <button
                onClick={handleAskQuestion}
                className="w-full group bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 px-6 rounded-lg text-base hover:shadow-lg transition-all"
              >
                Ask Your Question
              </button>
            </div>
          </div>
        
          {/* Trust Indicators */}
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