// api/oauth/google/continue.js
import axios from 'axios';
import { sendSignInNotification } from '../lib/zeptomail.js';

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ message: "Missing code" });
    }

    // Destructure directly from process.env
    const CLIENT_PUBLIC_ORIGIN = process.env.CLIENT_PUBLIC_ORIGIN;
    const XANO_GOOGLE_AUTH_BASE_URL = process.env.XANO_GOOGLE_AUTH_BASE_URL || process.env.XANO_AUTH_BASE_URL;
    const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

    // Check if environment variables are set
    if (!CLIENT_PUBLIC_ORIGIN) {
      console.error('CLIENT_PUBLIC_ORIGIN not set');
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (!XANO_GOOGLE_AUTH_BASE_URL) {
      console.error('XANO_GOOGLE_AUTH_BASE_URL not set');
      return res.status(500).json({ message: "Server configuration error" });
    }
    
    // Use /auth/callback as redirect URI
    const redirect_uri = `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;

    console.log('OAuth continue - code:', code?.substring(0, 10) + '...');
    console.log('OAuth continue - redirect_uri:', redirect_uri);

    // Exchange code for token at Xano
    const r = await axios.get(`${XANO_GOOGLE_AUTH_BASE_URL}/oauth/google/continue`, {
      params: { code },
      validateStatus: () => true
    });

    console.log('Xano continue response status:', r.status);

    if (r.status !== 200) {
      console.error('Xano continue error:', r.data);
      return res.status(r.status).json(r.data || { message: "OAuth continue failed" });
    }

    const token = r.data?.token || r.data?.authToken || r.data?.auth_token;
    if (!token) {
      console.error('No token in Xano response:', r.data);
      return res.status(500).json({ message: "No token from Xano continue" });
    }

    console.log('Token received successfully');

    // Optional: Set cookie for future cookie-based auth
    if (COOKIE_DOMAIN) {
      res.setHeader("Set-Cookie", [
        `qc_session=${token}; HttpOnly; Secure; SameSite=None; Path=/; Domain=${COOKIE_DOMAIN}; Max-Age=${30*24*60*60}`
      ]);
    }

    // Send sign-in notification email (non-blocking)
    const userEmail = r.data?.email;
    const userName = r.data?.name;

    if (userEmail) {
      sendSignInNotification({ email: userEmail, name: userName })
        .then(() => console.log('✅ Sign-in notification sent'))
        .catch((err) => console.error('❌ Failed to send sign-in notification:', err.message));
    }

    return res.status(200).json({
      token,
      name: r.data?.name,
      email: r.data?.email
    });
  } catch (e) {
    console.error("OAuth continue error:", e.response?.data || e.message);
    return res.status(500).json({ 
      message: "OAuth continue failed",
      error: e.message 
    });
  }
}
