// admin/api/auth/verify-v2.js
// Improved authentication with better error handling and auto-login

import { sql } from '../_lib/db.js';
import { signAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  
  if (req.method !== 'POST') {
    return err(res, 405, 'Method not allowed');
  }

  const xanoBase = process.env.XANO_BASE_URL;
  
  console.log('[auth/verify-v2] Starting authentication');
  console.log('[auth/verify-v2] XANO_BASE_URL configured:', !!xanoBase);
  
  if (!xanoBase) {
    return err(res, 500, 'XANO_BASE_URL not configured');
  }

  // ========================================================================
  // STEP 1: Get token from multiple sources
  // ========================================================================
  let token = null;
  const sources = [];

  // Source 1: Authorization header
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
    sources.push('Authorization header');
  }

  // Source 2: Request body (JSON or form-encoded)
  if (!token && req.body) {
    let body = req.body;
    
    // Parse if string
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        try {
          const params = new URLSearchParams(body);
          const t = params.get('token');
          if (t) {
            token = t.trim();
            sources.push('Form body');
          }
        } catch (e) {
          console.error('[auth/verify-v2] Body parse error:', e);
        }
      }
    }
    
    if (!token && body && typeof body.token === 'string') {
      token = body.token.trim();
      sources.push('JSON body');
    }
  }

  // Source 3: qc_session cookie (from main app)
  if (!token) {
    const cookieHeader = req.headers.cookie || '';
    const qcMatch = cookieHeader.match(/(?:^|;\s*)qc_session=([^;]+)/);
    
    if (qcMatch) {
      try {
        token = decodeURIComponent(qcMatch[1]).trim();
        sources.push('qc_session cookie');
      } catch {
        token = qcMatch[1].trim();
        sources.push('qc_session cookie (fallback)');
      }
    }
  }

  console.log('[auth/verify-v2] Token sources checked:', sources.join(', '));
  console.log('[auth/verify-v2] Token found:', !!token);

  if (!token) {
    return err(res, 401, 'No authentication token found', {
      hint: 'Make sure you are logged in to the main app first',
      sourcesChecked: ['Authorization header', 'Request body', 'qc_session cookie']
    });
  }

  // ========================================================================
  // STEP 2: Validate token with Xano
  // ========================================================================
  console.log('[auth/verify-v2] Validating token with Xano...');
  
  let meResp;
  let xanoEndpoint = `${xanoBase}/auth/me`;
  
  try {
    meResp = await fetch(xanoEndpoint, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[auth/verify-v2] /auth/me status:', meResp.status);

    // Fallback to legacy /me endpoint
    if (!meResp.ok && meResp.status === 404) {
      console.log('[auth/verify-v2] Trying fallback /me endpoint');
      xanoEndpoint = `${xanoBase}/me`;
      
      meResp = await fetch(xanoEndpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[auth/verify-v2] /me status:', meResp.status);
    }

    if (!meResp.ok) {
      const errorText = await meResp.text();
      console.error('[auth/verify-v2] Xano validation failed:', {
        status: meResp.status,
        endpoint: xanoEndpoint,
        error: errorText
      });
      
      return err(res, 401, 'Token validation failed', {
        xanoStatus: meResp.status,
        xanoEndpoint: xanoEndpoint,
        xanoError: errorText.substring(0, 200),
        hint: 'Your session may have expired. Please log in to the main app again.'
      });
    }
  } catch (error) {
    console.error('[auth/verify-v2] Xano request error:', error);
    return err(res, 500, 'Failed to connect to authentication server', {
      error: error.message,
      xanoBaseUrl: xanoBase
    });
  }

  // ========================================================================
  // STEP 3: Parse user data from Xano
  // ========================================================================
  let me;
  try {
    me = await meResp.json();
    console.log('[auth/verify-v2] Xano response structure:', Object.keys(me));
  } catch (error) {
    console.error('[auth/verify-v2] Failed to parse Xano response:', error);
    return err(res, 500, 'Invalid response from authentication server');
  }

  // Extract user ID (handle different response structures)
  const xanoUserId = 
    me?.user?.id != null ? String(me.user.id) :
    me?.id != null ? String(me.id) : null;
    
  const email = me?.user?.email || me?.email || null;
  const name = me?.user?.name || me?.name || null;

  console.log('[auth/verify-v2] Extracted xanoUserId:', xanoUserId);
  console.log('[auth/verify-v2] Extracted email:', email);

  if (!xanoUserId) {
    console.error('[auth/verify-v2] No user ID in Xano response');
    return err(res, 401, 'Invalid user data from authentication server', {
      hint: 'The authentication response is missing user ID',
      responseStructure: Object.keys(me)
    });
  }

  // ========================================================================
  // STEP 4: Check RBAC in Neon
  // ========================================================================
  console.log('[auth/verify-v2] Checking admin permissions...');
  
  let adminUser;
  try {
    const rows = await sql`
      SELECT id, role, disabled, token_version
      FROM admin_users
      WHERE xano_user_id = ${xanoUserId}
      LIMIT 1
    `;

    adminUser = rows[0];
    console.log('[auth/verify-v2] Admin user found:', !!adminUser);
    
    if (adminUser) {
      console.log('[auth/verify-v2] Admin role:', adminUser.role);
      console.log('[auth/verify-v2] Admin disabled:', adminUser.disabled);
    }
  } catch (error) {
    console.error('[auth/verify-v2] Database error:', error);
    return err(res, 500, 'Database error', {
      error: error.message
    });
  }

  if (!adminUser || adminUser.disabled) {
    console.log('[auth/verify-v2] Access denied - not an admin or disabled');
    return err(res, 403, 'Access denied', {
      reason: !adminUser ? 'not_admin' : 'account_disabled',
      hint: !adminUser 
        ? 'You do not have admin privileges. Contact a super admin to grant access.'
        : 'Your admin account has been disabled. Contact a super admin.'
    });
  }

  // ========================================================================
  // STEP 5: Issue admin session
  // ========================================================================
  console.log('[auth/verify-v2] Issuing admin session...');
  
  try {
    const session = signAdminSession({
      admin_id: adminUser.id,
      xano_user_id: xanoUserId,
      role: adminUser.role,
      tv: adminUser.token_version
    }, 900); // 15 minutes

    // Set secure httpOnly cookie
    const cookie = [
      `admin_session=${session}`,
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      'Max-Age=900'
    ].join('; ');

    res.setHeader('Set-Cookie', cookie);

    console.log('[auth/verify-v2] Success! Admin logged in:', adminUser.role);

    return ok(res, {
      success: true,
      role: adminUser.role,
      email: email,
      name: name,
      tokenSource: sources[0] || 'unknown'
    }, req);
  } catch (error) {
    console.error('[auth/verify-v2] Session creation error:', error);
    return err(res, 500, 'Failed to create admin session', {
      error: error.message
    });
  }
}