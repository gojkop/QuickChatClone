// admin/api/health/system.js
// System health checks - Database, Xano, Environment

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed', {}, req);
  }

  // Verify admin authentication
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  
  if (!match) {
    return err(res, 401, 'Admin authentication required', {}, req);
  }

  try {
    verifyAdminSession(match[1]);
  } catch (e) {
    return err(res, 401, 'Invalid or expired admin session', {}, req);
  }

  const checks = {
    timestamp: new Date().toISOString(),
    database: { status: 'unknown', message: '' },
    xano: { status: 'unknown', message: '' },
    environment: { status: 'unknown', message: '', missing: [] }
  };

  // ============================================================================
  // 1. DATABASE CHECK
  // ============================================================================
  try {
    const start = Date.now();
    await sql`SELECT 1 as test`;
    const elapsed = Date.now() - start;
    
    checks.database = {
      status: 'healthy',
      message: `Connected to Neon (${elapsed}ms)`,
      response_time_ms: elapsed
    };
  } catch (error) {
    console.error('[health] Database check failed:', error);
    checks.database = {
      status: 'error',
      message: error.message || 'Database connection failed'
    };
  }

  // ============================================================================
  // 2. XANO API CHECK
  // ============================================================================
  const xanoBase = process.env.XANO_BASE_URL;
  
  if (!xanoBase) {
    checks.xano = {
      status: 'error',
      message: 'XANO_BASE_URL not configured'
    };
  } else {
    try {
      // Try /auth/me endpoint first
      const start = Date.now();
      const xanoResponse = await fetch(`${xanoBase}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const elapsed = Date.now() - start;

      // Check if endpoint exists (404 is fine - means auth works)
      if (xanoResponse.status === 404 || xanoResponse.status === 401 || xanoResponse.ok) {
        checks.xano = {
          status: 'healthy',
          message: `Xano reachable (${elapsed}ms)`,
          response_time_ms: elapsed,
          base_url: xanoBase
        };
      } else {
        checks.xano = {
          status: 'warning',
          message: `Xano responded with HTTP ${xanoResponse.status}`,
          base_url: xanoBase
        };
      }
    } catch (error) {
      console.error('[health] Xano check failed:', error);
      checks.xano = {
        status: 'error',
        message: error.message || 'Xano connection failed',
        base_url: xanoBase
      };
    }
  }

  // ============================================================================
  // 3. ENVIRONMENT VARIABLES CHECK
  // ============================================================================
  const requiredVars = [
    'DATABASE_URL',
    'XANO_BASE_URL',
    'ADMIN_JWT_SECRET'
  ];

  const optionalVars = [
    'CORS_ALLOW_ORIGIN',
    'JIRA_EMAIL',
    'JIRA_API_TOKEN',
    'JIRA_BASE_URL',
    'JIRA_PROJECT_KEY'
  ];

  const missing = requiredVars.filter(key => !process.env[key]);
  const optionalMissing = optionalVars.filter(key => !process.env[key]);

  if (missing.length === 0) {
    checks.environment = {
      status: 'healthy',
      message: 'All required environment variables set',
      missing: [],
      optional_missing: optionalMissing,
      details: {
        required: requiredVars.map(key => ({
          key,
          set: !!process.env[key]
        })),
        optional: optionalVars.map(key => ({
          key,
          set: !!process.env[key]
        }))
      }
    };
  } else {
    checks.environment = {
      status: 'error',
      message: `Missing required variables: ${missing.join(', ')}`,
      missing,
      optional_missing: optionalMissing
    };
  }

  // ============================================================================
  // 4. OVERALL HEALTH STATUS
  // ============================================================================
  const hasError = Object.values(checks).some(
    check => check.status === 'error'
  );
  const hasWarning = Object.values(checks).some(
    check => check.status === 'warning'
  );

  const overallStatus = hasError ? 'error' : hasWarning ? 'warning' : 'healthy';

  return ok(res, {
    ...checks,
    overall_status: overallStatus,
    healthy: overallStatus === 'healthy'
  }, req);
}