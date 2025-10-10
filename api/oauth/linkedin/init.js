// api/oauth/linkedin/init-debug.js
// Enhanced version with detailed logging

import axios from 'axios';

export default async function handler(req, res) {
  try {
    const CLIENT_PUBLIC_ORIGIN = process.env.CLIENT_PUBLIC_ORIGIN;
    const XANO_LINKEDIN_AUTH_BASE_URL = process.env.XANO_LINKEDIN_AUTH_BASE_URL || process.env.XANO_AUTH_BASE_URL;

    // Detailed logging
    console.log('=== LinkedIn OAuth Init Debug ===');
    console.log('CLIENT_PUBLIC_ORIGIN:', CLIENT_PUBLIC_ORIGIN);
    console.log('XANO_LINKEDIN_AUTH_BASE_URL:', XANO_LINKEDIN_AUTH_BASE_URL);
    console.log('Query params:', req.query);
    
    if (!CLIENT_PUBLIC_ORIGIN) {
      console.error('❌ CLIENT_PUBLIC_ORIGIN not set');
      return res.status(500).json({ 
        message: "Server configuration error: CLIENT_PUBLIC_ORIGIN missing",
        debug: { hasOrigin: false }
      });
    }

    if (!XANO_LINKEDIN_AUTH_BASE_URL) {
      console.error('❌ XANO_LINKEDIN_AUTH_BASE_URL not set');
      return res.status(500).json({ 
        message: "Server configuration error: XANO_LINKEDIN_AUTH_BASE_URL missing",
        debug: { hasXanoUrl: false }
      });
    }

    const redirect_uri = req.query.redirect_uri || `${CLIENT_PUBLIC_ORIGIN}/auth/callback`;
    
    console.log('Constructed redirect_uri:', redirect_uri);
    console.log('Full Xano URL:', `${XANO_LINKEDIN_AUTH_BASE_URL}/oauth/linkedin/init`);

    // Call Xano's LinkedIn OAuth init endpoint
    const r = await axios.get(`${XANO_LINKEDIN_AUTH_BASE_URL}/oauth/linkedin/init`, {
      params: { redirect_uri },
      validateStatus: () => true
    });

    console.log('Xano response status:', r.status);
    console.log('Xano response data:', JSON.stringify(r.data, null, 2));

    if (r.status !== 200) {
      console.error('❌ Xano LinkedIn init error:', r.data);
      return res.status(r.status).json({ 
        ...r.data,
        debug: {
          xanoUrl: `${XANO_LINKEDIN_AUTH_BASE_URL}/oauth/linkedin/init`,
          redirect_uri,
          status: r.status
        }
      });
    }

    const authUrl = r.data?.authUrl || r.data?.url || r.data;

    if (!authUrl) {
      console.error('❌ No authUrl in response');
      return res.status(500).json({ 
        message: "No authUrl from Xano",
        debug: { response: r.data }
      });
    }

    console.log('✅ Auth URL generated:', authUrl);
    console.log('=== End Debug ===');

    return res.status(200).json({ authUrl });
  } catch (e) {
    console.error("❌ LinkedIn OAuth init error:", e);
    console.error("Error details:", {
      message: e.message,
      response: e.response?.data,
      stack: e.stack
    });
    
    return res.status(500).json({
      message: "LinkedIn OAuth init failed",
      error: e.message,
      debug: {
        hasResponse: !!e.response,
        responseData: e.response?.data
      }
    });
  }
}
