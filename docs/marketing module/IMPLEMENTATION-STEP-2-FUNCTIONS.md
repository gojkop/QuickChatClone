# Marketing Module - Step 2: Xano Functions

## Overview
These background functions handle metric aggregation and campaign attribution.

---

## Function 1: update_campaign_metrics

### Purpose
Recalculates campaign statistics (visits, questions, revenue, conversion rate).

### How to Create
1. Go to Xano → **Functions** → **Add Function**
2. Name: `update_campaign_metrics`
3. Type: **Function Stack**

### Inputs
Add this input parameter:
- `campaign_id` (Integer, **Required**)

### Function Stack Logic

#### Step 1: Query - Count Total Visits
**Type:** Query All Records
**Table:** `campaign_visits`
**Filter:** `campaign_id` = `input.campaign_id`
**Output tab → Enable Count**
**Save result as:** `visitCount`

#### Step 2: Query - Get Conversions
**Type:** Query All Records
**Table:** `campaign_visits`
**Filters:**
- `campaign_id` = `input.campaign_id`
- `converted_to_question` = `true`

**Important:** Do NOT load relationships (they may not work in all Xano setups)
**Save result as:** `conversions`

#### Step 3: Query - Get All Questions
**Type:** Query All Records
**Table:** `question`
**No filters** (load all questions)
**Select only these fields:** `id`, `price_cents`
**Save result as:** `all_questions`

#### Step 4: Custom Code - Calculate Metrics
**Type:** Lambda Function

**Important:** Use `$var.variableName` syntax to access variables from previous steps in Xano Lambda functions.

```javascript
// Build a map of question prices for fast lookup
var priceMap = {}
for (var i = 0; i < $var.all_questions.length; i++) {
  var q = $var.all_questions[i]
  priceMap[q.id] = q.price_cents || 0
}

// Calculate total revenue
var totalRevenue = 0
for (var j = 0; j < $var.conversions.length; j++) {
  var conversion = $var.conversions[j]
  var questionId = conversion.question_id
  if (questionId && priceMap[questionId]) {
    totalRevenue = totalRevenue + priceMap[questionId]
  }
}

// Calculate metrics
var totalQuestions = $var.conversions.length
var conversionRate = $var.visitCount > 0 ? (totalQuestions / $var.visitCount) * 100 : 0

return {
  totalQuestions: totalQuestions,
  totalRevenue: totalRevenue,
  conversionRate: parseFloat(conversionRate.toFixed(2))
}
```
**Save result as:** `metrics`

#### Step 5: Update - Update Campaign Record
**Type:** Update Record
**Table:** `utm_campaigns`
**Record ID:** `input.campaign_id`
**Fields to Update:**
- `total_visits` = `visitCount`
- `total_questions` = `metrics.totalQuestions`
- `total_revenue_cents` = `metrics.totalRevenue`
- `conversion_rate` = `metrics.conversionRate`
- `updated_at` = `now()`
- `last_visit_at` = `now()`

#### Step 6: Return - Success Response
In the **Response** section at the bottom:

**Return as:** `result`

Use the visual editor or JSON to return:
```javascript
{
  "success": true,
  "campaign_id": $input.campaign_id,
  "total_visits": $var.visitCount,
  "total_questions": $var.metrics.totalQuestions,
  "total_revenue_cents": $var.metrics.totalRevenue,
  "conversion_rate": $var.metrics.conversionRate
}
```

### Testing
1. Create test campaign and visits first
2. Run function in Xano debugger: `update_campaign_metrics({campaign_id: 1})`
3. Verify campaign record is updated correctly
4. Verify `total_revenue_cents` is calculated correctly (not 0)

---

## Function 2: link_question_to_campaign

### Purpose
Links newly created questions to recent campaign visits for attribution.

### How to Create
1. Go to Xano → **Functions** → **Add Function**
2. Name: `link_question_to_campaign`
3. Type: **Function Stack**

### Inputs
Add these input parameters:
- `question_id` (Integer, **Required**)
- `visitor_ip_hash` (Text, **Required**)
- `expert_profile_id` (Integer, **Required**)

### Function Stack Logic

#### Step 1: Custom Code - Calculate Time Window
```javascript
// Find visits from last 1 hour (3600 seconds)
var oneHourAgo = new Date(Date.now() - 3600000)
return { oneHourAgo: oneHourAgo }
```
**Save result as:** `timeWindow`

#### Step 2: Query - Find Recent Visit
**Type:** Query All Records
**Table:** `campaign_visits`
**Filters:**
- `visitor_ip_hash` = `input.visitor_ip_hash`
- `expert_profile_id` = `input.expert_profile_id`
- `converted_to_question` = `false`
- `visited_at` >= `timeWindow.oneHourAgo`

**Order By:** `visited_at` DESC
**Limit:** 1
**Save result as:** `recentVisits`

#### Step 3: Conditional - Check if Visit Found
**Type:** Conditional
**Condition:** `recentVisits.length > 0`

**IF TRUE:**

##### 3a. Extract - Get First Visit
```javascript
var visit = recentVisits[0]
return { visitId: visit.id, campaignId: visit.campaign_id }
```
**Save as:** `visitData`

##### 3b. Update - Mark as Converted
**Type:** Update Record
**Table:** `campaign_visits`
**Record ID:** `visitData.visitId`
**Fields:**
- `converted_to_question` = `true`
- `question_id` = `input.question_id`

##### 3c. Run Function - Update Campaign Metrics (Async)
**Type:** Run Function (Background)
**Function:** `update_campaign_metrics`
**Parameters:** `{ campaign_id: visitData.campaignId }`

##### 3d. Return - Success
```javascript
return {
  linked: true,
  campaign_id: visitData.campaignId,
  visit_id: visitData.visitId
}
```

**IF FALSE:**

##### 3e. Return - Not Found
```javascript
return {
  linked: false,
  reason: 'No recent campaign visit found'
}
```

### Testing
1. Create test visit with known `visitor_ip_hash`
2. Create test question
3. Run function: `link_question_to_campaign({question_id: 1, visitor_ip_hash: "test_123", expert_profile_id: 1})`
4. Verify visit record is updated with `converted_to_question = true`

---

## Verification Checklist

After creating functions:

- [ ] `update_campaign_metrics` function created
- [ ] `link_question_to_campaign` function created
- [ ] Both functions tested with debugger
- [ ] Test campaign metrics updated correctly
- [ ] Test question linked to visit correctly

---

## Next Steps

Once functions are working:
→ **Proceed to Step 3:** Create API Endpoints

---

## Troubleshooting & Lessons Learned

### Issue: Lambda Functions Returning 0 for Revenue

**Symptoms:**
- `total_revenue_cents` always returns 0
- Lambda function can't access variables from previous steps
- Errors like "Cannot find name 'conversions'" or "Cannot read properties of undefined"

**Root Causes:**
1. **Variable scoping in Xano Lambda:** Lambda functions cannot directly access variables from previous steps by typing their names
2. **Relationships don't work:** Some Xano setups don't support relationship loading between tables
3. **Incorrect variable syntax:** Must use `$var.variableName` to access function stack variables

**Solutions That DON'T Work:**
- ❌ Loading relationships on queries (`question` relationship on `campaign_visits`)
- ❌ Using SQL queries with parameter syntax like `{{campaign_id}}` or `$campaign_id`
- ❌ For Each loops with Get Record (scoping issues)
- ❌ Passing arrays to helper functions (arrays become empty)
- ❌ Typing variable names directly in Lambda (e.g., `conversions.length`)

**Solution That WORKS:**
1. Query all questions separately (Step 3)
2. Use `$var.variableName` syntax in Lambda to access:
   - `$var.all_questions`
   - `$var.conversions`
   - `$var.visitCount`
3. Build a price map (object) for fast lookup
4. Loop through conversions and sum prices from the map

**Key Syntax Rule:**
```javascript
// ❌ WRONG - Direct variable access doesn't work
var total = 0
for (var i = 0; i < conversions.length; i++) {
  var c = conversions[i]
  // ...
}

// ✅ CORRECT - Must use $var prefix
var total = 0
for (var i = 0; i < $var.conversions.length; i++) {
  var c = $var.conversions[i]
  // ...
}
```

### Date: October 16, 2025

**Status:** ✅ Resolved - Revenue calculation working correctly
