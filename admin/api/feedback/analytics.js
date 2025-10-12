// admin/api/feedback/analytics.js
// Dashboard analytics and stats

import { sql } from '../_lib/db.js';
import { verifyAdminSession } from '../_lib/jwt.js';
import { allowCors, ok, err } from '../_lib/respond.js';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;

  if (req.method !== 'GET') {
    return err(res, 405, 'Method not allowed', {}, req);
  }

  // Verify admin
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  
  if (!match) {
    return err(res, 401, 'Admin authentication required', {}, req);
  }

  let session;
  try {
    session = verifyAdminSession(match[1]);
  } catch (e) {
    return err(res, 401, 'Invalid or expired admin session', {}, req);
  }

  try {
    const { days = '30' } = req.query;
    const daysAgo = parseInt(days);

    // Overall stats
    const stats = await sql`
      SELECT
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE rating IS NOT NULL) as rated_count,
        AVG(rating) as avg_rating,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE email IS NOT NULL) as with_email_count,
        COUNT(*) FILTER (WHERE jira_ticket_key IS NOT NULL) as with_jira_count
      FROM feedback
      WHERE created_at >= NOW() - INTERVAL '${daysAgo} days'
        AND deleted_at IS NULL
    `;

    // By type
    const byType = await sql`
      SELECT 
        type,
        COUNT(*) as count
      FROM feedback
      WHERE created_at >= NOW() - INTERVAL '${daysAgo} days'
        AND deleted_at IS NULL
      GROUP BY type
      ORDER BY count DESC
    `;

    // By journey stage
    const byJourney = await sql`
      SELECT 
        journey_stage,
        COUNT(*) as count
      FROM feedback
      WHERE created_at >= NOW() - INTERVAL '${daysAgo} days'
        AND deleted_at IS NULL
        AND journey_stage IS NOT NULL
      GROUP BY journey_stage
      ORDER BY count DESC
    `;

    // By device
    const byDevice = await sql`
      SELECT 
        device_type,
        COUNT(*) as count
      FROM feedback
      WHERE created_at >= NOW() - INTERVAL '${daysAgo} days'
        AND deleted_at IS NULL
        AND device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY count DESC
    `;

    // Trend (last N days)
    const trend = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE type = 'bug') as bugs,
        COUNT(*) FILTER (WHERE type = 'feature') as features,
        COUNT(*) FILTER (WHERE type = 'feedback') as feedback,
        AVG(rating) as avg_rating
      FROM feedback
      WHERE created_at >= NOW() - INTERVAL '${daysAgo} days'
        AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Top pages
    const topPages = await sql`
      SELECT 
        page_url,
        COUNT(*) as count
      FROM feedback
      WHERE created_at >= NOW() - INTERVAL '${daysAgo} days'
        AND deleted_at IS NULL
      GROUP BY page_url
      ORDER BY count DESC
      LIMIT 10
    `;

    // Avg response time (for resolved items)
    const responseTime = await sql`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
      FROM feedback
      WHERE resolved_at IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${daysAgo} days'
        AND deleted_at IS NULL
    `;

    return ok(res, {
      summary: {
        ...stats[0],
        avg_rating: stats[0].avg_rating ? parseFloat(stats[0].avg_rating).toFixed(1) : null,
        avg_response_hours: responseTime[0].avg_hours ? 
          parseFloat(responseTime[0].avg_hours).toFixed(1) : null,
      },
      by_type: byType,
      by_journey: byJourney,
      by_device: byDevice,
      trend,
      top_pages: topPages,
    }, req);

  } catch (error) {
    console.error('[feedback/analytics] Error:', error);
    return err(res, 500, 'Failed to fetch analytics', {
      details: error.message,
    }, req);
  }
}