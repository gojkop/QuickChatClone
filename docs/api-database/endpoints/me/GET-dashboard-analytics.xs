# GET /me/dashboard-analytics
# Calculate all dashboard metrics for authenticated expert
# Returns pre-calculated analytics for optimal dashboard performance

# ==============================================================================
# XANO ENDPOINT CONFIGURATION
# ==============================================================================
# Method: GET
# Path: /me/dashboard-analytics
# API Group: Authentication API (api:3B14WLbJ)
# Authentication: Required (Bearer token)
# Description: Calculate dashboard metrics from ALL expert's questions
# ==============================================================================

# ==============================================================================
# FUNCTION STACK - Step 1: Authenticate User
# ==============================================================================
# Function: Authenticate User
# Output Variable: $user
# Description: Get authenticated user from Bearer token

auth.user as $user

# ==============================================================================
# FUNCTION STACK - Step 2: Get Expert Profile
# ==============================================================================
# Function: Get Record
# Table: expert_profile
# Filter: expert_profile.user_id = $user.id
# Return: Single Record
# Output Variable: $expert_profile

db.query expert_profile {
  where = $db.expert_profile.user_id == $user.id
  return = {type: "single"}
} as $expert_profile

# ==============================================================================
# FUNCTION STACK - Step 3: Check Expert Profile Exists
# ==============================================================================
# Function: Conditional
# Condition: $expert_profile is null
# Description: Return 404 if no expert profile found

if (!$expert_profile) {
  api.response {
    status = 404
    content = {
      error: "Expert profile not found",
      message: "User does not have an expert profile"
    }
  }
}

# ==============================================================================
# FUNCTION STACK - Step 4: Calculate Timestamps
# ==============================================================================
# Function: Run Lambda
# Output Variable: $timestamps
# Description: Get current timestamp and month boundaries

api.lambda {
  code = """
    // Current timestamp
    var now = Date.now();
    var nowSeconds = Math.floor(now / 1000);

    // Current month boundaries
    var currentDate = new Date();
    var monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    var monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    var monthStartSeconds = Math.floor(monthStart.getTime() / 1000);
    var monthEndSeconds = Math.floor(monthEnd.getTime() / 1000);
  """
} as $timestamps

# ==============================================================================
# FUNCTION STACK - Step 5: Query ALL Questions
# ==============================================================================
# Function: Get Records
# Table: question
# Filter: question.expert_profile_id = $expert_profile.id
# Return: List (all records)
# Output Variable: $all_questions

db.query question {
  where = $db.question.expert_profile_id == $expert_profile.id
  return = {type: "list"}
} as $all_questions

# ==============================================================================
# FUNCTION STACK - Step 6: Calculate All Metrics
# ==============================================================================
# Function: Run Lambda
# Output Variable: $metrics
# Description: Calculate all dashboard metrics from questions
# IMPORTANT: Use $var.all_questions[i] to access questions in loop

api.lambda {
  code = """
    // Get data from previous steps
    var questions = $var.all_questions || [];
    var nowSeconds = $var.timestamps.nowSeconds;
    var monthStartSeconds = $var.timestamps.monthStartSeconds;
    var monthEndSeconds = $var.timestamps.monthEndSeconds;

    // Initialize all metric counters
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

    // Loop through ALL questions
    for (var i = 0; i < questions.length; i++) {
      var q = $var.all_questions[i];

      // Normalize timestamps (handle both seconds and milliseconds)
      var created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
      var answered = q.answered_at && q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;

      // Determine if question is answered
      var isAnswered = !!answered;

      // Determine if question is pending (paid, not answered, not declined)
      var isPending = q.status === 'paid' && !answered && q.pricing_status !== 'offer_declined';

      // ===== ANSWERED QUESTIONS METRICS =====
      if (isAnswered) {
        answeredCount++;

        // This month revenue (only count questions answered this month)
        if (answered >= monthStartSeconds && answered <= monthEndSeconds) {
          thisMonthRevenueCents += (q.price_cents || 0);
          thisMonthAnsweredCount++;
        }

        // Calculate response time (hours from creation to answer)
        if (created && answered) {
          var responseHours = (answered - created) / 3600;
          totalResponseTimeHours += responseHours;
          responseTimeCount++;

          // SLA compliance check (answered within SLA hours)
          var slaHours = q.sla_hours_snapshot || 24;
          if (responseHours <= slaHours) {
            slaComplianceCount++;
          }
        }

        // Collect ratings (only count ratings > 0)
        if (q.rating && q.rating > 0) {
          totalRating += q.rating;
          ratingCount++;
        }
      }

      // ===== PENDING QUESTIONS METRICS =====
      if (isPending) {
        pendingCount++;

        // Check if urgent (less than 2 hours remaining until SLA)
        var hoursSinceCreated = (nowSeconds - created) / 3600;
        var slaHours = q.sla_hours_snapshot || 24;
        var hoursRemaining = slaHours - hoursSinceCreated;

        // Urgent if < 2 hours remaining (but not expired yet)
        if (hoursRemaining < 2 && hoursRemaining > 0) {
          urgentCount++;
        }
      }
    }

    // ===== CALCULATE AVERAGES =====

    // Average response time (hours)
    var avgResponseTime = responseTimeCount > 0
      ? parseFloat((totalResponseTimeHours / responseTimeCount).toFixed(2))
      : 0;

    // Average rating (1-5 scale)
    var avgRating = ratingCount > 0
      ? parseFloat((totalRating / ratingCount).toFixed(1))
      : 0;

    // Average revenue per question (this month only, in dollars)
    var avgRevenuePerQuestion = thisMonthAnsweredCount > 0
      ? parseFloat((thisMonthRevenueCents / 100 / thisMonthAnsweredCount).toFixed(2))
      : 0;

    // SLA compliance rate (percentage)
    var slaComplianceRate = answeredCount > 0
      ? parseFloat(((slaComplianceCount / answeredCount) * 100).toFixed(1))
      : 0;

    // This month revenue (convert cents to dollars)
    var thisMonthRevenue = parseFloat((thisMonthRevenueCents / 100).toFixed(2));

    // ===== BUILD RESPONSE OBJECT =====
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

# ==============================================================================
# FUNCTION STACK - Step 7: Return Response
# ==============================================================================
# Function: Response
# Status Code: 200
# Content: $metrics

api.response {
  status = 200
  content = $metrics
}

# ==============================================================================
# EXPECTED RESPONSE FORMAT
# ==============================================================================
# {
#   "thisMonthRevenue": 1250.50,        // Dollars earned this month
#   "avgResponseTime": 4.2,             // Average hours to answer
#   "avgRating": 4.8,                   // Average rating (1-5)
#   "urgentCount": 2,                   // Questions < 2hrs to SLA
#   "pendingCount": 5,                  // Unanswered paid questions
#   "answeredCount": 47,                // Total answered (all time)
#   "thisMonthAnsweredCount": 12,       // Answered this month
#   "avgRevenuePerQuestion": 104.21,    // This month average
#   "slaComplianceRate": 95.7,          // % answered within SLA
#   "revenueChange": 0,                 // % change (TODO)
#   "totalQuestions": 52                // Total questions
# }
