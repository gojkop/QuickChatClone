// client/src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/api"; // from client/src/api/index.js

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const authed = authService.isAuthenticated();

  // Avoid redirects during OAuth or on the callback route itself
  const inProgress =
    typeof window !== "undefined" &&
    sessionStorage.getItem("qc_auth_in_progress") === "1";
  const onCallback = location.pathname.startsWith("/auth/callback");

  if (onCallback || inProgress) {
    // Render nothing (or a tiny loader) while the flow finishes
    return null;
  }

  if (!authed) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
}
