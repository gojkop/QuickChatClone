export function calculateMetrics(questions = []) {
  const now = Date.now() / 1000;
  
  // This month calculations
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthStart = startOfMonth.getTime() / 1000;

  const thisMonthQuestions = questions.filter(q => {
    const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
    return createdAt >= monthStart && (q.status === 'closed' || q.answered_at);
  });

  const thisMonthRevenue = thisMonthQuestions.reduce((sum, q) => sum + (q.price_cents || 0), 0) / 100;

  // Previous month for comparison
  const prevMonthStart = new Date(startOfMonth);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  const prevMonthStartSec = prevMonthStart.getTime() / 1000;

  const prevMonthQuestions = questions.filter(q => {
    const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
    return createdAt >= prevMonthStartSec && createdAt < monthStart && (q.status === 'closed' || q.answered_at);
  });

  const prevMonthRevenue = prevMonthQuestions.reduce((sum, q) => sum + (q.price_cents || 0), 0) / 100;
  const revenueChange = prevMonthRevenue > 0 ? ((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

  // Response time
  const answeredQuestions = questions.filter(q => q.answered_at && q.created_at);
  const responseTimes = answeredQuestions.map(q => {
    const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
    const answeredAt = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
    return (answeredAt - createdAt) / 3600; // in hours
  });

  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  // Rating
  const ratedQuestions = questions.filter(q => q.rating);
  const avgRating = ratedQuestions.length > 0
    ? ratedQuestions.reduce((sum, q) => sum + q.rating, 0) / ratedQuestions.length
    : 0;

  // Pending count
  const pendingQuestions = questions.filter(q => 
    q.status === 'paid' && 
    !q.answered_at && 
    q.pricing_status !== 'offer_pending' &&
    q.pricing_status !== 'offer_declined' &&
    !q.hidden
  );

  // Urgent questions (<12h remaining)
  const urgentQuestions = pendingQuestions.filter(q => {
    if (!q.sla_hours_snapshot || q.sla_hours_snapshot <= 0) return false;
    const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
    const elapsed = now - createdAt;
    const slaSeconds = q.sla_hours_snapshot * 3600;
    const remaining = slaSeconds - elapsed;
    return remaining < 12 * 3600 && remaining > 0;
  });

  return {
    thisMonthRevenue,
    revenueChange,
    avgResponseTime,
    avgRating,
    pendingCount: pendingQuestions.length,
    urgentCount: urgentQuestions.length,
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