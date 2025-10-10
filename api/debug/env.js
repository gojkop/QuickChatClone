// api/debug/env.js
// ⚠️ REMOVE THIS AFTER DEBUGGING - Don't expose in production!

export default async function handler(req, res) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }

  return res.status(200).json({
    CLIENT_PUBLIC_ORIGIN: process.env.CLIENT_PUBLIC_ORIGIN,
    XANO_LINKEDIN_AUTH_BASE_URL: process.env.XANO_LINKEDIN_AUTH_BASE_URL || process.env.XANO_AUTH_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    // Don't expose secrets!
    hasLinkedInSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
    constructedRedirectUri: `${process.env.CLIENT_PUBLIC_ORIGIN}/auth/callback`
  });
}
