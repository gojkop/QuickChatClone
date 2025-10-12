// Centralized Xano configuration
// Single source of truth for all Xano URLs

// Main API base URL (auth, users, questions, answers)
export const XANO_BASE_URL = "https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ";

// Media/public API base URL (media assets, public profiles, feedback)
export const XANO_MEDIA_BASE_URL = "https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L";

// For backward compatibility
export default {
  BASE_URL: XANO_BASE_URL,
  MEDIA_BASE_URL: XANO_MEDIA_BASE_URL,
};
