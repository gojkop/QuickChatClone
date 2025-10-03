// client/src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';

// Import Page Components
import HomePage from '@/pages/HomePage';
import PricingPage from '@/pages/PricingPage';
import SocialImpactPage from '@/pages/SocialImpactPage';
import SignInPage from '@/pages/SignInPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage'; // NEW - replaces ConnectStripePage
import ExpertDashboardPage from '@/pages/ExpertDashboardPage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import FaqPage from '@/pages/FaqPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import InvitePage from '@/pages/InvitePage';
import InviteSentPage from '@/pages/InviteSentPage'; // NEW
import AskQuestionPage from '@/pages/AskQuestionPage';
import QuestionSentPage from '@/pages/QuestionSentPage';

// Import Common Components
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProtectedRoute from '@/components/common/ProtectedRoute';

const AppLayout = () => {
  const location = useLocation();
  // Hide navbar/footer only on OAuth callback page (and invite-sent)
  const hideLayout = ['/auth/callback', '/invite-sent'].includes(location.pathname);

  return (
    <div className="App bg-brand-light-gray min-h-screen flex flex-col">
      {!hideLayout && <Navbar />}
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
          <Route path="/invite-sent" element={<InviteSentPage />} /> {/* NEW */}
          <Route path="/ask" element={<AskQuestionPage />} />
          <Route path="/question-sent" element={<QuestionSentPage />} />
          <Route path="/u/:handle" element={<PublicProfilePage />} />
          
          {/* Auth Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} /> {/* NEW */}

          {/* Protected Routes */}
          <Route 
            path="/expert" 
            element={
              <ProtectedRoute>
                <ExpertDashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppLayout />
      {/* Track only in production to avoid double events in dev */}
      {import.meta.env.PROD && <Analytics />}
    </AuthProvider>
  );
}

export default App;
