import React, { useState, useEffect } from 'react';

function ExpertIdentifier({ onContinue, initialValue = '' }) {
  const [identifier, setIdentifier] = useState(initialValue);
  const [detectedType, setDetectedType] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [expertExists, setExpertExists] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!identifier.trim()) {
      setDetectedType(null);
      setExpertExists(null);
      setErrorMessage('');
      return;
    }

    const value = identifier.trim();

    if (value.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setDetectedType('email');
      checkIfExpertExists(value);
      return;
    }

    if (value.includes('linkedin.com/')) {
      setDetectedType('linkedin');
      setExpertExists(null);
      return;
    }

    if (value.startsWith('@')) {
      setDetectedType('social');
      setExpertExists(null);
      return;
    }

    setDetectedType('name');
    setExpertExists(null);
  }, [identifier]);

  const checkIfExpertExists = async (email) => {
    setIsChecking(true);
    setErrorMessage('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const exists = Math.random() < 0.2;
      setExpertExists(exists);
      
      if (exists) {
        setErrorMessage('This person is already on QuickChat! Redirecting to their profile...');
        setTimeout(() => {
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking expert:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinue = () => {
    if (!identifier.trim()) {
      setErrorMessage('Please enter who you want to ask');
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
    
    if (detectedType === 'social') {
      return value.substring(1);
    }
    
    if (detectedType === 'linkedin') {
      const match = value.match(/linkedin\.com\/in\/([^\/]+)/);
      return match ? match[1].replace(/-/g, ' ') : 'this person';
    }
    
    return value;
  };

  const getPlaceholder = () => {
    return "email@example.com, @username, or LinkedIn URL";
  };

  const getIconForType = () => {
    switch (detectedType) {
      case 'email':
        return (
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'social':
        return (
          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        );
      case 'name':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      case 'social': return 'Social handle';
      case 'name': return 'Name';
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Who would you like to ask?</h2>
        <p className="text-gray-600">Enter their email, LinkedIn, social handle, or name</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none transition text-lg"
            autoFocus
          />
          
          {detectedType && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isChecking ? (
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                getIconForType()
              )}
            </div>
          )}
        </div>

        {detectedType && !errorMessage && !expertExists && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              {getIconForType()}
              <span className="font-medium text-gray-700">{getTypeLabel()}</span>
            </div>
          </div>
        )}

        {expertExists && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-green-900">Great news!</p>
              <p className="text-sm text-green-700 mt-1">This person is already on QuickChat. You can ask them directly without needing to invite them.</p>
            </div>
          </div>
        )}

        {errorMessage && !expertExists && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {!identifier && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Examples:</p>
            <div className="space-y-2 text-sm text-gray-600">
              <button 
                onClick={() => setIdentifier('sarah@example.com')}
                className="flex items-center gap-2 hover:text-indigo-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>sarah@example.com</span>
              </button>
              <button 
                onClick={() => setIdentifier('linkedin.com/in/johndoe')}
                className="flex items-center gap-2 hover:text-indigo-600 transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>linkedin.com/in/johndoe</span>
              </button>
              <button 
                onClick={() => setIdentifier('@marketingpro')}
                className="flex items-center gap-2 hover:text-indigo-600 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span>@marketingpro</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!identifier.trim() || isChecking || expertExists}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isChecking ? 'Checking...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default ExpertIdentifier;