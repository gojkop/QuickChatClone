import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlowContainer from '@/components/question-flow-v2/layout/FlowContainer';
import { useFlowState } from '@/components/question-flow-v2/hooks/useFlowState';

function AskQuestionPageV2() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expert, setExpert] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

// Tier info from navigation state
const tierInfo = location.state || {};

// TESTING: Allow tier override via URL parameter
const params = new URLSearchParams(location.search);
const urlTierType = params.get('tier');

// Determine actual tier to use
let tierType = urlTierType || tierInfo.tierType;
let tierConfig = tierInfo.tierConfig;

// Mock tier config for testing if coming from URL
if (urlTierType) {
  if (tierType === 'deep_dive') {
    tierConfig = {
      sla_hours: 48,
      min_price_cents: 5000, // $50
      max_price_cents: 50000, // $500
    };
  } else if (tierType === 'quick_consult') {
    tierConfig = {
      sla_hours: 24,
      price_cents: 10000, // $100
    };
  }
}
  // Fetch expert profile
  React.useEffect(() => {
    const fetchExpertProfile = async () => {
      const params = new URLSearchParams(location.search);
      const handle = params.get('expert');

      if (!handle) {
        setError('No expert specified.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/public/profile?handle=${encodeURIComponent(handle)}`
        );

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Expert not found.' : 'Could not load expert.');
        }

        const data = await response.json();
        const expertProfile = data?.expert_profile ?? data;
        const isPublic = expertProfile?.public === true || expertProfile?.public === 1;
        const isAcceptingQuestions = expertProfile?.accepting_questions === true || expertProfile?.accepting_questions === 1;

        if (!isPublic) throw new Error('This expert profile is private.');
        if (!isAcceptingQuestions) {
          navigate(`/u/${handle}`, { replace: true });
          return;
        }

        setExpert({
          ...expertProfile,
          user: data?.user ?? expertProfile?.user,
          name: expertProfile?.name ?? data?.user?.name,
          accepting_questions: isAcceptingQuestions,
        });
      } catch (err) {
        setError(err.message || 'Could not load expert details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpertProfile();
  }, [location.search, navigate]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-20 pt-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expert details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-20 pt-32">
        <div className="max-w-3xl mx-auto text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
            Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 pt-24 sm:pt-32 pb-32">
      <FlowContainer 
        expert={expert}
        tierType={tierType}
        tierConfig={tierConfig}
      />
    </main>
  );
}

export default AskQuestionPageV2;