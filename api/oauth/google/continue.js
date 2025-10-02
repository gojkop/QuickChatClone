// api/oauth/google/continue.js
const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ message: "Missing code" });
    }

    const { 
      CLIENT_PUBLIC_ORIGIN, 
      XANO_API_BASE_URL, 
      COOKIE_DOMAIN 
    } = process.env;
    
    // NEW: Use /auth/callback as redirect URI
    const redirect_uri = `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;

    // Exchange code for token at Xano
    const r = await axios.get(`${XANO_API_BASE_URL}/api:fALBm5Ej/oauth/google/continue`, {
      params: { code, redirect_uri }, 
      validateStatus: () => true
    });

    if (r.status !== 200) {
      return res.status(r.status).json(r.data || { message: "OAuth continue failed" });
    }

    const token = r.data?.token || r.data?.authToken || r.data?.auth_token;
    if (!token) {
      return res.status(500).json({ message: "No token from Xano continue" });
    }

    // Optional: Set cookie for future cookie-based auth
    res.setHeader("Set-Cookie", [
      `qc_session=${token}; HttpOnly; Secure; SameSite=None; Path=/; Domain=${COOKIE_DOMAIN}; Max-Age=${30*24*60*60}`
    ]);

    res.json({ 
      token, 
      name: r.data?.name, 
      email: r.data?.email 
    });
  } catch (e) {
    console.error("OAuth continue error:", e.response?.data || e.message);
    res.status(500).json({ message: "OAuth continue failed" });
  }
};