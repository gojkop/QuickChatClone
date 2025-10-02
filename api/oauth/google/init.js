const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const { CLIENT_PUBLIC_ORIGIN, OAUTH_REDIRECT_PATH = "/connect_stripe", XANO_API_BASE_URL } = process.env;
    const redirect_uri = new URL(OAUTH_REDIRECT_PATH, CLIENT_PUBLIC_ORIGIN).toString();

    // Your Xano "init" is GET with ?redirect_uri=
    const r = await axios.get(`${XANO_API_BASE_URL}/api:fALBm5Ej/oauth/google/init`, {
      params: { redirect_uri }, validateStatus: () => true
    });

    const authUrl = r.data?.authUrl || r.data?.url || r.data;
    if (!authUrl) return res.status(500).json({ message: "No authUrl from Xano" });

    res.json({ authUrl });
  } catch (e) {
    console.error("init error:", e.response?.data || e.message);
    res.status(500).json({ message: "OAuth init failed" });
  }
};
