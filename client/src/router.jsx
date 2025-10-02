// client/src/router.jsx  (REPLACE ENTIRE FILE)
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import ExpertDashboardPage from "./pages/ExpertDashboardPage"; // <-- your existing page

function RequireAuth({ children }) {
  const token = localStorage.getItem("auth_token");
  return token ? children : <Navigate to="/signin" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
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
