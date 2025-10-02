import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import Page Components
import HomePage from '@/pages/HomePage';
import PricingPage from '@/pages/PricingPage';
import SocialImpactPage from '@/pages/SocialImpactPage';
import SignInPage from '@/pages/SignInPage';
import ConnectStripePage from '@/pages/ConnectStripePage';
import SetPriceSlaPage from '@/pages/SetPriceSlaPage';
import ExpertDashboardPage from '@/pages/ExpertDashboardPage'; // <-- ADD THIS
import PublicProfilePage from '@/pages/PublicProfilePage'; // <-- ADD THIS
import FaqPage from '@/pages/FaqPage'; // <-- ADD THIS
import TermsPage from '@/pages/TermsPage'; // <-- ADD THIS
import PrivacyPage from '@/pages/PrivacyPage'; // <-- ADD THIS
import InvitePage from '@/pages/InvitePage'; // <-- ADD THIS
import AskQuestionPage from '@/pages/AskQuestionPage'; // <-- ADD THIS
import QuestionSentPage from '@/pages/QuestionSentPage'; // <-- ADD THIS

// Import Common Components
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ProtectedRoute from '@/components/common/ProtectedRoute'; // <-- ADD THIS

const AppLayout = () => {
  const location = useLocation();
  const hideLayout = ['/connect_stripe', '/set-price-sla'].includes(location.pathname);

  return (
    <div className="App bg-brand-light-gray min-h-screen flex flex-col">
      {!hideLayout && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/social-impact" element={<SocialImpactPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/connect_stripe" element={<ConnectStripePage />} />
          <Route path="/set-price-sla" element={<SetPriceSlaPage />} />
          <Route path="/u/:handle" element={<PublicProfilePage />} /> {/* <-- ADD THIS */}
          <Route path="/faq" element={<FaqPage />} /> {/* <-- ADD THIS */}
          <Route path="/terms" element={<TermsPage />} /> {/* <-- ADD THIS */}
          <Route path="/privacy" element={<PrivacyPage />} /> {/* <-- ADD THIS */}
          <Route path="/invite" element={<InvitePage />} /> {/* <-- ADD THIS */}
          <Route path="/ask" element={<AskQuestionPage />} /> {/* <-- ADD THIS */}
          <Route path="/question-sent" element={<QuestionSentPage />} /> {/* <-- ADD THIS */}
          {/* Protected Route for the Dashboard */}
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
    </AuthProvider>
  );
}

export default App;