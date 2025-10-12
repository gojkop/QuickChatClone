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
    const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
    const XANO_BASE_URL = process.env.XANO_BASE_URL;
    const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

    // Check if environment variables are set
    if (!CLIENT_PUBLIC_ORIGIN) {
      console.error('CLIENT_PUBLIC_ORIGIN not set');
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error('LinkedIn credentials not set');
      return res.status(500).json({ message: "LinkedIn configuration error" });
    }

    if (!XANO_BASE_URL) {
      console.error('XANO_BASE_URL not set');
      return res.status(500).json({ message: "Xano configuration error" });
    }

    // Use /auth/callback as redirect URI
    const redirect_uri = `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;

    console.log('LinkedIn OAuth continue - code:', code?.substring(0, 10) + '...');
    console.log('LinkedIn OAuth continue - redirect_uri:', redirect_uri);

    // Step 1: Exchange code for access token with LinkedIn
    console.log('Exchanging code for LinkedIn access token...');
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        validateStatus: () => true
      }
    );

    if (tokenResponse.status !== 200) {
      console.error('LinkedIn token exchange failed:', tokenResponse.data);
      return res.status(tokenResponse.status).json({
        message: "LinkedIn token exchange failed",
        error: tokenResponse.data
      });
    }

    const access_token = tokenResponse.data.access_token;
    if (!access_token) {
      console.error('No access_token in LinkedIn response:', tokenResponse.data);
      return res.status(500).json({ message: "No access token from LinkedIn" });
    }

    console.log('LinkedIn access token received');

    // Step 2: Get user info from LinkedIn
    console.log('Fetching user info from LinkedIn...');
    const userInfoResponse = await axios.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
        validateStatus: () => true
      }
    );

    if (userInfoResponse.status !== 200) {
      console.error('LinkedIn userinfo failed:', userInfoResponse.data);
      return res.status(userInfoResponse.status).json({
        message: "LinkedIn userinfo failed",
        error: userInfoResponse.data
      });
    }

    const userInfo = userInfoResponse.data;
    console.log('LinkedIn user info received:', userInfo.email);

    // Step 3: Create/update user in Xano and get auth token
    console.log('Creating/updating user in Xano...');
    const XANO_INTERNAL_API_KEY = process.env.XANO_INTERNAL_API_KEY;

    const xanoResponse = await axios.post(
      `${XANO_BASE_URL}/auth/linkedin/create_user`,
      {
        x_api_key: XANO_INTERNAL_API_KEY,  // Send in body instead of header
        linkedin_id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        picture: userInfo.picture
      },
      {
        validateStatus: () => true
      }
    );

    if (xanoResponse.status !== 200) {
      console.error('Xano user creation failed:', xanoResponse.data);
      return res.status(xanoResponse.status).json({
        message: "Failed to create user in Xano",
        error: xanoResponse.data
      });
    }

    const token = xanoResponse.data?.token || xanoResponse.data?.authToken;
    if (!token) {
      console.error('No token in Xano response:', xanoResponse.data);
      return res.status(500).json({ message: "No auth token from Xano" });
    }

    console.log('User created and token received successfully');

    // Optional: Set cookie for future cookie-based auth
    if (COOKIE_DOMAIN) {
      res.setHeader("Set-Cookie", [
        `qc_session=${token}; HttpOnly; Secure; SameSite=None; Path=/; Domain=${COOKIE_DOMAIN}; Max-Age=${30*24*60*60}`
      ]);
    }

    return res.status(200).json({
      token,
      email: userInfo.email,
      name: userInfo.name,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name
    });
  } catch (e) {
    console.error("LinkedIn OAuth continue error:", e.response?.data || e.message);
    return res.status(500).json({
      message: "LinkedIn OAuth continue failed",
      error: e.message
    });
  }
}
