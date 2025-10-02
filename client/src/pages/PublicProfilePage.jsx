import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '@/api';

// Helper to format price from cents
const formatPrice = (cents, currency = 'USD') => {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '$';
  const amount = (cents || 0) / 100;
  return `${symbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
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
        // This public endpoint doesn't require auth
        // Endpoint from profile.html
        const response = await apiClient.get(`/3B14WLbJ/public/profile?handle=${handle}`);
        if (!response.data || !response.data.public) {
          throw new Error('This profile is private or does not exist.');
        }
        setProfile(response.data);
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
    // Navigate to the question creation page, passing the expert's handle
    navigate(`/ask?expert=${handle}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading profile…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-gray-500">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">{error}</h2>
          <p className="mt-2 text-gray-600 text-sm">Please check the URL or try again later.</p>
        </div>
      );
    }

    if (profile) {
      return (
        <>
          <div className="text-center">
            <img 
              className="w-28 h-28 mx-auto rounded-full object-cover ring-4 ring-white/50" 
              src={profile.user?.avatar_url || `https://i.pravatar.cc/112?u=${profile.handle}`}
              alt={`${profile.user?.name || 'Expert'}'s avatar`}
            />
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-violet">
              {profile.user?.name || 'Expert'}
            </h1>
            <p className="mt-2 text-gray-700">{profile.bio}</p>
          </div>
          <div className="mt-6 p-4 bg-white/50 rounded-lg border border-white/30">
            <div className="flex justify-between items-center text-gray-800">
              <span className="text-sm">Response Time:</span>
              <span className="font-semibold text-base">{profile.sla_hours} hours</span>
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={handleAskQuestion}
              className="w-full text-lg font-bold py-3 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:scale-105"
            >
              Ask for {formatPrice(profile.price_cents, profile.currency)}
            </button>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/30 shadow-lg">
          {renderContent()}
        </div>
        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors group">
            Powered by <span className="font-bold text-indigo-600 group-hover:underline">QuickChat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PublicProfilePage;