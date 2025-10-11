import { sql } from '../_lib/db.js';
import { allowCors, err } from '../_lib/respond.js';

/**
 * GET /api/flags/public
 * Read-only feature flags for runtime consumers.
 * Consider adding auth or edge caching controls depending on sensitivity.
 */
export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed');
  }

  try {
    const rows = await sql`
      SELECT key, enabled, rollout_percentage
      FROM feature_flags
      ORDER BY key ASC
    `;

    // CDN caching for public flags
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ flags: rows });
  } catch (e) {
    console.error('[admin] /api/flags/public error:', e);
    return err(res, 500, 'Internal server error');
  }
}
