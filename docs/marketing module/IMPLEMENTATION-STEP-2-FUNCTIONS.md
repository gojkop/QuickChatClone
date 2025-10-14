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
**Count:** Enable
**Save result as:** `visitCount`

#### Step 2: Query - Get Conversions with Question Data
**Type:** Query All Records
**Table:** `campaign_visits`
**Filters:**
- `campaign_id` = `input.campaign_id`
- `converted_to_question` = `true`

**Relationships:** Load `question` (to get price_cents)
**Save result as:** `conversions`

#### Step 3: Custom Code - Calculate Metrics
```javascript
// Calculate total questions
var totalQuestions = conversions.length

// Calculate total revenue
var totalRevenue = 0
for (var i = 0; i < conversions.length; i++) {
  var visit = conversions[i]
  if (visit.question && visit.question.price_cents) {
    totalRevenue = totalRevenue + visit.question.price_cents
  }
}

// Calculate conversion rate
var conversionRate = visitCount > 0
  ? (totalQuestions / visitCount) * 100
  : 0

// Return calculated values
return {
  totalQuestions: totalQuestions,
  totalRevenue: totalRevenue,
  conversionRate: parseFloat(conversionRate.toFixed(2))
}
```
**Save result as:** `metrics`

#### Step 4: Update - Update Campaign Record
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

#### Step 5: Return - Success Response
```javascript
return {
  success: true,
  campaign_id: input.campaign_id,
  total_visits: visitCount,
  total_questions: metrics.totalQuestions,
  total_revenue_cents: metrics.totalRevenue,
  conversion_rate: metrics.conversionRate
}
```

### Testing
1. Create test campaign and visits first
2. Run function in Xano debugger: `update_campaign_metrics({campaign_id: 1})`
3. Verify campaign record is updated correctly

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
