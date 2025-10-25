// client/src/App.jsx
import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // ← NEW
import { CookieConsentProvider } from './context/CookieConsentContext';
import { AuthProvider } from './context/AuthContext';
import { FeatureFlagsProvider } from './context/FeatureFlagsContext';
import { ProfileProvider } from './context/ProfileContext'; // ← NEW

// Import Page Components
import HomePage from '@/pages/HomePage';
import PricingPage from '@/pages/PricingPage';
import SocialImpactPage from '@/pages/SocialImpactPage';
import SignInPage from '@/pages/SignInPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';
import MagicLinkCallbackPage from '@/pages/MagicLinkCallbackPage';
import ExpertDashboardPage from '@/pages/ExpertDashboardPage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import FaqPage from '@/pages/FaqPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import InvitePage from '@/pages/InvitePage';
import InviteSentPage from '@/pages/InviteSentPage';
import QuestionSentPage from '@/pages/QuestionSentPage';
import AnswerReviewPage from '@/pages/AnswerReviewPage';
import FeedbackWidget from '@/components/common/FeedbackWidget';
import FeedbackDashboardPage from '@/pages/FeedbackDashboardPage'; 
import ExpertMarketingPage from '@/pages/ExpertMarketingPage';
import HowItWorksPage from '@/pages/HowItWorksPage';
import CookieConsentBanner from '@/components/common/CookieConsentBanner';
import AskQuestionPageV2 from '@/pages/AskQuestionPageV2';
import ExpertDashboardPageV2 from '@/pages/ExpertDashboardPageV2';
import ExpertInboxPage from '@/pages/ExpertInboxPage';
import ExpertAnalyticsPage from '@/pages/ExpertAnalyticsPage';
import ProfileSettingsPage from '@/pages/ProfileSettingsPage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';

// Import Common Components
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// ← NEW: Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus by default
      retry: 1, // Retry failed requests once
    },
  },
});

const AppLayout = () => {
  const location = useLocation();
  
  // Hide navbar/footer on specific pages
  const hideLayout = [
    '/auth/callback',
    '/auth/magic-link',
    '/invite-sent',
    '/signin',
    '/question-sent'
  ].includes(location.pathname);

  const RedirectWithParams = () => {
    const location = useLocation();
    return <Navigate to={{
      pathname: '/ask-v2',
      search: location.search,
      hash: location.hash
    }} replace />;
  };

  
  // Also hide on pages with their own isolated design
  const isPublicProfile = location.pathname.startsWith('/u/');
  const isAnswerReview = location.pathname.startsWith('/r/');
  const isDashboardV2 = location.pathname.startsWith('/dashboard');

  
  // Combined condition for hiding navbar/footer
  const shouldHideLayout = hideLayout || isPublicProfile || isAnswerReview || isDashboardV2;

  return (
    <div className="App bg-canvas min-h-screen flex flex-col">
      {!shouldHideLayout && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/social-impact" element={<SocialImpactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/invite-sent" element={<InviteSentPage />} />
          <Route path="/ask" element={<RedirectWithParams />} />
          <Route path="/question-sent" element={<QuestionSentPage />} />
          <Route path="/u/:handle" element={<PublicProfilePage />} />
          <Route path="/r/:token" element={<AnswerReviewPage />} />
          <Route path="/feedback-dashboard" element={<FeedbackDashboardPage />} /> 
          <Route path="/how-it-works" element={<HowItWorksPage />} /> 
          <Route path="/ask-v2" element={<AskQuestionPageV2 />} />

          
          {/* Auth Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
          <Route path="/auth/magic-link" element={<MagicLinkCallbackPage />} />

          {/* Protected Routes - Expert Dashboard (Legacy) */}
          <Route 
            path="/expert" 
            element={
              <ProtectedRoute>
                <ExpertDashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* ← NEW: Dashboard V2 Routes with ProfileProvider */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ProfileProvider>
                  <ExpertDashboardPageV2 />
                </ProfileProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/inbox" 
            element={
              <ProtectedRoute>
                <ProfileProvider>
                  <ExpertInboxPage />
                </ProfileProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/analytics" 
            element={
              <ProtectedRoute>
                <ProfileProvider>
                  <ExpertAnalyticsPage />
                </ProfileProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              <ProtectedRoute>
                <ProfileProvider>
                  <ProfileSettingsPage />
                </ProfileProvider>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/account" 
            element={
              <ProtectedRoute>
                <ProfileProvider>
                  <AccountSettingsPage />
                </ProfileProvider>
              </ProtectedRoute>
            } 
          />

          {/* Marketing (legacy - no ProfileProvider needed) */}
          <Route 
            path="/expert/marketing" 
            element={
              <ProtectedRoute>
                <ExpertMarketingPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!shouldHideLayout && <Footer />}
      {(import.meta.env.MODE === 'development' || 
        import.meta.env.VITE_SHOW_FEEDBACK === 'true') && (
        <FeedbackWidget />
      )}
      <CookieConsentBanner /> 
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}> {/* ← NEW: Wrap with QueryClientProvider */}
      <CookieConsentProvider>
        <AuthProvider>
          <FeatureFlagsProvider>
            <AppLayout />
          </FeatureFlagsProvider>
        </AuthProvider>
      </CookieConsentProvider>
    </QueryClientProvider>
  );
}

export default App;