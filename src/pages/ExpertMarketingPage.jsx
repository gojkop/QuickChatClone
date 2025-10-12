import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeature } from '@/hooks/useFeature';
import { useMarketing } from '@/hooks/useMarketing';
import MarketingLayout from '@/components/dashboard/marketing/MarketingLayout';

export default function ExpertMarketingPage() {
  const navigate = useNavigate();
  const { isEnabled: marketingEnabled, loading: featureFlagLoading } = useFeature('marketing_module');
  const marketingData = useMarketing();

  // 🔐 AUTH CHECK: Redirect if not authenticated
  useEffect(() => {
    const checkAuth = () => {
      // Option 1: Check for token (adjust based on your auth implementation)
      const token = localStorage.getItem('auth_token');
      
      // Option 2: Check for user data
      // const userData = localStorage.getItem('user');
      
      if (!token) {
        console.log('Not authenticated, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Loading state
  if (featureFlagLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-subtext">Loading...</p>
        </div>
      </div>
    );
  }

  // Feature disabled
  if (!marketingEnabled) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Marketing Module</h2>
          <p className="text-subtext mb-4">
            The Marketing Module is currently in beta. Check back soon!
          </p>
          <button
            onClick={() => navigate('/expert')}
            className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-base"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <MarketingLayout {...marketingData} />;
}