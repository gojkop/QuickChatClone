// client/src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FeatureFlagsProvider } from './context/FeatureFlagsContext';

// Import Page Components
import HomePage from '@/pages/HomePage';
import PricingPage from '@/pages/PricingPage';
import SocialImpactPage from '@/pages/SocialImpactPage';
import SignInPage from '@/pages/SignInPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';
import ExpertDashboardPage from '@/pages/ExpertDashboardPage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import FaqPage from '@/pages/FaqPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import InvitePage from '@/pages/InvitePage';
import InviteSentPage from '@/pages/InviteSentPage';
import AskQuestionPage from '@/pages/AskQuestionPage';
import QuestionSentPage from '@/pages/QuestionSentPage';
import AnswerReviewPage from '@/pages/AnswerReviewPage';
import TestAICoachPage from '@/pages/TestAICoachPage';
import FeedbackWidget from '@/components/common/FeedbackWidget';
import FeedbackDashboardPage from '@/pages/FeedbackDashboardPage'; 
import ExpertMarketingPage from '@/pages/ExpertMarketingPage';

// Import Common Components
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProtectedRoute from '@/components/common/ProtectedRoute';

const AppLayout = () => {
  const location = useLocation();
  
  // Hide navbar/footer on specific pages
  const hideLayout = [
    '/auth/callback',
    '/invite-sent',
    '/signin',
    '/question-sent'
  ].includes(location.pathname);
  
  // Also hide on pages with their own isolated design
  const isPublicProfile = location.pathname.startsWith('/u/');
  const isAnswerReview = location.pathname.startsWith('/r/');
  
  // Combined condition for hiding navbar/footer
  const shouldHideLayout = hideLayout || isPublicProfile || isAnswerReview;

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
          <Route path="/ask" element={<AskQuestionPage />} />
          <Route path="/question-sent" element={<QuestionSentPage />} />
          <Route path="/u/:handle" element={<PublicProfilePage />} />
          <Route path="/r/:token" element={<AnswerReviewPage />} />
          <Route path="/test-ai-coach" element={<TestAICoachPage />} />
          <Route path="/feedback-dashboard" element={<FeedbackDashboardPage />} /> 
          
          {/* Auth Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          {/* Protected Routes - Expert Dashboard and Marketing */}
          <Route 
            path="/expert" 
            element={
              <ProtectedRoute>
                <ExpertDashboardPage />
              </ProtectedRoute>
            } 
          />
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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FeatureFlagsProvider> 
        <AppLayout />
      </FeatureFlagsProvider>
    </AuthProvider>
  );
}

export default App;