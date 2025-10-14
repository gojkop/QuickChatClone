// api/oauth/google/continue.js
import axios from 'axios';

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
    console.log('Xano continue response data:', JSON.stringify(r.data, null, 2));

    if (r.status !== 200) {
      console.error('Xano continue error:', r.data);
      return res.status(r.status).json(r.data || { message: "OAuth continue failed" });
    }

    // Handle different possible response formats from Xano
    // New format: { token: "...", name: "...", email: "...", first_time: true/false }
    // Old formats: { authToken: "..." } or { auth_token: "..." }
    // Wrapped formats: { data: { token: "..." } } or { result: { token: "..." } }
    let responseData = r.data;

    // Check if data is wrapped
    if (r.data?.data) {
      console.log('Response wrapped in "data" key');
      responseData = r.data.data;
    } else if (r.data?.result) {
      console.log('Response wrapped in "result" key');
      responseData = r.data.result;
    }

    const token = responseData?.token || responseData?.authToken || responseData?.auth_token;
    if (!token) {
      console.error('❌ No token in Xano response. Full response:', JSON.stringify(r.data, null, 2));
      console.error('Response keys:', Object.keys(r.data || {}));
      return res.status(500).json({
        message: "No token from Xano continue",
        debug: {
          hasData: !!r.data,
          keys: Object.keys(r.data || {}),
          dataType: typeof r.data
        }
      });
    }

    console.log('✅ Token received successfully');

    // Optional: Set cookie for future cookie-based auth
    if (COOKIE_DOMAIN) {
      res.setHeader("Set-Cookie", [
        `qc_session=${token}; HttpOnly; Secure; SameSite=None; Path=/; Domain=${COOKIE_DOMAIN}; Max-Age=${30*24*60*60}`
      ]);
    }

    // Send sign-in notification email (non-blocking) - only on first signup
    const userEmail = responseData?.email;
    const userName = responseData?.name;
    const firstTime = responseData?.first_time;

    console.log('📧 Email check - email:', userEmail, 'first_time:', firstTime, 'type:', typeof firstTime);

    // Handle both boolean true and string "true"
    const isFirstTime = firstTime === true || firstTime === 'true' || firstTime === 1;

    if (userEmail && isFirstTime) {
      console.log('📧 First-time user detected, sending welcome email...');
      // Dynamic import to avoid module loading issues
      import('../lib/zeptomail.js')
        .then(({ sendSignInNotification }) => {
          return sendSignInNotification({ email: userEmail, name: userName });
        })
        .then(() => console.log('✅ Sign-in notification sent'))
        .catch((err) => console.error('❌ Failed to send sign-in notification:', err.message));
    } else if (userEmail) {
      console.log('🔄 Returning user, skipping welcome email (first_time:', firstTime, ')');
    }

    return res.status(200).json({
      token,
      name: responseData?.name,
      email: responseData?.email,
      first_time: firstTime
    });
  } catch (e) {
    console.error("OAuth continue error:", e.response?.data || e.message);
    return res.status(500).json({ 
      message: "OAuth continue failed",
      error: e.message 
    });
  }
}
