// api/oauth/google/init.js
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const { 
      CLIENT_PUBLIC_ORIGIN, 
      XANO_API_BASE_URL 
    } = process.env;
    
    // NEW: Redirect to /auth/callback instead of /connect_stripe
    const redirect_uri = `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;

    // Call Xano's init endpoint
    const r = await axios.get(`${XANO_API_BASE_URL}/api:fALBm5Ej/oauth/google/init`, {
      params: { redirect_uri }, 
      validateStatus: () => true
    });

    const authUrl = r.data?.authUrl || r.data?.url || r.data;
    if (!authUrl) {
      return res.status(500).json({ message: "No authUrl from Xano" });
    }

    res.json({ authUrl });
  } catch (e) {
    console.error("OAuth init error:", e.response?.data || e.message);
    res.status(500).json({ message: "OAuth init failed" });
  }
};