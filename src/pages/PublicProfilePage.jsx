import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Building2, BookOpen, Trees, Droplet, Sparkles } from 'lucide-react';
import apiClient from '@/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import QRCodeModal from '@/components/dashboard/QRCodeModal';
import TierSelector from '@/components/pricing/TierSelector';

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
      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all transform hover:scale-110 shadow-sm hover:shadow-md"
      title={config.label}
    >
      {config.icon}
    </a>
  );
};

// Social Impact Card
const SocialImpactCard = ({ charityPercentage, selectedCharity, priceCents, currency }) => {
const charityInfo = {
  'unicef': { name: 'UNICEF', icon: Heart, color: 'text-pink-600' },
  'doctors-without-borders': { name: 'Doctors Without Borders', icon: Building2, color: 'text-red-600' },
  'red-cross': { name: 'Red Cross', icon: Heart, color: 'text-red-600' },
  'world-wildlife': { name: 'World Wildlife Fund', icon: Trees, color: 'text-green-600' },
  'malala-fund': { name: 'Malala Fund', icon: BookOpen, color: 'text-pink-600' },
  'wwf': { name: 'WWF', icon: Trees, color: 'text-green-600' },
  'charity-water': { name: 'charity: water', icon: Droplet, color: 'text-cyan-600' }
};

  const charity = charityInfo[selectedCharity];

  if (!charityPercentage || charityPercentage === 0 || !charity) {
    return null;
  }

  const donationAmount = (priceCents * charityPercentage) / 100;
  const is100Percent = charityPercentage === 100;

  if (is100Percent) {
    return (
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-amber-300 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/20 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-14 h-14 bg-yellow-200/20 rounded-full -ml-7 -mb-7"></div>
        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                {React.createElement(charity.icon, { className: `w-5 h-5 ${charity.color}` })}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-amber-900">100% Donation</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                All earnings ({formatPrice(donationAmount, currency)}) go to <span className="font-bold">{charity.name}</span>. Your payment directly supports their mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-orange-200 shadow-sm">
      <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
             {React.createElement(charity.icon, { className: `w-5 h-5 ${charity.color}` })}
            </div>
        <div className="flex-1">
          <p className="text-xs text-gray-700 leading-relaxed">
            A <span className="font-bold text-gray-900">{charityPercentage}% donation</span> ({formatPrice(donationAmount, currency)}) of your payment goes to <span className="font-bold text-gray-900">{charity.name}</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

// Trust Badge Component
const TrustBadge = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-full shadow-sm">
      <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
      </svg>
      <span className="text-xs font-semibold text-green-700">Verified Expert</span>
    </div>
  );
};

// 100% Charity Badge Component
const CharityHeroBadge = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-400 rounded-full shadow-sm">
      <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
      </svg>
      <span className="text-xs font-bold text-amber-800">100% to Charity</span>
<Sparkles className="w-3.5 h-3.5 text-amber-600" />
    </div>
  );
};

// Living Avatar Component with breathing animation and particle field
const LivingAvatar = ({ avatarUrl, name, handle, isAcceptingQuestions, hasSocials, socials }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const avatarRef = React.useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if touch device (mobile)
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return; // Skip mouse tracking on mobile

    const handleMouseMove = (e) => {
      if (!avatarRef.current) return;
      
      const rect = avatarRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center (normalized to -1 to 1)
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      // Apply subtle parallax (max 12px movement)
      setMousePosition({
        x: deltaX * 12,
        y: deltaY * 12
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  const parallaxStyle = !isMobile ? {
    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
    transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
  } : {};

  return (
    <div className="flex items-start gap-4 -mt-16 md:-mt-18 relative z-10">
      <div 
        ref={avatarRef}
        className="relative flex-shrink-0 group"
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
      >
        {/* Ambient glow - enhanced with breathing */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-violet-400 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 living-breath"/>
        
        {/* Avatar container with breathing animation and parallax */}
        <div 
          className="relative living-breath-avatar"
          style={parallaxStyle}
        >
          {avatarUrl ? (
            <img 
              className="relative w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-white shadow-2xl" 
              src={avatarUrl}
              alt={(name || 'Expert') + "'s avatar"}
              onError={function(e) {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div 
            className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0" 
            style={{ display: avatarUrl ? 'none' : 'block' }}
          >
            <DefaultAvatar size={112} />
          </div>
        </div>
        
        {/* Activity indicator with pulse */}
        <div className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full border-4 border-white shadow-lg flex items-center justify-center living-status ${
          isAcceptingQuestions 
            ? 'bg-gradient-to-br from-green-400 to-green-500' 
            : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
        }`}>
          {isAcceptingQuestions ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Hover ring effect (desktop only) */}
        {!isMobile && isHovering && (
          <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 animate-ping" style={{ animationDuration: '2s' }} />
        )}
      </div>
      
      {/* Social Links */}
      {hasSocials && (
        <div className="pt-12 md:pt-14 flex-1">
          <div className="flex items-center justify-end gap-2 flex-wrap">
            {socials.twitter && (
              <SocialLink platform="twitter" url={socials.twitter} />
            )}
            {socials.linkedin && (
              <SocialLink platform="linkedin" url={socials.linkedin} />
            )}
            {socials.instagram && (
              <SocialLink platform="instagram" url={socials.instagram} />
            )}
            {socials.github && (
              <SocialLink platform="github" url={socials.github} />
            )}
            {socials.website && (
              <SocialLink platform="website" url={socials.website} />
            )}
          </div>
        </div>
      )}
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
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

 // ⭐ FIXED: Track UTM visit on page load WITH deduplication
  useEffect(() => {
    const trackVisit = async () => {
      if (!handle) return;

      // Extract UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmCampaign = urlParams.get('utm_campaign');
      const utmMedium = urlParams.get('utm_medium');
      const utmContent = urlParams.get('utm_content');

      // 🔍 DEBUG: Log what we found
      console.log('🔍 UTM Parameters detected:', {
        utm_source: utmSource,
        utm_campaign: utmCampaign,
        utm_medium: utmMedium,
        utm_content: utmContent,
        fullURL: window.location.href
      });

      // Only track if we have at least source and campaign
      if (utmSource && utmCampaign) {
        console.log('✅ Valid UTM params, checking for duplicates...');

        // 🆕 DEDUPLICATION: Check for recent visit to avoid duplicates
        const visitKey = `qc_visit_${handle}_${utmSource}_${utmCampaign}`;
        const lastVisitTime = localStorage.getItem(visitKey);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

        // Skip tracking if visited same campaign within last 30 minutes
        if (lastVisitTime && (now - parseInt(lastVisitTime)) < thirtyMinutes) {
          console.log('🔄 Visit already tracked recently (within 30 min), skipping duplicate');
          
          // Prepare UTM data object
          const utmData = {
            expert_handle: handle,
            utm_source: utmSource,
            utm_campaign: utmCampaign,
            utm_medium: utmMedium || '',
            utm_content: utmContent || ''
          };
          
          // Still store UTM params for question attribution
          localStorage.setItem('qc_utm_params', JSON.stringify(utmData));
          localStorage.setItem('qc_utm_timestamp', now.toString());
          return;
        }

        console.log('✅ No recent duplicate, tracking visit...');

        // Prepare UTM data object
        const utmData = {
          expert_handle: handle,
          utm_source: utmSource,
          utm_campaign: utmCampaign,
          utm_medium: utmMedium || '',
          utm_content: utmContent || ''
        };

        try {
          // Call tracking API
          const response = await fetch('https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/marketing/public/track-visit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(utmData)
          });

          const result = await response.json();
          console.log('📊 Track visit response:', result);

          // ⭐ Store visit timestamp for deduplication
          if (result.tracked) {
            console.log('💾 Storing visit timestamp and UTM params...');
            localStorage.setItem(visitKey, now.toString());
            localStorage.setItem('qc_utm_params', JSON.stringify(utmData));
            localStorage.setItem('qc_utm_timestamp', now.toString());
            
            // 🔍 DEBUG: Verify storage
            const stored = localStorage.getItem('qc_utm_params');
            console.log('✅ Verified localStorage:', stored);
          } else {
            console.warn('⚠️ Tracking response: tracked=false');
          }

        } catch (err) {
          console.error('❌ Failed to track UTM visit:', err);
          
          // ⭐ FALLBACK: Store in localStorage even if API fails
          // This ensures attribution still works if backend is temporarily down
          console.log('💾 Storing UTM params anyway (API failed)...');
          localStorage.setItem('qc_utm_params', JSON.stringify(utmData));
          localStorage.setItem('qc_utm_timestamp', now.toString());
        }
      } else {
        console.log('ℹ️ No UTM params in URL, skipping tracking');
      }
    };

    trackVisit();
  }, [handle]);

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
          'https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/public/profile?handle=' + encodeURIComponent(handle)
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

        // accepting_questions should default to true (experts are accepting by default)
        // Only set to false if explicitly set to false/0/"false" etc.
        const acceptingQuestions = ep.accepting_questions === false ||
                                   ep.accepting_questions === 0 ||
                                   ep.accepting_questions === '0' ||
                                   ep.accepting_questions === 'false'
                                   ? false
                                   : true;

        // Build tiers object from tier fields
        const tiers = {};

        // Quick Consult (Tier 1)
        if (ep.tier1_enabled !== false && ep.tier1_price_cents) {
          tiers.quick_consult = {
            enabled: true,
            price_cents: ep.tier1_price_cents,
            sla_hours: ep.tier1_sla_hours || 24,
            description: ep.tier1_description || 'Quick consultation for immediate questions'
          };
        }

        // Deep Dive (Tier 2)
        if (ep.tier2_enabled && ep.tier2_min_price_cents && ep.tier2_max_price_cents) {
          tiers.deep_dive = {
            enabled: true,
            min_price_cents: ep.tier2_min_price_cents,
            max_price_cents: ep.tier2_max_price_cents,
            sla_hours: ep.tier2_sla_hours || 48,
            description: ep.tier2_description || 'In-depth analysis with comprehensive report'
          };
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
          expertise: expertiseData,
          accepting_questions: acceptingQuestions,
          tiers: Object.keys(tiers).length > 0 ? tiers : null
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
    if (profile && !profile.accepting_questions) {
      return;
    }
    navigate('/ask?expert=' + handle);
  };

  const handleSelectTier = (tierType, tierConfig) => {
    if (profile && !profile.accepting_questions) {
      return;
    }
    // Navigate to question composer with tier information
    navigate(`/ask?expert=${handle}`, {
      state: {
        expert: handle,
        expertProfileId: profile.id,
        expertName: profile.name,
        tierType,
        tierConfig
      }
    });
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
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
              <span className="font-semibold text-gray-900">@{handle}</span> is not on mindPick yet.
            </p>
            <p className="text-gray-600 mb-6">
              But you can invite them to join!
            </p>
            
            <a href={'/invite?expert=' + encodeURIComponent(handle)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Invite {handle} to mindPick</span>
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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

      const isAcceptingQuestions = profile.accepting_questions;
      
      return (
        <React.Fragment>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Compact Header */}
            <div className="relative h-32 md:h-36 bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="currentColor" className="text-indigo-400"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)"/>
                </svg>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50"/>
              
              {/* Share & QR Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                  title="Show QR code"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                  title="Share profile"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="px-5 md:px-6 pb-28 md:pb-6 space-y-5">
              {/* Living Avatar Section */}
              <LivingAvatar 
                avatarUrl={profile.avatar_url}
                name={profile.name}
                handle={handle}
                isAcceptingQuestions={isAcceptingQuestions}
                hasSocials={hasSocials}
                socials={profile.socials}
              />

              {/* Name, Title */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
                    {profile.name || 'Expert'}
                  </h1>
                  {profile.charity_percentage === 100 ? (
                    <CharityHeroBadge />
                  ) : (
                    <TrustBadge />
                  )}
                </div>
                {profile.title && (
                  <p className="text-lg md:text-xl text-gray-600 font-medium leading-tight">
                    {profile.title}
                  </p>
                )}
                {profile.tagline && (
                  <p className="text-base text-gray-700 leading-relaxed">
                    {profile.tagline}
                  </p>
                )}
              </div>

              {/* Bio Section with Markdown */}
              {profile.bio && (
                <div className="prose prose-gray prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed text-base mb-3 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                      a: ({node, ...props}) => (
                        <a 
                          className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          {...props} 
                        />
                      ),
                      ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-700 text-base" {...props} />,
                    }}
                  >
                    {profile.bio}
                  </ReactMarkdown>
                </div>
              )}

              {/* Expertise Section */}
              {profile.expertise && profile.expertise.length > 0 && (
                <div className="space-y-3.5">
                  <h3 className="text-sm font-bold text-gray-900 tracking-wide">Ask me about</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.slice(0, 6).map(function(field, index) {
                      return (
                        <span 
                          key={index} 
                          className="group inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm hover:shadow-md cursor-default"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 group-hover:bg-indigo-500 transition-colors"/>
                          {field}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tier Selection */}
              {profile.tiers && isAcceptingQuestions ? (
                <TierSelector
                  tiers={profile.tiers}
                  expertName={profile.name}
                  onSelectTier={handleSelectTier}
                />
              ) : !isAcceptingQuestions ? (
                <div className="mt-6">
                  <button
                    disabled={true}
                    className="w-full bg-gray-300 text-gray-500 cursor-not-allowed opacity-60 font-bold py-4 px-6 rounded-xl"
                  >
                    <span>Temporarily Not Accepting Questions</span>
                  </button>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>This expert is currently not accepting new questions. Check back later!</span>
                    </div>
                  </div>
                </div>
              ) : null}

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

          {/* Trust Indicators */}
          <div className="pt-8 pb-4">
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">Secure payment</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">Guaranteed response</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span className="font-medium">Money-back guarantee</span>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }
    return null;
  };

  return (
<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex justify-center items-start sm:items-center p-4 pt-8 sm:pt-20 sm:p-6">
      <div className="w-full max-w-lg">
        {renderContent()}
        
        <div className="text-center mt-6 mb-6 pb-32 md:pb-0">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors group">
            <span>Powered by</span>
            <span className="font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
              mindPick
            </span>
          </a>
        </div>
      </div>

      {/* QR Code Modal */}
      {profile && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          profileUrl={window.location.href.split('?')[0]}
          expertName={profile.name || 'Expert'}
          handle={handle}
        />
      )}
    </div>
  );
}

export default PublicProfilePage;