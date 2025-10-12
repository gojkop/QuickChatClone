// admin/api/flags/public.js
// Public read-only endpoint for runtime feature flag checks
// Used by main app (www.mindpick.me)

import { sql } from '../_lib/db.js';
import { allowCors, err } from '../_lib/respond.js';

// Plan level to human-readable name
const PLAN_NAMES = {
  0: 'free',
  10: 'pro',
  20: 'enterprise'
};

/**
 * GET /api/flags/public
 * Returns enabled feature flags with plan requirements
 * 
 * Response format:
 * {
 *   flags: [
 *     { key: 'profile_video', enabled: true, min_plan: 'pro', min_plan_level: 10 },
 *     { key: 'ai_transcription', enabled: true, min_plan: 'free', min_plan_level: 0 }
 *   ]
 * }
 */
export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  
  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed', {}, req);
  }

  try {
    // Only return enabled flags
    const rows = await sql`
      SELECT key, enabled, min_plan_level
      FROM feature_flags
      WHERE enabled = true
      ORDER BY key ASC
    `;

    // Transform to include human-readable plan name
    const flags = rows.map(flag => ({
      key: flag.key,
      enabled: flag.enabled,
      min_plan: PLAN_NAMES[flag.min_plan_level] || 'free',
      min_plan_level: flag.min_plan_level
    }));

    // Aggressive edge caching for performance
    // Cache for 5 minutes, allow stale for 10 minutes during revalidation
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ flags });
  } catch (e) {
    console.error('[admin] GET /api/flags/public error:', e);
    return err(res, 500, 'Failed to fetch feature flags', { details: e.message }, req);
  }
}