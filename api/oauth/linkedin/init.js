// api/oauth/linkedin/init.js
// Generates LinkedIn OAuth authorization URL directly (no Xano dependency)

export default async function handler(req, res) {
  try {
    const CLIENT_PUBLIC_ORIGIN = process.env.CLIENT_PUBLIC_ORIGIN;
    const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;

    console.log('LinkedIn OAuth init - CLIENT_PUBLIC_ORIGIN:', CLIENT_PUBLIC_ORIGIN);

    if (!CLIENT_PUBLIC_ORIGIN) {
      console.error('CLIENT_PUBLIC_ORIGIN not set');
      return res.status(500).json({
        message: "Server configuration error: CLIENT_PUBLIC_ORIGIN missing"
      });
    }

    if (!LINKEDIN_CLIENT_ID) {
      console.error('LINKEDIN_CLIENT_ID not set');
      return res.status(500).json({
        message: "Server configuration error: LINKEDIN_CLIENT_ID missing"
      });
    }

    const redirect_uri = req.query.redirect_uri || `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;

    // Generate LinkedIn authorization URL directly
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', redirect_uri);
    authUrl.searchParams.append('scope', 'openid profile email');

    console.log('LinkedIn auth URL generated:', authUrl.toString());

    return res.status(200).json({ authUrl: authUrl.toString() });
  } catch (e) {
    console.error("LinkedIn OAuth init error:", e.message);
    return res.status(500).json({
      message: "LinkedIn OAuth init failed",
      error: e.message
    });
  }
}
