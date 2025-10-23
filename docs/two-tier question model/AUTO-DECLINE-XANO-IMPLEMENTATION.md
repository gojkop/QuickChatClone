# Auto-Decline Implementation in Xano

**Date:** October 23, 2025
**Issue:** Auto-decline not working - offers below threshold still appearing as pending
**Root Cause:** Frontend auto-decline requires authentication, but question submission is public

---

## Problem

The original auto-decline implementation tried to decline offers from the frontend after question creation:

```javascript
// ❌ This fails with 401 error - decline endpoint requires auth
await fetch(`/api/offers/${questionId}/decline`, {
  method: 'POST',
  // Missing: Authorization header (user not logged in)
});
```

**Why it fails:**
- `/api/offers/[id]/decline` requires authentication (line 18-21)
- Question submission is public (no auth token)
- Auto-decline call returns 401 error
- Question stays as `offer_pending` instead of being declined

---

## Solution: Implement Auto-Decline in Xano

Auto-decline should happen **during question creation** in the Xano endpoint, not after.

### Benefits:
- ✅ No authentication required
- ✅ Atomic operation (question created with correct status)
- ✅ More reliable (no network failures between creation and decline)
- ✅ Cleaner code (one operation instead of two)

---

## Xano Implementation

### Endpoint: POST /question/deep-dive

**Location:** Public API group in Xano

### Current Flow (Broken):

```
Step 1: Get Expert Profile
  ↓
Step 2: Validate Tier2 Enabled
  ↓
Step 3: Check Auto-Decline Threshold
  → If below threshold: return error
  → Blocks question creation ❌
  ↓
[Question never created if below threshold]
```

### New Flow (Correct):

```
Step 1: Get Expert Profile
  ↓
Step 2: Validate Tier2 Enabled
  ↓
Step 3: Check Auto-Decline Threshold (Lambda)
  → Returns: { should_auto_decline: true/false, decline_reason: "..." }
  ↓
Step 4: Calculate conditional values (Lambdas)
  → pricing_status = should_auto_decline ? "offer_declined" : "offer_pending"
  → status = should_auto_decline ? "declined" : "paid"
  → declined_at = should_auto_decline ? Date.now() : null
  ↓
Step 5: Calculate Offer Expiry
  ↓
Step 6: Calculate SLA Snapshot
  ↓
Step 7: Add Question Record
  → Use conditional values from Step 4
  ↓
Step 8: Add Payment Record
  ↓
Step 9: Response
```

---

## Detailed Implementation Steps

### Step 3: Update Auto-Decline Check Lambda

**Find:** Step 3 "Check Auto-Decline Threshold"

**Current code:**
```javascript
if (proposedPrice < autoDeclineThreshold) {
  throw new Error("Offer below threshold"); // ❌ Blocks creation
}
```

**New code:**
```javascript
var autoDeclineThreshold = $var.expert_profile.tier2_auto_decline_below_cents;
var proposedPrice = $var.proposed_price_cents;

// Check if should auto-decline (don't throw error)
if (autoDeclineThreshold && proposedPrice < autoDeclineThreshold) {
  return {
    should_auto_decline: true,
    decline_reason: "Offer below minimum threshold of $" + (autoDeclineThreshold / 100)
  };
}

return {
  should_auto_decline: false,
  decline_reason: null
};
```

**Return as:** `auto_decline_check`

---

### Step 4: Add Conditional Value Lambdas

**Add three new Lambda steps** before "Add Question Record":

#### 4A: Calculate pricing_status

```javascript
return $var.auto_decline_check.should_auto_decline ? "offer_declined" : "offer_pending";
```
**Return as:** `pricing_status_value`

#### 4B: Calculate status

```javascript
return $var.auto_decline_check.should_auto_decline ? "declined" : "paid";
```
**Return as:** `status_value`

#### 4C: Calculate declined_at

```javascript
return $var.auto_decline_check.should_auto_decline ? Date.now() : null;
```
**Return as:** `declined_at_value`

---

### Step 7: Update Add Question Record

**Find:** "Add Record" step for `question` table

**Update these field mappings:**

| Field | Old Value | New Value |
|-------|-----------|-----------|
| `pricing_status` | `"offer_pending"` (literal) | `pricing_status_value` (variable) |
| `status` | `"paid"` (literal) | `status_value` (variable) |
| `decline_reason` | Not set | `auto_decline_check.decline_reason` |
| `declined_at` | Not set | `declined_at_value` (variable) |

**All other fields remain the same.**

---

## Complete Function Stack

```
Step 1: Get Expert Profile
  - Get Record from expert_profile WHERE id = expert_profile_id
  - Return as: expert_profile

Step 2: Validate Tier2 Enabled (Lambda)
  - Check: expert_profile.tier2_enabled === true
  - Return as: validation_passed

Step 3: Check Auto-Decline Threshold (Lambda)
  - Code: (see above)
  - Return as: auto_decline_check

Step 4A: Calculate pricing_status (Lambda)
  - Code: return $var.auto_decline_check.should_auto_decline ? "offer_declined" : "offer_pending";
  - Return as: pricing_status_value

Step 4B: Calculate status (Lambda)
  - Code: return $var.auto_decline_check.should_auto_decline ? "declined" : "paid";
  - Return as: status_value

Step 4C: Calculate declined_at (Lambda)
  - Code: return $var.auto_decline_check.should_auto_decline ? Date.now() : null;
  - Return as: declined_at_value

Step 5: Calculate Offer Expiry (Lambda)
  - Code: return Date.now() + (24 * 60 * 60 * 1000);
  - Return as: offer_expires_at

Step 6: Calculate SLA Snapshot (Lambda)
  - Code: return $var.sla_hours_snapshot || $var.expert_profile.tier2_sla_hours;
  - Return as: sla_hours_final

Step 7: Add Question Record
  - Table: question
  - Fields:
    • expert_profile_id = expert_profile_id (input)
    • payer_email = payer_email (input)
    • title = title (input)
    • text = text (input)
    • attachments = attachments (input)
    • media_asset_id = media_asset_id (input)
    • asker_message = asker_message (input)
    • question_tier = "deep_dive" (literal)
    • pricing_status = pricing_status_value (variable) ← CHANGED
    • status = status_value (variable) ← CHANGED
    • decline_reason = auto_decline_check.decline_reason (variable) ← NEW
    • declined_at = declined_at_value (variable) ← NEW
    • proposed_price_cents = proposed_price_cents (input)
    • final_price_cents = proposed_price_cents (input)
    • sla_hours_snapshot = sla_hours_final (variable)
    • sla_start_time = null (literal)
    • sla_deadline = null (literal)
    • sla_missed = false (literal)
    • offer_expires_at = offer_expires_at (variable)
    • price_cents = proposed_price_cents (legacy field)
    • currency = "USD" (literal)
    • payment_intent_id = stripe_payment_intent_id (input)
  - Return as: question

Step 8: Add Payment Record
  - [Same as before]

Step 9: Response
  - Return:
    • question_id = question.id
    • proposed_price_cents = proposed_price_cents
    • status = pricing_status_value (not the database status field)
    • offer_expires_at = offer_expires_at
    • auto_declined = auto_decline_check.should_auto_decline (optional, for debugging)
```

---

## Testing

### Test Case 1: Offer Below Threshold

**Setup:**
- Expert has `tier2_auto_decline_below_cents = 5000` ($50)

**Test:**
```json
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "proposed_price_cents": 3000,
  "title": "Test auto-decline",
  "sla_hours_snapshot": 48,
  "stripe_payment_intent_id": "pi_test_123"
}
```

**Expected Result:**
- ✅ Question created successfully
- ✅ `pricing_status` = "offer_declined"
- ✅ `status` = "declined"
- ✅ `decline_reason` = "Offer below minimum threshold of $50"
- ✅ `declined_at` = timestamp
- ✅ Question does NOT appear in expert's pending offers
- ✅ Question may appear in declined offers list (if expert has that view)

### Test Case 2: Offer Above Threshold

**Setup:**
- Expert has `tier2_auto_decline_below_cents = 5000` ($50)

**Test:**
```json
{
  "expert_profile_id": 1,
  "payer_email": "test@example.com",
  "proposed_price_cents": 7000,
  "title": "Test normal offer",
  "sla_hours_snapshot": 48,
  "stripe_payment_intent_id": "pi_test_456"
}
```

**Expected Result:**
- ✅ Question created successfully
- ✅ `pricing_status` = "offer_pending"
- ✅ `status` = "paid"
- ✅ `decline_reason` = null
- ✅ `declined_at` = null
- ✅ Question DOES appear in expert's pending offers
- ✅ Expert can accept or manually decline

### Test Case 3: No Auto-Decline Threshold Set

**Setup:**
- Expert has `tier2_auto_decline_below_cents = null` (not set)

**Test:**
```json
{
  "expert_profile_id": 1,
  "payer_email": "test@example.com",
  "proposed_price_cents": 1000,
  "title": "Test with no threshold",
  "sla_hours_snapshot": 48,
  "stripe_payment_intent_id": "pi_test_789"
}
```

**Expected Result:**
- ✅ Question created successfully
- ✅ `pricing_status` = "offer_pending" (no auto-decline)
- ✅ `status` = "paid"
- ✅ Question appears in pending offers (expert sees all offers)

---

## Frontend Changes

Removed broken auto-decline code from `AskQuestionPage.jsx`:

**Before (lines 208-234):**
```javascript
// Auto-decline Deep Dive offers below threshold
if (tierType === 'deep_dive' && tierConfig?.auto_decline_below_cents) {
  // ... attempts to call /api/offers/{id}/decline
  // ... fails with 401 error
}
```

**After:**
```javascript
// Note: Auto-decline logic is handled in Xano during question creation
// Offers below auto_decline_below_cents threshold are created with pricing_status = 'offer_declined'
```

---

## Dashboard Filtering

The expert dashboard already filters out declined offers:

**ExpertDashboardPage.jsx (lines 246-265):**
```javascript
const filteredQuestions = useMemo(() => {
  let filtered = sortedQuestions;

  // Filter out Deep Dive offers that haven't been accepted yet
  filtered = filtered.filter(q =>
    q.pricing_status !== 'offer_pending' &&
    q.pricing_status !== 'offer_declined'  // ← Auto-declined offers filtered out
  );

  return filtered;
}, [sortedQuestions, showHidden]);
```

**Result:** Auto-declined offers will NOT appear in:
- Main question list
- Pending offers section
- Answered count
- Pending count

---

## User Experience

### For Askers:

1. **Submit offer below threshold** ($30, threshold $50)
2. Question is submitted successfully
3. System automatically declines it
4. Asker receives email notification (if configured):
   - "Your offer was below the expert's minimum threshold"
   - Payment authorization is released (if using Stripe)

### For Experts:

1. **Auto-declined offers never appear in dashboard**
2. Expert doesn't waste time reviewing low offers
3. Can still see declined offers if they want (future feature)
4. Keeps pending offers section focused on viable offers

---

## Related Files

**Frontend:**
- `src/pages/AskQuestionPage.jsx` - Removed broken auto-decline code

**Backend:**
- `api/questions/deep-dive.js` - Passes auto_decline_below_cents to Xano
- `api/offers/[id]/decline.js` - Requires auth (not used for auto-decline)

**Xano:**
- `POST /question/deep-dive` - ⚠️ NEEDS UPDATES (see above)

**Documentation:**
- `PRICING-VALIDATION-UPDATE.md` - Min/max as suggestions
- `XANO-SLA-HOURS-SNAPSHOT-FIX.md` - SLA snapshot implementation

---

**Status:** Documented, awaiting Xano implementation
**Priority:** High (auto-decline is a key feature)
**Next Step:** Update Xano endpoint following steps above

**Last Updated:** October 23, 2025
