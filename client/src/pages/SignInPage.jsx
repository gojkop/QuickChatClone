// client/src/pages/SignInPage.jsx
import React from "react";
import { AuthAPI } from "../api/auth";
import logo from "@/assets/images/logo-quickchat.png";

export default function SignInPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const onGoogleClick = async () => {
    setError("");
    setLoading(true);
    try {
      const { authUrl } = await AuthAPI.initGoogleOAuth();
      if (!authUrl) throw new Error("No authUrl returned from init endpoint.");
      window.location.assign(authUrl);
    } catch (e) {
      console.error("Google init failed", e);
      setError("Sign-in init failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Brand / Heading */}
        <div className="flex flex-col items-center">
          <img
            src={logo}
            alt="QuickChat"
            className="h-10 w-auto mb-4 select-none"
            draggable="false"
          />
          <h1 className="text-2xl font-bold text-gray-900">Expert Sign In</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monetize every “quick question”.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
          <button
            onClick={onGoogleClick}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 transition px-4 py-3"
          >
            {/* Google "G" icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.65 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.652-.389-3.917Z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.817C14.442 15.491 18.846 12 24 12c3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.165 0 10.241-1.959 13.943-5.657l-6.457-5.465C29.414 34.941 26.828 36 24 36c-5.205 0-9.618-3.317-11.281-7.949l-6.53 5.028C9.5 39.546 16.229 44 24 44Z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-1.65 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4c-7.682 0-14.344 4.337-17.694 10.691l6.571 4.817C14.442 15.491 18.846 12 24 12c3.059 0 5.842 1.153 7.957 3.043l5.657-5.657C34.842 6.012 29.689 4 24 4c-7.682 0-14.344 4.337-17.694 10.691Z"
              />
            </svg>

            <span className="font-medium">
              {loading ? "Opening Google…" : "Continue with Google"}
            </span>
          </button>

          {/* Inline loader that matches your attachment's style */}
          {loading && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          )}

          {/* Error text styled like the attachment */}
          {error && (
            <div className="text-red-600 mt-4 text-sm" role="alert">
              {error}
            </div>
          )}

          <p className="mt-6 text-[11px] leading-5 text-gray-500">
            By continuing you agree to the Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
