export function calculateMetrics(questions = [], answers = []) {
  // Early return for empty questions - avoid unnecessary processing
  if (!questions || questions.length === 0) {
    return {
      thisMonthRevenue: 0,
      revenueChange: 0,
      avgResponseTime: 0,
      avgRating: 0,
      pendingCount: 0,
      urgentCount: 0,
    };
  }

  const now = Date.now() / 1000;

  // Calculate time boundaries once (not in loop)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthStart = startOfMonth.getTime() / 1000;

  const prevMonthStart = new Date(startOfMonth);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  const prevMonthStartSec = prevMonthStart.getTime() / 1000;

  // Single-pass accumulation - all calculations in ONE loop
  let thisMonthRevenueCents = 0;
  let prevMonthRevenueCents = 0;
  let responseTimeSum = 0;
  let responseTimeCount = 0;
  let pendingCount = 0;
  let urgentCount = 0;

  // SINGLE LOOP - replaces 11 separate filter/reduce/map operations
  for (const q of questions) {
    // Normalize timestamp once per question
    const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
    const isClosedOrAnswered = q.status === 'closed' || q.answered_at;

    // This month revenue calculation
    if (createdAt >= monthStart && isClosedOrAnswered) {
      thisMonthRevenueCents += (q.price_cents || 0);
    }

    // Previous month revenue calculation
    if (createdAt >= prevMonthStartSec && createdAt < monthStart && isClosedOrAnswered) {
      prevMonthRevenueCents += (q.price_cents || 0);
    }

    // Response time calculation
    if (q.answered_at && q.created_at) {
      const answeredAt = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
      const responseTimeHours = (answeredAt - createdAt) / 3600;
      responseTimeSum += responseTimeHours;
      responseTimeCount++;
    }

    // Pending questions check
    const isPending = q.status === 'paid' &&
      !q.answered_at &&
      q.pricing_status !== 'offer_pending' &&
      q.pricing_status !== 'offer_declined' &&
      !q.hidden;

    if (isPending) {
      pendingCount++;

      // Urgent questions calculation (subset of pending)
      if (q.sla_hours_snapshot && q.sla_hours_snapshot > 0) {
        const elapsed = now - createdAt;
        const slaSeconds = q.sla_hours_snapshot * 3600;
        const remaining = slaSeconds - elapsed;

        if (remaining < 12 * 3600 && remaining > 0) {
          urgentCount++;
        }
      }
    }
  }

  // Calculate ratings from answers array (separate from questions)
  // Ratings are stored in the answers table, not questions
  let ratingSum = 0;
  let ratingCount = 0;

  if (Array.isArray(answers)) {
    for (const answer of answers) {
      // Only count answers with valid ratings (1-5)
      if (answer.rating && answer.rating >= 1 && answer.rating <= 5) {
        ratingSum += answer.rating;
        ratingCount++;
      }
    }
  }

  // Calculate final derived values
  const thisMonthRevenue = thisMonthRevenueCents / 100;
  const prevMonthRevenue = prevMonthRevenueCents / 100;

  const revenueChange = prevMonthRevenue > 0
    ? ((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
    : 0;

  const avgResponseTime = responseTimeCount > 0
    ? responseTimeSum / responseTimeCount
    : 0;

  const avgRating = ratingCount > 0
    ? ratingSum / ratingCount
    : 0;

  return {
    thisMonthRevenue,
    revenueChange,
    avgResponseTime,
    avgRating,
    pendingCount,
    urgentCount,
  };
}

export function formatCurrency(cents) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDuration(hours) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}