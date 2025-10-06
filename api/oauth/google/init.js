// api/oauth/google/init.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { 
      CLIENT_PUBLIC_ORIGIN, 
      XANO_BASE_URL  
    } = process.env;

    // Check if environment variables are set
    if (!CLIENT_PUBLIC_ORIGIN) {
      console.error('CLIENT_PUBLIC_ORIGIN not set');
      return res.status(500).json({ message: "Server configuration error: CLIENT_PUBLIC_ORIGIN missing" });
    }

    if (!XANO_BASE_URL) {
      console.error('XANO_BASE_URL  not set');
      return res.status(500).json({ message: "Server configuration error: XANO_BASE_URL  missing" });
    }
    
    // Use redirect_uri from query params or construct from CLIENT_PUBLIC_ORIGIN
    const redirect_uri = req.query.redirect_uri || `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;

    console.log('OAuth init - redirect_uri:', redirect_uri);

    // Call Xano's init endpoint
    const r = await axios.get(`${XANO_BASE_URL}/api:fALBm5Ej/oauth/google/init`, {
      params: { redirect_uri }, 
      validateStatus: () => true
    });

    console.log('Xano response status:', r.status);
    console.log('Xano response data:', r.data);

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