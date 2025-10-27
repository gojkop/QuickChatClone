# Dashboard Analytics Endpoint - Deployment Guide

**Endpoint:** `GET /me/dashboard-analytics`
**Status:** 🔴 Not Yet Deployed
**Priority:** High
**Estimated Time:** 30-45 minutes
**Difficulty:** Medium

---

## Quick Start

This endpoint calculates all dashboard metrics from ALL of an expert's questions in a single optimized query. Currently, the frontend uses a fallback that fetches 100 questions and calculates client-side. Implementing this endpoint will make metrics 100% accurate and improve performance.

**What You'll Create:**
- Single GET endpoint that returns pre-calculated metrics
- 7-step function stack in Xano
- Server-side calculations from ALL questions (not just 100)

---

## Step-by-Step Deployment

### Step 1: Access Xano Dashboard

1. Log in to Xano: https://xano.com
2. Select your workspace
3. Navigate to **API Groups**
4. Select **Authentication API** (`api:3B14WLbJ`)

### Step 2: Create New Endpoint

1. Click **"Add Endpoint"**
2. Configure basic settings:
   - **Method:** GET
   - **Path:** `/me/dashboard-analytics`
   - **Description:** "Calculate all dashboard metrics for authenticated expert"
   - **Authentication:** **Enabled** (Bearer token required)

### Step 3: Build Function Stack

You'll add 7 function steps. Follow each carefully:

---

#### **Function 1: Authenticate User**

- **Function Type:** Authenticate User
- **Output Variable:** `$user`
- **Purpose:** Get authenticated user from Bearer token

**Configuration:**
- No additional configuration needed
- Xano automatically validates the Bearer token

---

#### **Function 2: Get Expert Profile**

- **Function Type:** Get Record
- **Table:** `expert_profile`
- **Output Variable:** `$expert_profile`

**Filter Configuration:**
- Field: `expert_profile.user_id`
- Operator: `=`
- Value: `$user.id`

**Return Type:** Single Record

---

#### **Function 3: Check Profile Exists**

- **Function Type:** Conditional
- **Condition:** `$expert_profile` **is null**

**If TRUE (no profile):**
- Add **Stop & Debug** function
- Status Code: `404`
- Message:
```json
{
  "error": "Expert profile not found",
  "message": "User does not have an expert profile"
}
```

**If FALSE (profile exists):**
- Do nothing (continue to next step)

---

#### **Function 4: Calculate Timestamps**

- **Function Type:** Run Lambda
- **Output Variable:** `$timestamps`

**Lambda Code:**
```javascript
// Current timestamp
var now = Date.now();
var nowSeconds = Math.floor(now / 1000);

// Current month boundaries
var currentDate = new Date();
var monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
var monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

var monthStartSeconds = Math.floor(monthStart.getTime() / 1000);
var monthEndSeconds = Math.floor(monthEnd.getTime() / 1000);
```

**Tips:**
- Click "Add Lambda" function
- Paste the code exactly as shown
- Ensure output variable is named `timestamps`

---

#### **Function 5: Query ALL Questions**

- **Function Type:** Get Records
- **Table:** `question`
- **Output Variable:** `$all_questions`

**Filter Configuration:**
- Field: `question.expert_profile_id`
- Operator: `=`
- Value: `$expert_profile.id`

**Return Type:** List (all records)

**Important:** Do NOT add pagination or limits. We need ALL questions.

---

#### **Function 6: Calculate All Metrics**

- **Function Type:** Run Lambda
- **Output Variable:** `$metrics`

**Lambda Code:**
```javascript
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
  revenueChange: 0,
  totalQuestions: questions.length
};
```

**⚠️ CRITICAL:**
- Use `$var.all_questions[i]` NOT `questions[i]` inside the loop
- Xano Lambda requires `$var` prefix for variables from previous steps
- Paste the entire code block exactly as shown
- Ensure output variable is named `metrics`

---

#### **Function 7: Return Response**

- **Function Type:** Response
- **Status Code:** 200
- **Content:** `$metrics`

**Configuration:**
- Status Code: `200`
- Response Content: Select `$metrics` from dropdown

---

### Step 4: Save Endpoint

1. Click **"Save"** in top-right corner
2. Endpoint should now appear in your API list
3. Full path: `https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ/me/dashboard-analytics`

---

## Testing

### Test in Xano (Run & Debug)

1. Click on your new endpoint
2. Click **"Run & Debug"** button
3. Add authentication header:
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer {your_token}`

**Get Your Token:**
```javascript
// In browser console on mindpick.me
localStorage.getItem('qc_token')
```

4. Click **"Run"**
5. Check **Response** tab

### Expected Response (New Expert)

```json
{
  "thisMonthRevenue": 0,
  "avgResponseTime": 0,
  "avgRating": 0,
  "urgentCount": 0,
  "pendingCount": 0,
  "answeredCount": 0,
  "thisMonthAnsweredCount": 0,
  "avgRevenuePerQuestion": 0,
  "slaComplianceRate": 0,
  "revenueChange": 0,
  "totalQuestions": 0
}
```

### Expected Response (Expert with Questions)

```json
{
  "thisMonthRevenue": 1250.50,
  "avgResponseTime": 4.2,
  "avgRating": 4.8,
  "urgentCount": 2,
  "pendingCount": 5,
  "answeredCount": 47,
  "thisMonthAnsweredCount": 12,
  "avgRevenuePerQuestion": 104.21,
  "slaComplianceRate": 95.7,
  "revenueChange": 0,
  "totalQuestions": 52
}
```

---

## Verification Checklist

After deploying, verify:

- [ ] Endpoint appears in Authentication API list
- [ ] "Run & Debug" returns 200 status
- [ ] Response contains all 11 metrics
- [ ] `thisMonthRevenue` is in dollars (not cents)
- [ ] `totalQuestions` matches actual count in database
- [ ] New expert returns all zeros (not errors)
- [ ] Metrics match expected values

---

## Frontend Integration

**Good News:** Frontend is already integrated! Once you deploy this endpoint:

1. Dashboard automatically detects endpoint exists
2. Switches from fallback (100 questions) to optimized mode
3. Fetches only 10 questions for widgets
4. Uses server-calculated metrics
5. No frontend deployment needed!

**What Changes Automatically:**
- Console warning disappears
- Dashboard fetches 10 questions instead of 100
- Metrics based on ALL questions (100% accurate)
- Faster load times

---

## Troubleshooting

### Issue: "Cannot read property 'length' of undefined"

**Cause:** Not using `$var` prefix in Lambda code
**Fix:** Change `questions[i]` to `$var.all_questions[i]`

### Issue: All metrics return 0

**Cause:** Timestamp comparison issues
**Fix:** Verify timestamp normalization logic:
```javascript
var created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
```

### Issue: 404 "Expert profile not found"

**Cause:** User doesn't have expert profile
**Fix:** Ensure test user is an expert with profile created

### Issue: Urgent count shows all pending questions

**Cause:** SLA calculation logic error
**Fix:** Verify condition: `hoursRemaining < 2 && hoursRemaining > 0`

### Issue: Revenue shows cents instead of dollars

**Cause:** Missing division by 100
**Fix:** Verify: `thisMonthRevenueCents / 100`

---

## Performance Impact

**Before (Fallback Mode):**
- Fetches 100 questions
- Calculates client-side on every render
- Metrics from only 100 questions (inaccurate)
- ~5KB data transferred

**After (Optimized Mode):**
- Single analytics call (~500 bytes)
- Fetches 10 questions for widgets (~2KB)
- Metrics from ALL questions (100% accurate)
- Server-side calculation (instant)
- Total: ~2.5KB data transferred

**For expert with 1000 questions:**
- Data transfer: 5KB → 2.5KB (50% reduction)
- Accuracy: 100 questions → 1000 questions (10x improvement)
- Load time: Faster (server-side calculation)

---

## Post-Deployment

After successful deployment:

1. **Test in Production:**
   - Load dashboard on mindpick.me
   - Check browser console (warning should disappear)
   - Verify metrics display correctly

2. **Monitor Logs:**
   - Check Vercel function logs for any errors
   - Monitor Xano analytics for endpoint usage

3. **Update Documentation:**
   - Mark endpoint as ✅ Deployed
   - Update status in this file

---

## Related Files

- **XanoScript Spec:** `/docs/api-database/endpoints/me/GET-dashboard-analytics.xs`
- **Implementation Guide:** `/docs/api-database/DASHBOARD-ANALYTICS-IMPLEMENTATION.md`
- **Frontend Hook:** `/src/hooks/useDashboardAnalytics.js`
- **Metrics Hook:** `/src/hooks/dashboardv2/useMetrics.js`
- **Dashboard Page:** `/src/pages/ExpertDashboardPageV2.jsx`

---

## Support

If you encounter issues during deployment:

1. Check Xano function stack logs
2. Verify Lambda code has no syntax errors
3. Test with "Run & Debug" before going live
4. Check that all variable names match exactly (`$metrics`, `$timestamps`, etc.)

---

**Deployment Status:** 🔴 Not Yet Deployed
**Last Updated:** January 2025
**Ready for Production:** ✅ Yes
