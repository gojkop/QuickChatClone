# GET /me/dashboard-analytics
# Calculate all dashboard metrics for authenticated expert in a single query
# Returns pre-calculated analytics for optimal dashboard performance

# AUTHENTICATION: Required (Bearer token)
# Returns: Dashboard metrics object

# Step 1: Get authenticated user's expert profile
auth.user as $user

db.query expert_profile {
  where = $db.expert_profile.user_id == $user.id
  return = {type: "single"}
} as $expert_profile

# Abort if no expert profile
if (!$expert_profile) {
  api.response {
    status = 404
    content = {error: "Expert profile not found"}
  }
}

# Step 2: Get current timestamp and month boundaries
api.lambda {
  code = """
    var now = Date.now();
    var nowSeconds = Math.floor(now / 1000);

    // Get current month start/end timestamps
    var currentDate = new Date();
    var monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    var monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    var monthStartSeconds = Math.floor(monthStart.getTime() / 1000);
    var monthEndSeconds = Math.floor(monthEnd.getTime() / 1000);
  """
} as $timestamps

# Step 3: Query ALL questions for this expert (for comprehensive calculations)
db.query question {
  where = $db.question.expert_profile_id == $expert_profile.id
  return = {type: "list"}
} as $all_questions

# Step 4: Calculate all metrics in Lambda function
api.lambda {
  code = """
    var questions = $var.all_questions || [];
    var nowSeconds = $var.timestamps.nowSeconds;
    var monthStartSeconds = $var.timestamps.monthStartSeconds;
    var monthEndSeconds = $var.timestamps.monthEndSeconds;

    // Initialize metrics
    var thisMonthRevenueCents = 0;
    var totalResponseTimeHours = 0;
    var responseTimeCount = 0;
    var totalRating = 0;
    var ratingCount = 0;
    var urgentCount = 0;
    var pendingCount = 0;
    var answeredCount = 0;
    var thisMonthAnsweredCount = 0;
    var slaComplianceCount = 0;

    // Process each question
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];

      // Normalize timestamps (handle milliseconds)
      var created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      var answered = q.answered_at && q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;

      // Check if answered
      var isAnswered = !!answered;

      // Check if pending (paid, not answered, not declined)
      var isPending = q.status === 'paid' && !answered && q.pricing_status !== 'offer_declined';

      // Count answered questions
      if (isAnswered) {
        answeredCount++;

        // This month revenue
        if (answered >= monthStartSeconds && answered <= monthEndSeconds) {
          thisMonthRevenueCents += (q.price_cents || 0);
          thisMonthAnsweredCount++;
        }

        // Calculate response time
        if (created && answered) {
          var responseHours = (answered - created) / 3600;
          totalResponseTimeHours += responseHours;
          responseTimeCount++;

          // SLA compliance check
          var slaHours = q.sla_hours_snapshot || 24;
          if (responseHours <= slaHours) {
            slaComplianceCount++;
          }
        }

        // Average rating
        if (q.rating && q.rating > 0) {
          totalRating += q.rating;
          ratingCount++;
        }
      }

      // Count pending questions
      if (isPending) {
        pendingCount++;

        // Check if urgent (< 2 hours to SLA)
        var hoursSinceCreated = (nowSeconds - created) / 3600;
        var slaHours = q.sla_hours_snapshot || 24;
        var hoursRemaining = slaHours - hoursSinceCreated;

        if (hoursRemaining < 2 && hoursRemaining > 0) {
          urgentCount++;
        }
      }
    }

    // Calculate averages
    var avgResponseTime = responseTimeCount > 0
      ? parseFloat((totalResponseTimeHours / responseTimeCount).toFixed(2))
      : 0;

    var avgRating = ratingCount > 0
      ? parseFloat((totalRating / ratingCount).toFixed(1))
      : 0;

    var avgRevenuePerQuestion = thisMonthAnsweredCount > 0
      ? parseFloat((thisMonthRevenueCents / 100 / thisMonthAnsweredCount).toFixed(2))
      : 0;

    var slaComplianceRate = answeredCount > 0
      ? parseFloat(((slaComplianceCount / answeredCount) * 100).toFixed(1))
      : 0;

    var thisMonthRevenue = parseFloat((thisMonthRevenueCents / 100).toFixed(2));

    // Return metrics object
    var metrics = {
      thisMonthRevenue: thisMonthRevenue,
      avgResponseTime: avgResponseTime,
      avgRating: avgRating,
      urgentCount: urgentCount,
      pendingCount: pendingCount,
      answeredCount: answeredCount,
      thisMonthAnsweredCount: thisMonthAnsweredCount,
      avgRevenuePerQuestion: avgRevenuePerQuestion,
      slaComplianceRate: slaComplianceRate,
      revenueChange: 0,  // TODO: Calculate from previous month
      totalQuestions: questions.length
    };
  """
} as $metrics

# Step 5: Return metrics
api.response {
  status = 200
  content = $metrics
}
