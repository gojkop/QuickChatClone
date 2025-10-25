export function calculateAnalytics(questions = [], dateRange = { start: null, end: null }) {
  // Filter questions by date range
  const filteredQuestions = filterByDateRange(questions, dateRange);
  const answeredQuestions = filteredQuestions.filter(q => q.answered_at);

  // Revenue calculations
  const totalRevenue = filteredQuestions.reduce((sum, q) => {
    if (q.status === 'closed' || q.answered_at) {
      return sum + (q.price_cents || 0);
    }
    return sum;
  }, 0) / 100;

  // Revenue by day/week/month
  const revenueOverTime = calculateRevenueOverTime(filteredQuestions, dateRange);

  // Response time calculations
  const responseTimes = answeredQuestions
    .filter(q => q.created_at && q.answered_at)
    .map(q => {
      const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      const answeredAt = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
      return (answeredAt - createdAt) / 3600; // hours
    });

  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const responseTimeDistribution = calculateResponseTimeDistribution(responseTimes);

  // Rating calculations
  const ratedQuestions = answeredQuestions.filter(q => q.rating);
  const avgRating = ratedQuestions.length > 0
    ? ratedQuestions.reduce((sum, q) => sum + q.rating, 0) / ratedQuestions.length
    : 0;

  const ratingDistribution = calculateRatingDistribution(ratedQuestions);

  // Question volume over time
  const questionVolume = calculateQuestionVolume(filteredQuestions, dateRange);

  // Day of week analysis
  const dayOfWeekStats = calculateDayOfWeekStats(answeredQuestions);

  // Top questions
  const topQuestions = [...filteredQuestions]
    .filter(q => q.answered_at)
    .sort((a, b) => (b.price_cents || 0) - (a.price_cents || 0))
    .slice(0, 10);

  // Insights
  const insights = generateInsights({
    totalRevenue,
    avgResponseTime,
    avgRating,
    questionCount: filteredQuestions.length,
    answeredCount: answeredQuestions.length,
    dayOfWeekStats,
    responseTimes,
  });

  return {
    totalRevenue,
    questionCount: filteredQuestions.length,
    answeredCount: answeredQuestions.length,
    avgResponseTime,
    avgRating,
    revenueOverTime,
    responseTimeDistribution,
    ratingDistribution,
    questionVolume,
    dayOfWeekStats,
    topQuestions,
    insights,
  };
}

function filterByDateRange(questions, dateRange) {
  if (!dateRange.start || !dateRange.end) return questions;

  const startTime = dateRange.start / 1000;
  const endTime = dateRange.end / 1000;

  return questions.filter(q => {
    const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
    return createdAt >= startTime && createdAt <= endTime;
  });
}

function calculateRevenueOverTime(questions, dateRange) {
  const data = [];
  const interval = getTimeInterval(dateRange);
  const buckets = createTimeBuckets(dateRange, interval);

  buckets.forEach(bucket => {
    const revenue = questions
      .filter(q => {
        if (!q.answered_at) return false;
        const answeredAt = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
        return answeredAt >= bucket.start && answeredAt < bucket.end;
      })
      .reduce((sum, q) => sum + (q.price_cents || 0), 0) / 100;

    data.push({
      date: bucket.label,
      timestamp: bucket.start,
      value: revenue,
    });
  });

  return data;
}

function calculateResponseTimeDistribution(responseTimes) {
  const buckets = [
    { label: '<6h', max: 6, count: 0 },
    { label: '6-12h', min: 6, max: 12, count: 0 },
    { label: '12-24h', min: 12, max: 24, count: 0 },
    { label: '24-48h', min: 24, max: 48, count: 0 },
    { label: '>48h', min: 48, count: 0 },
  ];

  responseTimes.forEach(time => {
    for (let bucket of buckets) {
      if (bucket.min !== undefined && time < bucket.min) continue;
      if (bucket.max !== undefined && time >= bucket.max) continue;
      bucket.count++;
      break;
    }
  });

  return buckets;
}

function calculateRatingDistribution(questions) {
  const distribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: questions.filter(q => q.rating === rating).length,
  }));

  return distribution;
}

function calculateQuestionVolume(questions, dateRange) {
  const buckets = createTimeBuckets(dateRange, getTimeInterval(dateRange));

  return buckets.map(bucket => ({
    date: bucket.label,
    timestamp: bucket.start,
    value: questions.filter(q => {
      const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      return createdAt >= bucket.start && createdAt < bucket.end;
    }).length,
  }));
}

function calculateDayOfWeekStats(questions) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const stats = days.map(day => ({ day, count: 0, revenue: 0, avgResponseTime: 0 }));

  questions.forEach(q => {
    const date = new Date((q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at) * 1000);
    const dayIndex = date.getDay();
    
    stats[dayIndex].count++;
    stats[dayIndex].revenue += (q.price_cents || 0) / 100;
  });

  // Calculate average response time per day
  questions.forEach(q => {
    if (!q.created_at || !q.answered_at) return;
    const date = new Date((q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at) * 1000);
    const dayIndex = date.getDay();
    const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
    const answeredAt = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
    const responseTime = (answeredAt - createdAt) / 3600;
    
    if (stats[dayIndex].count > 0) {
      stats[dayIndex].avgResponseTime = 
        (stats[dayIndex].avgResponseTime * (stats[dayIndex].count - 1) + responseTime) / stats[dayIndex].count;
    }
  });

  return stats;
}

function getTimeInterval(dateRange) {
  if (!dateRange.start || !dateRange.end) return 'day';
  
  const diffDays = (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24);
  
  if (diffDays <= 7) return 'day';
  if (diffDays <= 60) return 'week';
  return 'month';
}

function createTimeBuckets(dateRange, interval) {
  const buckets = [];
  const now = Date.now();
  
  let start = dateRange.start || now - 30 * 24 * 60 * 60 * 1000; // Default 30 days
  const end = dateRange.end || now;

  if (interval === 'day') {
    let current = new Date(start);
    current.setHours(0, 0, 0, 0);
    
    while (current.getTime() < end) {
      const next = new Date(current);
      next.setDate(next.getDate() + 1);
      
      buckets.push({
        start: current.getTime() / 1000,
        end: next.getTime() / 1000,
        label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
      
      current = next;
    }
  } else if (interval === 'week') {
    let current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const day = current.getDay();
    current.setDate(current.getDate() - day); // Start of week
    
    while (current.getTime() < end) {
      const next = new Date(current);
      next.setDate(next.getDate() + 7);
      
      buckets.push({
        start: current.getTime() / 1000,
        end: next.getTime() / 1000,
        label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
      
      current = next;
    }
  } else {
    let current = new Date(start);
    current.setDate(1);
    current.setHours(0, 0, 0, 0);
    
    while (current.getTime() < end) {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      
      buckets.push({
        start: current.getTime() / 1000,
        end: next.getTime() / 1000,
        label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
      
      current = next;
    }
  }

  return buckets;
}

function generateInsights(data) {
  const insights = [];

  // Revenue insight
  if (data.totalRevenue > 0) {
    insights.push({
      type: 'revenue',
      icon: '💰',
      title: 'Total Revenue',
      value: `$${data.totalRevenue.toLocaleString()}`,
      description: `from ${data.answeredCount} answered questions`,
    });
  }

  // Response time insight
  if (data.avgResponseTime > 0) {
    const isGood = data.avgResponseTime < 24;
    insights.push({
      type: 'response-time',
      icon: isGood ? '⚡' : '⏱️',
      title: isGood ? 'Fast Response Time' : 'Response Time',
      value: `${data.avgResponseTime.toFixed(1)}h`,
      description: isGood ? 'You respond faster than 24h SLA!' : 'Average time to answer',
    });
  }

  // Best day insight
  if (data.dayOfWeekStats.length > 0) {
    const bestDay = [...data.dayOfWeekStats].sort((a, b) => b.count - a.count)[0];
    if (bestDay.count > 0) {
      insights.push({
        type: 'best-day',
        icon: '📅',
        title: 'Most Productive Day',
        value: bestDay.day,
        description: `${bestDay.count} questions answered`,
      });
    }
  }

  // Rating insight
  if (data.avgRating > 0) {
    insights.push({
      type: 'rating',
      icon: data.avgRating >= 4.5 ? '⭐' : '👍',
      title: 'Average Rating',
      value: data.avgRating.toFixed(1),
      description: data.avgRating >= 4.5 ? 'Excellent customer satisfaction!' : 'Good customer satisfaction',
    });
  }

  return insights;
}

export function exportAnalyticsCSV(analytics, questions) {
  const headers = ['Date', 'Question', 'User', 'Price', 'Response Time (h)', 'Rating', 'Status'];
  
  const rows = questions
    .filter(q => q.answered_at)
    .map(q => {
      const createdAt = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      const answeredAt = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
      const responseTime = ((answeredAt - createdAt) / 3600).toFixed(1);
      
      return [
        new Date(createdAt * 1000).toLocaleDateString(),
        `"${(q.question_text || '').replace(/"/g, '""')}"`,
        q.user_name || 'Anonymous',
        (q.price_cents || 0) / 100,
        responseTime,
        q.rating || '',
        q.status,
      ];
    });

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  return csv;
}