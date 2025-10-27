// src/hooks/dashboardv2/useMetrics.js
import { useMemo } from 'react';

/**
 * Calculate dashboard metrics from questions data
 * Ensures all values are safe (no NaN, no undefined)
 */
export function useMetrics(questions = []) {
  return useMemo(() => {
    const safeQuestions = Array.isArray(questions) ? questions : [];
    
    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter questions by status and time
    const answeredQuestions = safeQuestions.filter(q => 
      q.answered_at && q.status === 'paid'
    );
    
    const pendingQuestions = safeQuestions.filter(q => 
      !q.answered_at && q.status === 'paid'
    );
    
    // This month's answered questions
    const thisMonthAnswered = answeredQuestions.filter(q => {
      const answeredDate = new Date(q.answered_at * 1000);
      return answeredDate.getMonth() === currentMonth && 
             answeredDate.getFullYear() === currentYear;
    });
    
    // Calculate revenue this month (in dollars)
    const thisMonthRevenue = thisMonthAnswered.reduce((sum, q) => {
      const cents = q.price_cents || 0;
      return sum + (cents / 100);
    }, 0);
    
    // Calculate average response time (in hours)
    const responseTimes = answeredQuestions
      .filter(q => q.answered_at && q.created_at)
      .map(q => {
        const created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
        const answered = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
        return (answered - created) / 3600; // Convert to hours
      });
    
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    
    // Calculate average rating
    const ratingsWithScores = answeredQuestions.filter(q => 
      q.rating !== null && q.rating !== undefined && q.rating > 0
    );
    
    const avgRating = ratingsWithScores.length > 0
      ? ratingsWithScores.reduce((sum, q) => sum + q.rating, 0) / ratingsWithScores.length
      : 0;
    
    // Calculate urgent questions (SLA < 2 hours)
    const urgentCount = pendingQuestions.filter(q => {
      if (!q.created_at) return false;
      const created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      const hoursSinceCreated = (Date.now() / 1000 - created) / 3600;
      const slaHours = 24; // Default SLA
      return (slaHours - hoursSinceCreated) < 2;
    }).length;
    
    // Calculate revenue change (mock for now - replace with real last month data)
    const revenueChange = thisMonthRevenue > 0 ? 23.5 : 0; // Mock: +23.5%

    // Calculate average revenue per question (this month)
    const avgRevenuePerQuestion = thisMonthAnswered.length > 0
      ? thisMonthRevenue / thisMonthAnswered.length
      : 0;

    // Calculate SLA compliance rate
    const questionsWithinSLA = answeredQuestions.filter(q => {
      if (!q.answered_at || !q.created_at || !q.sla_hours_snapshot) return false;

      const created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      const answered = q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
      const hoursTaken = (answered - created) / 3600;

      return hoursTaken <= q.sla_hours_snapshot;
    }).length;

    const slaComplianceRate = answeredQuestions.length > 0
      ? (questionsWithinSLA / answeredQuestions.length) * 100
      : 0;

    return {
      // Core metrics
      thisMonthRevenue: parseFloat(thisMonthRevenue.toFixed(2)),
      avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
      avgRating: parseFloat(avgRating.toFixed(1)),
      pendingCount: pendingQuestions.length,
      answeredCount: answeredQuestions.length,
      urgentCount,

      // Derived metrics
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      totalQuestions: safeQuestions.length,
      thisMonthAnsweredCount: thisMonthAnswered.length,
      avgRevenuePerQuestion: parseFloat(avgRevenuePerQuestion.toFixed(2)),
      slaComplianceRate: parseFloat(slaComplianceRate.toFixed(1)),

      // Additional stats
      allQuestions: safeQuestions,
      answeredQuestions,
      pendingQuestions,
    };
  }, [questions]);
}