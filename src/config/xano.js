// Centralized Xano configuration
// Single source of truth for all Xano URLs

// Main API base URL (authenticated endpoints: auth, users, questions, answers, marketing)
export const XANO_BASE_URL = "https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ";

// Public API base URL (unauthenticated endpoints: check-handle, public profile, etc.)
export const XANO_PUBLIC_API_URL = "https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L";

// Note: Public API endpoints (LinkedIn OAuth, internal endpoints, public tracking)
// are handled by backend using XANO_PUBLIC_API_URL environment variable

// For backward compatibility
export default {
  BASE_URL: XANO_BASE_URL,
  PUBLIC_API_URL: XANO_PUBLIC_API_URL,
};
