// admin/api/debug-migration.js
// Deep dive into Xano token validation issue

import { sql } from './_lib/db.js';
import { allowCors, ok, err } from './_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed');
  }

  const results = {
    timestamp: new Date().toISOString(),
    environment: {},
    tokenAnalysis: {},
    xanoTests: {},
    databaseTests: {},
    recommendations: []
  };

  // ========================================================================
  // 1. ENVIRONMENT CHECK
  // ========================================================================
  const xanoBase = process.env.XANO_BASE_URL;
  const dbUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.ADMIN_JWT_SECRET;
  
  results.environment = {
    xano_base_url: xanoBase ? xanoBase.substring(0, 50) + '...' : 'NOT SET',
    xano_base_configured: !!xanoBase,
    database_configured: !!dbUrl,
    jwt_secret_configured: !!jwtSecret,
    node_env: process.env.NODE_ENV
  };

  if (!xanoBase) {
    results.recommendations.push('❌ CRITICAL: XANO_BASE_URL not configured');
    return ok(res, results);
  }

  // ========================================================================
  // 2. TOKEN EXTRACTION AND ANALYSIS
  // ========================================================================
  const cookieHeader = req.headers.cookie || '';
  const qcMatch = cookieHeader.match(/(?:^|;\s*)qc_session=([^;]+)/);
  
  if (!qcMatch) {
    results.tokenAnalysis = {
      found: false,
      error: 'No qc_session cookie found',
      cookies_present: cookieHeader ? cookieHeader.split(';').map(c => c.split('=')[0].trim()) : []
    };
    results.recommendations.push('⚠️ No qc_session cookie - user not logged into main app');
    return ok(res, results);
  }

  let token;
  try {
    token = decodeURIComponent(qcMatch[1]).trim();
  } catch {
    token = qcMatch[1].trim();
  }

  // Analyze token structure (JWT tokens have 3 parts separated by dots)
  const tokenParts = token.split('.');
  results.tokenAnalysis = {
    found: true,
    length: token.length,
    first_20_chars: token.substring(0, 20) + '...',
    last_20_chars: '...' + token.substring(token.length - 20),
    appears_to_be_jwt: tokenParts.length === 3,
    parts_count: tokenParts.length
  };

  if (tokenParts.length === 3) {
    try {
      // Decode JWT header and payload (without verifying signature)
      const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      
      results.tokenAnalysis.jwt_header = header;
      results.tokenAnalysis.jwt_payload = {
        issued_at: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'unknown',
        expires_at: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown',
        is_expired: payload.exp ? (Date.now() / 1000 > payload.exp) : 'unknown',
        user_id: payload.user_id || payload.sub || 'unknown',
        issuer: payload.iss || 'unknown'
      };

      if (payload.exp && Date.now() / 1000 > payload.exp) {
        results.recommendations.push('⚠️ Token is EXPIRED - user needs to re-login to main app');
      }
    } catch (e) {
      results.tokenAnalysis.jwt_decode_error = e.message;
    }
  }

  // ========================================================================
  // 3. TEST XANO ENDPOINTS
  // ========================================================================
  results.xanoTests.base_url = xanoBase;
  
  // Test 1: /auth/me endpoint
  try {
    const authMeUrl = `${xanoBase}/auth/me`;
    const authMeResponse = await fetch(authMeUrl, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    results.xanoTests.auth_me = {
      url: authMeUrl,
      status: authMeResponse.status,
      ok: authMeResponse.ok,
      status_text: authMeResponse.statusText
    };

    if (authMeResponse.ok) {
      try {
        const userData = await authMeResponse.json();
        results.xanoTests.auth_me.response_structure = Object.keys(userData);
        results.xanoTests.auth_me.user_id = userData?.user?.id || userData?.id || 'not found';
        results.xanoTests.auth_me.email = userData?.user?.email || userData?.email || 'not found';
        
        if (userData?.user?.id || userData?.id) {
          results.recommendations.push('✅ Token is VALID for new Xano instance!');
        }
      } catch (e) {
        results.xanoTests.auth_me.parse_error = e.message;
      }
    } else {
      const errorText = await authMeResponse.text();
      results.xanoTests.auth_me.error_response = errorText.substring(0, 500);
      
      if (authMeResponse.status === 401) {
        results.recommendations.push('❌ CRITICAL: Token is INVALID for new Xano instance');
        results.recommendations.push('   → This is the ROOT CAUSE of your issue');
        results.recommendations.push('   → Solution: User must re-login to main app to get new token');
      }
    }
  } catch (e) {
    results.xanoTests.auth_me = {
      error: e.message,
      type: 'connection_error'
    };
    results.recommendations.push('❌ Cannot connect to Xano /auth/me endpoint');
  }

  // Test 2: Legacy /me endpoint (fallback)
  try {
    const meUrl = `${xanoBase}/me`;
    const meResponse = await fetch(meUrl, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    results.xanoTests.me = {
      url: meUrl,
      status: meResponse.status,
      ok: meResponse.ok
    };

    if (meResponse.ok) {
      const userData = await meResponse.json();
      results.xanoTests.me.response_structure = Object.keys(userData);
      results.xanoTests.me.user_id = userData?.user?.id || userData?.id || 'not found';
      
      if (!results.xanoTests.auth_me?.ok) {
        results.recommendations.push('✅ Token works with legacy /me endpoint');
      }
    }
  } catch (e) {
    results.xanoTests.me = {
      error: e.message,
      type: 'connection_error'
    };
  }

  // Test 3: Test without token (check if endpoint exists)
  try {
    const publicTest = await fetch(`${xanoBase}/auth/me`);
    results.xanoTests.endpoint_exists = {
      status: publicTest.status,
      endpoint_exists: publicTest.status !== 404
    };
  } catch (e) {
    results.xanoTests.endpoint_exists = {
      error: e.message
    };
  }

  // ========================================================================
  // 4. DATABASE CHECKS
  // ========================================================================
  if (!dbUrl) {
    results.databaseTests.error = 'DATABASE_URL not configured';
    results.recommendations.push('⚠️ Cannot check admin_users table - DATABASE_URL not set');
  } else {
    try {
      // Get Xano user ID from successful validation
      const xanoUserId = results.xanoTests.auth_me?.user_id || results.xanoTests.me?.user_id;
      
      if (xanoUserId && xanoUserId !== 'not found') {
        // Check if admin user exists
        const adminRows = await sql`
          SELECT id, role, disabled, xano_user_id
          FROM admin_users
          WHERE xano_user_id = ${String(xanoUserId)}
          LIMIT 1
        `;

        results.databaseTests.admin_user = {
          xano_user_id: xanoUserId,
          exists: adminRows.length > 0,
          is_admin: adminRows.length > 0,
          role: adminRows[0]?.role || 'not found',
          disabled: adminRows[0]?.disabled || false
        };

        if (adminRows.length === 0) {
          results.recommendations.push('❌ User is not registered as admin in database');
          results.recommendations.push(`   → Run: INSERT INTO admin_users (xano_user_id, email, name, role, disabled) VALUES ('${xanoUserId}', 'your@email.com', 'Your Name', 'super_admin', false);`);
        } else if (adminRows[0].disabled) {
          results.recommendations.push('⚠️ Admin account is DISABLED');
        } else {
          results.recommendations.push('✅ Admin user exists in database');
        }
      } else {
        results.databaseTests.skip_reason = 'No valid user_id from Xano to check';
      }

      // Count total admin users
      const countRows = await sql`SELECT COUNT(*) as total FROM admin_users`;
      results.databaseTests.total_admin_users = parseInt(countRows[0].total);

    } catch (e) {
      results.databaseTests.error = e.message;
      results.recommendations.push('❌ Database connection failed: ' + e.message);
    }
  }

  // ========================================================================
  // 5. FINAL DIAGNOSIS
  // ========================================================================
  results.diagnosis = {
    token_found: results.tokenAnalysis.found,
    token_valid_for_new_xano: results.xanoTests.auth_me?.ok || results.xanoTests.me?.ok || false,
    admin_exists_in_db: results.databaseTests.admin_user?.exists || false,
    ready_to_login: false
  };

  results.diagnosis.ready_to_login = 
    results.diagnosis.token_found && 
    results.diagnosis.token_valid_for_new_xano && 
    results.diagnosis.admin_exists_in_db;

  if (results.diagnosis.ready_to_login) {
    results.recommendations.push('🎉 Everything looks good! Login should work.');
  } else {
    results.recommendations.push('');
    results.recommendations.push('=== TROUBLESHOOTING STEPS ===');
    
    if (!results.diagnosis.token_found) {
      results.recommendations.push('1. Log in to main app (www.mindpick.me) first');
    } else if (!results.diagnosis.token_valid_for_new_xano) {
      results.recommendations.push('1. CRITICAL: Token is for OLD Xano instance');
      results.recommendations.push('   → LOGOUT of main app completely');
      results.recommendations.push('   → Clear all cookies (or use incognito)');
      results.recommendations.push('   → LOGIN to main app again');
      results.recommendations.push('   → This will create a token for NEW Xano');
    }
    
    if (!results.diagnosis.admin_exists_in_db && results.xanoTests.auth_me?.user_id) {
      results.recommendations.push('2. Add yourself to admin_users table in Neon');
    }
  }

  return ok(res, results);
}