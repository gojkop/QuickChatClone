import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/api';

// Helper to format price from cents
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  if (amount % 1 !== 0) {
      return symbol + amount.toFixed(2);
  }
  return symbol + amount.toFixed(0);
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

// Social Link Component
const SocialLink = ({ platform, url }) => {
  const socialConfig = {
    twitter: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      label: 'X (Twitter)'
    },
    linkedin: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      label: 'LinkedIn'
    },
    instagram: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      label: 'Instagram'
    },
    github: {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      label: 'GitHub'
    },
    website: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: 'Website'
    }
  };

  const config = socialConfig[platform];
  if (!config || !url) return null;

  let formattedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    formattedUrl = 'https://' + url;
  }

  return (
    <a 
      href={formattedUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-gray-400 hover:text-indigo-600 transition-colors transform hover:scale-110 duration-200"
      title={config.label}
    >
      {config.icon}
    </a>
  );
};

// Social Impact Card
const SocialImpactCard = ({ charityPercentage, selectedCharity, priceCents, currency }) => {
  const charityInfo = {
    'unicef': { name: 'UNICEF', icon: '💖' },
    'doctors-without-borders': { name: 'Doctors Without Borders', icon: '🏥' },
    'red-cross': { name: 'Red Cross', icon: '❤️' },
    'world-wildlife': { name: 'World Wildlife Fund', icon: '🐼' },
    'malala-fund': { name: 'Malala Fund', icon: '📚' },
    'wwf': { name: 'WWF', icon: '🐼' },
    'charity-water': { name: 'charity: water', icon: '💧' }
  };

  const charity = charityInfo[selectedCharity];

  if (!charityPercentage || charityPercentage === 0 || !charity) {
    return null;
  }

  const donationAmount = (priceCents * charityPercentage) / 100;
  const is100Percent = charityPercentage === 100;

  if (is100Percent) {
    return (
      <div className="bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 rounded-xl p-5 border-2 border-amber-400 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-300/20 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-300/20 rounded-full -ml-8 -mb-8"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{charity.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-amber-900">100% Donation</span>
                <span className="text-xl">✨</span>
              </div>
              <p className="text-sm text-amber-800 leading-snug font-medium">
                This expert donates <span className="font-bold">all earnings</span> ({formatPrice(donationAmount, currency)}) to <span className="font-bold">{charity.name}</span>.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-300">
            <p className="text-xs text-amber-900 italic">
              Your payment directly supports {charity.name}'s mission. Thank you for contributing!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-xl p-4 border border-orange-200 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{charity.icon}</span>
        <p className="text-sm text-gray-700 leading-snug">
          A <span className="font-bold">{charityPercentage}% donation</span> ({formatPrice(donationAmount, currency)}) of your payment will go to <span className="font-bold text-gray-900">{charity.name}</span>.
        </p>
      </div>
    </div>
  );
};

// Trust Badge Component
const TrustBadge = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full shadow-sm">
      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
      <span className="text-xs font-semibold text-green-700">Verified Expert</span>
    </div>
  );
};

// 100% Charity Badge Component
const CharityHeroBadge = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-400 rounded-full shadow-md animate-pulse">
      <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
      </svg>
      <span className="text-xs font-bold text-amber-800">100% to Charity</span>
      <span className="text-sm">✨</span>
    </div>
  );
};

function PublicProfilePage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

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
          'https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/public/profile?handle=' + encodeURIComponent(handle)
        );
        
        if (!response.ok) {
          throw new Error('This profile does not exist.');
        }
        
        const data = await response.json();

        const ep = data?.expert_profile ?? data ?? null;
        const user = data?.user ?? ep?.user ?? null;

        if (!ep) {
          throw new Error('This profile does not exist.');
        }

        const publicValue = ep.public ?? ep.is_public ?? ep.isPublic;
        const isPublic = coercePublic(publicValue);

        if (!isPublic) {
          throw new Error('This profile is private.');
        }

        let socialsData = ep.socials;
        if (typeof socialsData === 'string') {
          try {
            socialsData = JSON.parse(socialsData);
          } catch (e) {
            socialsData = {};
          }
        }

        let expertiseData = ep.expertise;
        if (typeof expertiseData === 'string') {
          try {
            expertiseData = JSON.parse(expertiseData);
          } catch (e) {
            expertiseData = [];
          }
        }

        if (!Array.isArray(expertiseData)) {
          expertiseData = [];
        }

        if (!socialsData || typeof socialsData !== 'object') {
          socialsData = {};
        }
        
        setProfile({
          ...ep,
          isPublic,
          user,
          name: ep.name ?? user?.name ?? null,
          title: ep.professional_title ?? ep.title ?? null,
          tagline: ep.tagline ?? null,
          avatar_url: ep.avatar_url ?? ep.avatar ?? null,
          charity_percentage: ep.charity_percentage ?? 0,
          selected_charity: ep.selected_charity ?? null,
          socials: socialsData,
          expertise: expertiseData
        });
      } catch (err) {
        setError(err.message || 'Could not load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicProfile();
  }, [handle]);

  const handleAskQuestion = () => {
    navigate('/ask?expert=' + handle);
  };

  const handleShare = () => {
    const url = window.location.href;
    const expertName = profile ? (profile.name || handle) : handle;
    
    if (navigator.share) {
      navigator.share({
        title: 'Ask ' + expertName + ' a question',
        text: profile && profile.tagline ? profile.tagline : 'Get expert advice from ' + expertName,
        url: url
      }).catch(function() {});
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          setShowShareMenu(true);
          setTimeout(function() {
            setShowShareMenu(false);
          }, 2000);
        }).catch(function() {});
      }
    }
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
              href={'https://quickchat-deploy.vercel.app/invite?expert=' + encodeURIComponent(handle)}
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
      const hasSocials = profile.socials && Object.values(profile.socials).some(function(url) {
        return url && url.trim() !== '';
      });
      
      return (
        <React.Fragment>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Enhanced Header Gradient */}
            <div className="h-32 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }}></div>
              </div>
              
              {/* Share Button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all transform hover:scale-105 active:scale-95"
                  title="Share profile"
                >
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                </button>
                {showShareMenu && (
                  <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap">
                    Link copied!
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6 pb-28 md:pb-6">
              {/* Avatar Section with Activity Badge */}
              <div className="flex items-start gap-4 -mt-20">
                <div className="relative flex-shrink-0">
                  {profile.avatar_url ? (
                    <img 
                      className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-xl" 
                      src={profile.avatar_url}
                      alt={(profile.name || 'Expert') + "'s avatar"}
                      onError={function(e) {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-28 h-28 flex-shrink-0" 
                    style={{ display: profile.avatar_url ? 'none' : 'block' }}
                  >
                    <DefaultAvatar size={112} />
                  </div>
                  
                  {/* Activity Badge */}
                  <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Social Links */}
                {hasSocials && (
                  <div className="pt-16 flex-1">
                    <div className="flex items-center justify-end gap-3">
                      {profile.socials.twitter && (
                        <SocialLink platform="twitter" url={profile.socials.twitter} />
                      )}
                      {profile.socials.linkedin && (
                        <SocialLink platform="linkedin" url={profile.socials.linkedin} />
                      )}
                      {profile.socials.instagram && (
                        <SocialLink platform="instagram" url={profile.socials.instagram} />
                      )}
                      {profile.socials.github && (
                        <SocialLink platform="github" url={profile.socials.github} />
                      )}
                      {profile.socials.website && (
                        <SocialLink platform="website" url={profile.socials.website} />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Name, Title, Badge, and Tagline */}
              <div>
                <div className="flex items-start gap-2 flex-wrap mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">{profile.name || 'Expert'}</h1>
                  {profile.charity_percentage === 100 ? (
                    <CharityHeroBadge />
                  ) : (
                    <TrustBadge />
                  )}
                </div>
                {profile.title && (
                  <p className="text-lg text-indigo-600 font-semibold">{profile.title}</p>
                )}
                {profile.tagline && (
                  <p className="mt-3 text-base text-gray-700 leading-relaxed">{profile.tagline}</p>
                )}
              </div>

              {/* Bio Section */}
              {profile.bio && (
                <div className="text-gray-600 text-sm leading-relaxed">
                  {profile.bio}
                </div>
              )}

              {/* Expertise Section */}
              {profile.expertise && profile.expertise.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.slice(0, 6).map(function(field, index) {
                      return (
                        <span key={index} className="px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                          {field}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {profile.tags && profile.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map(function(tag) {
                    return (
                      <span key={tag} className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full">
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
              
              {/* Enhanced Price Card */}
              <div className="bg-white rounded-xl border-2 border-indigo-600 p-5 shadow-lg">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(profile.price_cents, profile.currency)}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">per answer</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                      <span>{profile.sla_hours}h response</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">guaranteed</div>
                  </div>
                </div>
                
                {/* What's included */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Up to 90s video question</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Detailed video/voice answer</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Money-back if no reply</span>
                  </div>
                </div>
              </div>

              {/* Charity Donation Section */}
              {profile.charity_percentage > 0 && profile.selected_charity && (
                <SocialImpactCard
                  charityPercentage={profile.charity_percentage}
                  selectedCharity={profile.selected_charity}
                  priceCents={profile.price_cents}
                  currency={profile.currency}
                />
              )}
            </div>
          </div>
        
          {/* Desktop CTA */}
          <div className="hidden md:block mt-6">
            <button
              onClick={handleAskQuestion}
              className="w-full group bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Ask Your Question
            </button>
          </div>

          {/* Mobile Sticky CTA */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl z-50 md:hidden">
            <div className="flex items-center gap-3 max-w-md mx-auto">
              <div className="flex-shrink-0">
                <div className="text-xs text-gray-600">Ask {profile.name ? profile.name.split(' ')[0] : handle}</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatPrice(profile.price_cents, profile.currency)}
                </div>
              </div>
              <button
                onClick={handleAskQuestion}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                Ask Now
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 pb-4">
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span>Guaranteed response</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex justify-center items-start sm:items-center p-4 pt-28 sm:p-6">
      <div className="w-full max-w-md">
        {renderContent()}
        
        <div className="text-center mt-6 mb-6">
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