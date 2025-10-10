// api/debug/check-env.js
// Production-safe version

export default async function handler(req, res) {
  // Add a simple auth check if you want
  // For now, just allow it since you need to debug
  
  return res.status(200).json({
    CLIENT_PUBLIC_ORIGIN: process.env.CLIENT_PUBLIC_ORIGIN,
    XANO_LINKEDIN_AUTH_BASE_URL: process.env.XANO_LINKEDIN_AUTH_BASE_URL,
    XANO_AUTH_BASE_URL: process.env.XANO_AUTH_BASE_URL,
    constructedRedirectUri: `${process.env.CLIENT_PUBLIC_ORIGIN}/auth/callback`,
    expectedRedirectUri: 'https://mindpick.me/auth/callback',
    timestamp: new Date().toISOString()
  });
}
