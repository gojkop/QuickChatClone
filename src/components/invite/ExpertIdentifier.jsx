import React, { useState, useEffect } from 'react';

function ExpertIdentifier({ onContinue, initialValue = '' }) {
  const [identifier, setIdentifier] = useState(initialValue);
  const [detectedType, setDetectedType] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [expertProfile, setExpertProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasCheckedHandle, setHasCheckedHandle] = useState(false);

  useEffect(() => {
    if (!identifier.trim()) {
      setDetectedType(null);
      setExpertProfile(null);
      setErrorMessage('');
      setHasCheckedHandle(false);
      return;
    }

    const value = identifier.trim();

    // Email detection
    if (value.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setDetectedType('email');
      setExpertProfile(null);
      setErrorMessage('');
      setHasCheckedHandle(false);
      return;
    }

    // LinkedIn URL detection
    if (value.includes('linkedin.com/')) {
      setDetectedType('linkedin');
      setExpertProfile(null);
      setErrorMessage('');
      setHasCheckedHandle(false);
      return;
    }

    // mindPick handle detection - ONLY if starts with @
    if (value.startsWith('@')) {
      const handleValue = value.substring(1);
      
      // Check if it looks like a handle (single word, no spaces, alphanumeric + hyphens/underscores)
      if (/^[a-zA-Z0-9_-]+$/.test(handleValue) && handleValue.length > 0) {
        setDetectedType('handle');
        // Don't check automatically - wait for Enter key
        return;
      }
    }

    // Otherwise treat as name (multiple words or contains spaces or doesn't start with @)
    setDetectedType('name');
    setExpertProfile(null);
    setErrorMessage('');
    setHasCheckedHandle(false);
  }, [identifier]);

  const checkmindPickHandle = async (handle) => {
    setIsChecking(true);
    setErrorMessage('');
    setExpertProfile(null);
    setHasCheckedHandle(true);
    
    try {
      const response = await fetch(
        `https://x8ki-letl-twmt.n7.xano.io/api:BQW1GS7L/public/profile?handle=${encodeURIComponent(handle)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const ep = data?.expert_profile ?? data;
        
        // Check if profile is public
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
        
        const publicValue = ep?.public ?? ep?.is_public ?? ep?.isPublic;
        const isPublic = coercePublic(publicValue);
        
        if (isPublic) {
          setExpertProfile({
            handle: ep.handle,
            name: ep.name,
            title: ep.professional_title || ep.title,
            avatar_url: ep.avatar_url
          });
        } else {
          // Profile exists but is private - treat as name
          setDetectedType('name');
          setErrorMessage('This handle exists but the profile is private. You can still invite them by name.');
        }
      } else {
        // Handle doesn't exist
        setErrorMessage('No expert found with this handle. You can still send them an invitation.');
      }
    } catch (error) {
      console.error('Error checking handle:', error);
      setErrorMessage('Could not check handle. You can still send an invitation.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      
      // If it's a handle type and we haven't checked yet, check now
      if (detectedType === 'handle' && !hasCheckedHandle && !isChecking) {
        const handleValue = identifier.trim().substring(1); // Remove @
        checkmindPickHandle(handleValue);
      } else if (!expertProfile) {
        // If not a handle or already checked, continue to next step
        handleContinue();
      }
    }
  };

  const handleContinue = () => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter who you want to ask');
      return;
    }

    // If expert exists on mindPick, don't continue - user should use button to visit profile
    if (expertProfile) {
      return;
    }

    onContinue({
      identifier: identifier.trim(),
      type: detectedType,
      name: extractName()
    });
  };

  const extractName = () => {
    const value = identifier.trim();
    
    if (detectedType === 'email') {
      return value.split('@')[0].replace(/[._-]/g, ' ');
    }
    
    if (detectedType === 'linkedin') {
      const match = value.match(/linkedin\.com\/in\/([^\/]+)/);
      return match ? match[1].replace(/-/g, ' ') : 'this person';
    }

    if (detectedType === 'handle') {
      return value.startsWith('@') ? value.substring(1) : value;
    }
    
    // For name type
    return value;
  };

  const getPlaceholder = () => {
    return "Email, @handle, LinkedIn URL, or their name";
  };

  const getIconForType = () => {
    switch (detectedType) {
      case 'email':
        return (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5 text-info" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'handle':
        return expertProfile ? (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'name':
        return (
          <svg className="w-5 h-5 text-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (detectedType) {
      case 'email': return 'Email detected';
      case 'linkedin': return 'LinkedIn profile';
      case 'handle': 
        if (expertProfile) return 'Expert found on mindPick!';
        if (hasCheckedHandle) return 'Handle checked';
        return 'mindPick handle - Press Enter to check';
      case 'name': return 'Name';
      default: return null;
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-gray-200 shadow-elev-1 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink mb-2">Who would you like to ask?</h2>
        <p className="text-subtext">Enter their email, @handle, LinkedIn, or name</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition text-lg"
            autoFocus
          />
          
          {detectedType && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isChecking ? (
                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              ) : (
                getIconForType()
              )}
            </div>
          )}
        </div>

        {detectedType && !errorMessage && !expertProfile && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-canvas rounded-lg">
              {getIconForType()}
              <span className="font-medium text-subtext">{getTypeLabel()}</span>
            </div>
          </div>
        )}

        {/* Handle check prompt */}
        {detectedType === 'handle' && !hasCheckedHandle && !expertProfile && (
          <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
            <svg className="w-5 h-5 text-info flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-info font-medium">
                Press <kbd className="px-2 py-0.5 bg-surface border border-info/30 rounded text-xs font-mono">Enter</kbd> to check if this expert is on mindPick
              </p>
            </div>
          </div>
        )}

        {/* Expert Found on mindPick */}
        {expertProfile && (
          <div className="bg-gradient-to-br from-success/5 to-success/10 border-2 border-success/40 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              {expertProfile.avatar_url ? (
                <img 
                  src={expertProfile.avatar_url} 
                  alt={expertProfile.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-success/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {expertProfile.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-ink">{expertProfile.name}</h3>
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                {expertProfile.title && (
                  <p className="text-sm text-subtext font-medium">{expertProfile.title}</p>
                )}
                <p className="text-sm text-success font-semibold mt-2">
                  @{expertProfile.handle} is already on mindPick!
                </p>
              </div>
            </div>

            <div className="bg-surface/80 rounded-lg p-4 mb-4">
              <p className="text-sm text-subtext leading-relaxed">
                <span className="font-semibold text-ink">Great news!</span> You can ask them directly without needing to send an invitation. Visit their profile to see their expertise and rates.
              </p>
            </div>

            <a
              href={`/u/${expertProfile.handle}`}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 px-6"
            >
              <span>Visit {expertProfile.name || expertProfile.handle}'s Profile</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-warning">{errorMessage}</p>
          </div>
        )}

        {!identifier && (
          <div className="mt-6 p-4 bg-canvas rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-subtext mb-3">Examples:</p>
            <div className="space-y-2 text-sm text-subtext">
              <button 
                onClick={() => setIdentifier('@johndoe')}
                className="flex items-center gap-2 hover:text-primary transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>@johndoe (mindPick handle)</span>
              </button>
              <button 
                onClick={() => setIdentifier('sarah@example.com')}
                className="flex items-center gap-2 hover:text-primary transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>sarah@example.com</span>
              </button>
              <button 
                onClick={() => setIdentifier('linkedin.com/in/johndoe')}
                className="flex items-center gap-2 hover:text-primary transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>linkedin.com/in/johndoe</span>
              </button>
              <button 
                onClick={() => setIdentifier('Jane Smith')}
                className="flex items-center gap-2 hover:text-primary transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Jane Smith</span>
              </button>
            </div>
          </div>
        )}

        {/* Continue Button - Only show if expert NOT found */}
        {!expertProfile && (
          <button
            onClick={handleContinue}
            disabled={!identifier.trim() || isChecking}
            className="btn btn-primary w-full py-4 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Continue to Compose Question'}
          </button>
        )}
      </div>
    </div>
  );
}

export default ExpertIdentifier;
