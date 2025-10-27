# Dashboard Analytics Endpoint Implementation Guide

**Status:** 🔴 Needs Implementation in Xano
**Priority:** High - Critical for accurate dashboard metrics
**Date:** January 2025

## Problem Statement

The dashboard was calculating metrics from only the first 10 questions (one page), resulting in:
- ❌ Inaccurate revenue calculations
- ❌ Wrong average response time
- ❌ Incorrect average ratings
- ❌ Misleading urgent question count
- ❌ Incomplete avg revenue per question

## Solution

Create a server-side `/me/dashboard-analytics` endpoint that calculates all metrics from ALL questions in a single optimized query.

---

## Xano Endpoint Configuration

### Basic Settings

- **Method:** GET
- **Path:** `/me/dashboard-analytics`
- **API Group:** Authentication API (`api:3B14WLbJ`)
- **Authentication:** Required (Bearer token)
- **Description:** Calculate all dashboard metrics for authenticated expert

### Function Stack

#### Step 1: Get Authenticated User
**Function:** Authenticate User
**Output Variable:** `$user`

#### Step 2: Get Expert Profile
**Function:** Get Record from `expert_profile` table
**Filter:** `expert_profile.user_id` = `$user.id`
**Output Variable:** `$expert_profile`

#### Step 3: Check if Expert Profile Exists
**Function:** Conditional
**Condition:** `$expert_profile` is null

**If TRUE (no profile):**
- **Stop & Debug:** 404 error "Expert profile not found"

**If FALSE (profile exists):**
- Continue to next step

#### Step 4: Get Current Timestamps
**Function:** Run Lambda
**Output Variable:** `$timestamps`

**Lambda Code:**
```javascript
var now = Date.now();
var nowSeconds = Math.floor(now / 1000);

// Get current month start/end timestamps
var currentDate = new Date();
var monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
var monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

var monthStartSeconds = Math.floor(monthStart.getTime() / 1000);
var monthEndSeconds = Math.floor(monthEnd.getTime() / 1000);
```

#### Step 5: Query ALL Questions
**Function:** Get Records from `question` table
**Filter:** `question.expert_profile_id` = `$expert_profile.id`
**Return:** List
**Output Variable:** `$all_questions`

#### Step 6: Calculate All Metrics
**Function:** Run Lambda
**Output Variable:** `$metrics`

**Lambda Code:**
```javascript
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
  var q = $var.all_questions[i];

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
```

**⚠️ IMPORTANT:** Use `$var.all_questions[i]` inside the loop, not just `questions[i]`. Xano Lambda requires `$var` prefix for variables from previous steps.

#### Step 7: Return Response
**Function:** Response
**Status Code:** 200
**Content:** `$metrics`

---

## Expected Response Format

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

## Metric Definitions

| Metric | Formula | Description |
|--------|---------|-------------|
| **thisMonthRevenue** | SUM(price_cents WHERE answered_at THIS MONTH) / 100 | Total revenue earned this calendar month (dollars) |
| **avgResponseTime** | AVG((answered_at - created_at) / 3600) | Average hours taken to answer questions |
| **avgRating** | AVG(rating WHERE rating > 0) | Average customer rating (1-5 scale) |
| **urgentCount** | COUNT(pending WHERE hours_remaining < 2) | Questions with less than 2 hours until SLA breach |
| **pendingCount** | COUNT(status='paid' AND !answered_at AND pricing_status != 'offer_declined') | Unanswered paid questions |
| **answeredCount** | COUNT(answered_at EXISTS) | Total questions answered (all time) |
| **thisMonthAnsweredCount** | COUNT(answered_at THIS MONTH) | Questions answered this calendar month |
| **avgRevenuePerQuestion** | thisMonthRevenue / thisMonthAnsweredCount | Average earnings per question this month |
| **slaComplianceRate** | (COUNT answered within SLA / answeredCount) * 100 | Percentage of questions answered within SLA |
| **revenueChange** | ((thisMonth - lastMonth) / lastMonth) * 100 | Percentage change from last month (TODO) |
| **totalQuestions** | COUNT(all questions) | Total questions received (all time) |

---

## Testing

### Manual Test in Xano

1. Open Xano → API Groups → Authentication API
2. Find `/me/dashboard-analytics` endpoint
3. Click "Run & Debug"
4. Add authentication header:
   - Header: `Authorization`
   - Value: `Bearer {your_token}`
5. Click "Run"
6. Verify response contains all metrics

### Test with Real Token

Get your token from browser console:
```javascript
localStorage.getItem('qc_token')
```

### Expected Behavior

**For new expert (no questions):**
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

**For expert with questions:**
- All metrics should be non-zero if questions exist
- `thisMonthRevenue` should only count current month
- `urgentCount` should only show questions < 2hrs to SLA
- `avgRevenuePerQuestion` should divide current month revenue by current month answers

---

## Frontend Integration

The frontend is already updated to use this endpoint:

**Files Modified:**
1. `/src/hooks/useDashboardAnalytics.js` - New hook to fetch analytics
2. `/src/hooks/dashboardv2/useMetrics.js` - Updated to accept pre-calculated metrics
3. `/src/pages/ExpertDashboardPageV2.jsx` - Uses `useDashboardAnalytics()`

**Usage in Dashboard:**
```javascript
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { useMetrics } from '@/hooks/dashboardv2/useMetrics';

// Fetch pre-calculated analytics
const { data: analyticsData } = useDashboardAnalytics();

// Use pre-calculated metrics (no client-side calculation)
const metrics = useMetrics([], analyticsData);
```

---

## Performance Benefits

**Before (calculating from 10 questions):**
- ❌ Inaccurate metrics (only 10 questions sampled)
- ❌ Misleading revenue numbers
- ❌ Client-side calculations on every render

**After (server-side from ALL questions):**
- ✅ 100% accurate metrics (all questions included)
- ✅ Single optimized database query
- ✅ Cached for 1 minute on client
- ✅ No client-side calculation overhead

**For expert with 1000 questions:**
- **Data transferred:** ~200KB → ~500 bytes (99.75% reduction)
- **Calculation time:** Client-side → Server-side (instant)
- **Accuracy:** 10 questions → 1000 questions (100x improvement)

---

## Troubleshooting

### Issue: "Cannot read property 'length' of undefined"

**Cause:** Not using `$var` prefix in Lambda
**Fix:** Change `questions[i]` to `$var.all_questions[i]`

### Issue: Metrics all returning 0

**Cause:** Timestamp comparison issues
**Fix:** Ensure timestamp normalization (milliseconds → seconds)

### Issue: 404 "Expert profile not found"

**Cause:** User doesn't have expert profile
**Fix:** Ensure user is authenticated expert with profile

### Issue: Urgent count showing all pending

**Cause:** Wrong SLA calculation
**Fix:** Verify `hoursRemaining < 2 && hoursRemaining > 0`

---

## Future Enhancements

1. **Previous Month Comparison:**
   - Calculate `revenueChange` by comparing to previous month
   - Requires querying previous month's data

2. **Caching:**
   - Cache results in Xano for 1 minute
   - Reduce database load for frequent requests

3. **Additional Metrics:**
   - Deep Dive vs Quick Consult breakdown
   - Revenue by tier
   - Busiest days/hours
   - Customer retention rate

---

## Related Documentation

- XanoScript Specification: `/docs/api-database/endpoints/me/dashboard-analytics.xs`
- Performance Optimization Guide: `/docs/PERFORMANCE-OPTIMIZATION-OCT-2025.md`
- Dashboard Metrics Hook: `/src/hooks/dashboardv2/useMetrics.js`
- Analytics Hook: `/src/hooks/useDashboardAnalytics.js`

---

## Implementation Checklist

- [ ] Create `/me/dashboard-analytics` endpoint in Xano
- [ ] Add 7 function stack steps (authenticate, query, calculate, respond)
- [ ] Test with authenticated token in Run & Debug
- [ ] Verify metrics accuracy with real data
- [ ] Test zero state (new expert with no questions)
- [ ] Deploy to production
- [ ] Monitor for errors in Vercel logs
- [ ] Verify dashboard loads with accurate metrics

**Estimated Time:** 30-45 minutes
**Difficulty:** Medium (requires careful Lambda code entry)
