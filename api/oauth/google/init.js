// api/oauth/google/init.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Destructure directly from process.env - this works in Vercel
    const CLIENT_PUBLIC_ORIGIN = process.env.CLIENT_PUBLIC_ORIGIN;
    const XANO_GOOGLE_AUTH_BASE_URL = process.env.XANO_GOOGLE_AUTH_BASE_URL || process.env.XANO_AUTH_BASE_URL;

    // Check if environment variables are set
    if (!CLIENT_PUBLIC_ORIGIN) {
      console.error('CLIENT_PUBLIC_ORIGIN not set');
      return res.status(500).json({ message: "Server configuration error: CLIENT_PUBLIC_ORIGIN missing" });
    }

    if (!XANO_GOOGLE_AUTH_BASE_URL) {
      console.error('XANO_GOOGLE_AUTH_BASE_URL not set');
      return res.status(500).json({ message: "Server configuration error: XANO_GOOGLE_AUTH_BASE_URL missing" });
    }
    
    // Use redirect_uri from query params or construct from CLIENT_PUBLIC_ORIGIN
    const redirect_uri = req.query.redirect_uri || `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;

    console.log('OAuth init - redirect_uri:', redirect_uri);
    console.log('XANO_GOOGLE_AUTH_BASE_URL:', XANO_GOOGLE_AUTH_BASE_URL);

    // Call Xano's init endpoint
    const r = await axios.get(`${XANO_GOOGLE_AUTH_BASE_URL}/oauth/google/init`, {
      params: { redirect_uri }, 
      validateStatus: () => true
    });

    console.log('Xano response status:', r.status);
    console.log('Xano response data:', r.data);

    if (r.status !== 200) {
      console.error('Xano init error:', r.data);
      return res.status(r.status).json(r.data || { message: "OAuth init failed" });
    }

    const authUrl = r.data?.authUrl || r.data?.url || r.data;
    
    if (!authUrl) {
      console.error('No authUrl returned from Xano');
      return res.status(500).json({ message: "No authUrl from Xano" });
    }

    return res.status(200).json({ authUrl });
  } catch (e) {
    console.error("OAuth init error:", e.response?.data || e.message);
    return res.status(500).json({ 
      message: "OAuth init failed",
      error: e.message 
    });
  }
}
