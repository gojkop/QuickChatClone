// api/oauth/linkedin/continue.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ message: "Missing code" });
    }

    // Destructure from environment variables
    const CLIENT_PUBLIC_ORIGIN = process.env.CLIENT_PUBLIC_ORIGIN;
    const XANO_LINKEDIN_AUTH_BASE_URL = process.env.XANO_LINKEDIN_AUTH_BASE_URL || process.env.XANO_AUTH_BASE_URL;
    const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

    // Check if environment variables are set
    if (!CLIENT_PUBLIC_ORIGIN) {
      console.error('CLIENT_PUBLIC_ORIGIN not set');
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (!XANO_LINKEDIN_AUTH_BASE_URL) {
      console.error('XANO_LINKEDIN_AUTH_BASE_URL not set');
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Use /auth/callback as redirect URI
    const redirect_uri = `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;

    console.log('LinkedIn OAuth continue - code:', code?.substring(0, 10) + '...');
    console.log('LinkedIn OAuth continue - redirect_uri:', redirect_uri);

    // Exchange code for token at Xano
    const r = await axios.get(`${XANO_LINKEDIN_AUTH_BASE_URL}/oauth/linkedin/continue`, {
      params: { code },
      validateStatus: () => true
    });

    console.log('Xano LinkedIn continue response status:', r.status);

    if (r.status !== 200) {
      console.error('Xano LinkedIn continue error:', r.data);
      return res.status(r.status).json(r.data || { message: "LinkedIn OAuth continue failed" });
    }

    const token = r.data?.token || r.data?.authToken || r.data?.auth_token;
    if (!token) {
      console.error('No token in Xano LinkedIn response:', r.data);
      return res.status(500).json({ message: "No token from Xano LinkedIn continue" });
    }

    console.log('LinkedIn token received successfully');

    // Optional: Set cookie for future cookie-based auth
    if (COOKIE_DOMAIN) {
      res.setHeader("Set-Cookie", [
        `qc_session=${token}; HttpOnly; Secure; SameSite=None; Path=/; Domain=${COOKIE_DOMAIN}; Max-Age=${30*24*60*60}`
      ]);
    }

    return res.status(200).json({
      token,
      name: r.data?.name,
      email: r.data?.email,
      firstName: r.data?.firstName,
      lastName: r.data?.lastName
    });
  } catch (e) {
    console.error("LinkedIn OAuth continue error:", e.response?.data || e.message);
    return res.status(500).json({
      message: "LinkedIn OAuth continue failed",
      error: e.message
    });
  }
}
