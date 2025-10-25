import React from 'react';
import { useAuth } from '@/context/AuthContext';

function WelcomeHero() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name?.split(' ')[0] || 'Expert';

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-black text-gray-900 mb-2">
        {getGreeting()}, {userName}! 👋
      </h1>
      <p className="text-gray-600">
        Here's what's happening with your expert profile today.
      </p>
    </div>
  );
}

export default WelcomeHero;