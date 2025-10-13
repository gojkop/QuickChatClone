// admin/api/debug-xano.js
// Temporary debug endpoint to test Xano connection

import { allowCors, ok, err } from './_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed');
  }

  const xanoBase = process.env.XANO_BASE_URL;
  
  console.log('[debug] XANO_BASE_URL:', xanoBase);
  
  if (!xanoBase) {
    return err(res, 500, 'XANO_BASE_URL not configured');
  }

  // Test 1: Basic connectivity
  try {
    const testUrl = `${xanoBase}/health`;
    console.log('[debug] Testing URL:', testUrl);
    
    const response = await fetch(testUrl);
    console.log('[debug] Health check status:', response.status);
  } catch (error) {
    console.error('[debug] Health check failed:', error);
  }

  // Test 2: Check /auth/me endpoint
  try {
    const authMeUrl = `${xanoBase}/auth/me`;
    console.log('[debug] Testing /auth/me URL:', authMeUrl);
    
    const response = await fetch(authMeUrl);
    console.log('[debug] /auth/me status:', response.status);
    console.log('[debug] /auth/me response:', await response.text());
  } catch (error) {
    console.error('[debug] /auth/me check failed:', error);
  }

  // Test 3: Try legacy /me endpoint
  try {
    const meUrl = `${xanoBase}/me`;
    console.log('[debug] Testing /me URL:', meUrl);
    
    const response = await fetch(meUrl);
    console.log('[debug] /me status:', response.status);
  } catch (error) {
    console.error('[debug] /me check failed:', error);
  }

  // Test 4: Get token from cookie and try validation
  const cookieHeader = req.headers.cookie || '';
  const qcMatch = cookieHeader.match(/(?:^|;\s*)qc_session=([^;]+)/);
  
  if (qcMatch) {
    try {
      let token = decodeURIComponent(qcMatch[1]).trim();
      console.log('[debug] Found qc_session token (first 20 chars):', token.substring(0, 20));
      
      // Try to validate it
      const authMeUrl = `${xanoBase}/auth/me`;
      const validateResponse = await fetch(authMeUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('[debug] Token validation status:', validateResponse.status);
      
      if (validateResponse.ok) {
        const userData = await validateResponse.json();
        console.log('[debug] User data structure:', Object.keys(userData));
        return ok(res, {
          success: true,
          message: 'Token validation successful',
          userDataStructure: Object.keys(userData),
          xanoBaseUrl: xanoBase
        });
      } else {
        const errorText = await validateResponse.text();
        console.log('[debug] Token validation failed:', errorText);
        return err(res, 401, 'Token validation failed', { 
          xanoResponse: errorText,
          xanoBaseUrl: xanoBase 
        });
      }
    } catch (error) {
      console.error('[debug] Token validation error:', error);
      return err(res, 500, 'Token validation error', { 
        error: error.message,
        xanoBaseUrl: xanoBase 
      });
    }
  }

  return ok(res, {
    message: 'Debug info collected (no token found in cookies)',
    xanoBaseUrl: xanoBase,
    cookiesFound: cookieHeader ? 'yes' : 'no'
  });
}