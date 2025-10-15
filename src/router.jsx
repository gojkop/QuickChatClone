// client/src/router.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import MagicLinkCallbackPage from "./pages/MagicLinkCallbackPage";
import ExpertDashboardPage from "./pages/ExpertDashboardPage";
import { authService } from "./api";

function RequireAuth({ children }) {
  return authService.isAuthenticated() ? children : <Navigate to="/signin" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route path="/auth/magic-link" element={<MagicLinkCallbackPage />} />
        <Route
          path="/expert"
          element={
            <RequireAuth>
              <ExpertDashboardPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
