import React from "react";
import { AuthAPI } from "../api/auth";

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
    <main style={{ maxWidth: 560, margin: "40px auto", padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Expert Sign In</h1>
      <p style={{ marginBottom: 24 }}>
        Monetize every “quick question”. Continue with Google to get started.
      </p>

      <button
        onClick={onGoogleClick}
        disabled={loading}
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid #ccc",
          cursor: loading ? "default" : "pointer",
          width: "100%",
          fontSize: 16
        }}
      >
        {loading ? "Opening Google…" : "Continue with Google"}
      </button>

      {error && <div style={{ color: "#b00020", marginTop: 12 }}>{error}</div>}
    </main>
  );
}
