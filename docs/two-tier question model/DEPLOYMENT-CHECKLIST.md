# Two-Tier Pricing System - Deployment Checklist

**Last Updated:** October 22, 2025
**Status:** ⚠️ Frontend Complete, Xano Updates Required

---

## Overview

This checklist consolidates all required Xano updates to complete the two-tier pricing system deployment. The frontend is fully implemented and tested. The backend requires the updates listed below.

---

## ✅ COMPLETED

### Frontend Implementation
- ✅ TierSelector component with Quick Consult and Deep Dive cards
- ✅ AskQuestionPage tier selection flow
- ✅ Deep Dive price proposal input with validation
- ✅ Review modal showing correct tier prices
- ✅ QuestionTable with tier badges (⚡ Quick, 🎯 Deep)
- ✅ Purple highlighting for Deep Dive questions
- ✅ PendingOffersSection with accept/decline functionality
- ✅ Email notifications for both tier types
- ✅ Smooth animations for pending offers panel
- ✅ Mobile responsive design

### Backend API Endpoints (Vercel)
- ✅ `/api/questions/quick-consult` - Creates Quick Consult questions
- ✅ `/api/questions/deep-dive` - Creates Deep Dive offers
- ✅ `/api/offers/[id]/accept` - Accept Deep Dive offer
- ✅ `/api/offers/[id]/decline` - Decline Deep Dive offer
- ✅ Email integration for all tier types

---

## 🔧 REQUIRED XANO UPDATES

### 1. Database Migrations (Should Already Be Done)

**Verify these columns exist in the `question` table:**

```sql
-- Tier identification
question_tier          TEXT          -- Values: 'quick_consult', 'deep_dive', null (legacy)

-- Deep Dive pricing
pricing_status         TEXT          -- Values: 'paid', 'offer_pending', 'offer_accepted', 'offer_declined'
proposed_price_cents   INTEGER       -- Asker's offer amount (Deep Dive only)
asker_message          TEXT          -- Message from asker with offer
offer_expires_at       BIGINT        -- Timestamp when offer expires (72 hours)
decline_reason         TEXT          -- Reason for declining offer

-- Tier pricing snapshots
final_price_cents      INTEGER       -- Actual price charged (all tiers)
sla_hours_snapshot     INTEGER       -- SLA at time of creation
```

**Verify these columns exist in the `expert_profile` table:**

```sql
-- Tier 1 (Quick Consult)
tier1_enabled          BOOLEAN       -- Default: true
tier1_price_cents      INTEGER       -- Default: 5000 ($50)
tier1_sla_hours        INTEGER       -- Default: 24
tier1_description      TEXT          -- Optional description

-- Tier 2 (Deep Dive)
tier2_enabled          BOOLEAN       -- Default: false
tier2_pricing_mode     TEXT          -- 'range' or 'fixed'
tier2_min_price_cents  INTEGER       -- Default: 10000 ($100)
tier2_max_price_cents  INTEGER       -- Default: 50000 ($500)
tier2_sla_hours        INTEGER       -- Default: 48
tier2_auto_decline_below_cents  INTEGER  -- Optional auto-decline threshold
tier2_description      TEXT          -- Optional description
```

**If columns are missing, run Migration 001 from XANO-MIGRATION-CHECKLIST.md**

---

### 2. POST /question/quick-consult

**Location:** Public API group
**Status:** ⚠️ Partially configured - missing tier fields

**Required Fix:**

In the "Add Record" step for `question` table, ensure these fields are set:

```javascript
// Existing fields (keep as-is)
expert_profile_id = expert_profile_id (input)
payer_email = payer_email (input)
title = title (input)
text = text (input)
attachments = attachments (input)
media_asset_id = media_asset_id (input)
stripe_payment_intent_id = stripe_payment_intent_id (input)

// ⚠️ ADD THESE FIELDS:
question_tier = "quick_consult" (literal string)
pricing_status = "paid" (literal string)
status = "paid" (literal string)
final_price_cents = [expert_profile.tier1_price_cents]
sla_hours_snapshot = [expert_profile.tier1_sla_hours]
currency = [expert_profile.currency]
created_at = Date.now()
```

**Test:**
```json
POST /question/quick-consult
{
  "expert_profile_id": 1,
  "payer_email": "test@example.com",
  "title": "Test Quick Question",
  "text": "Test text",
  "stripe_payment_intent_id": "pi_mock_123"
}
```

Expected: `question_tier = "quick_consult"` in database

---

### 3. POST /question/deep-dive

**Location:** Public API group
**Status:** ⚠️ Partially configured - missing tier fields

**Required Fix:**

In the "Add Record" step for `question` table, ensure these fields are set:

```javascript
// Existing fields (keep as-is)
expert_profile_id = expert_profile_id (input)
payer_email = payer_email (input)
title = title (input)
text = text (input)
attachments = attachments (input)
media_asset_id = media_asset_id (input)
stripe_payment_intent_id = stripe_payment_intent_id (input)

// ⚠️ ADD THESE FIELDS:
question_tier = "deep_dive" (literal string)
pricing_status = "offer_pending" (literal string)
status = "pending" (literal string)
proposed_price_cents = proposed_price_cents (input)
asker_message = asker_message (input)
offer_expires_at = Date.now() + (72 * 60 * 60 * 1000)  // 72 hours
sla_hours_snapshot = [expert_profile.tier2_sla_hours]
currency = [expert_profile.currency]
created_at = Date.now()
```

**Test:**
```json
POST /question/deep-dive
{
  "expert_profile_id": 1,
  "payer_email": "test@example.com",
  "title": "Test Deep Dive",
  "text": "Test text",
  "proposed_price_cents": 15000,
  "asker_message": "Urgent review needed",
  "stripe_payment_intent_id": "pi_mock_456"
}
```

Expected: `question_tier = "deep_dive"`, `pricing_status = "offer_pending"` in database

---

### 4. GET /me/questions

**Location:** Authentication API group
**Status:** ⚠️ Missing tier fields in response

**Required Fix:**

In the Lambda function or Response step, add these fields to each question object:

```javascript
// If using Lambda to build response:
var questions = $var.questions || [];
var result = [];

for (var i = 0; i < questions.length; i++) {
  var q = questions[i];

  result.push({
    // ... existing fields (keep all) ...

    // ⚠️ ADD THESE FIELDS:
    question_tier: q.question_tier,
    pricing_status: q.pricing_status,
    proposed_price_cents: q.proposed_price_cents,
    asker_message: q.asker_message,
    offer_expires_at: q.offer_expires_at,
    final_price_cents: q.final_price_cents,
    decline_reason: q.decline_reason
  });
}

return result;
```

**Important:** Use `$var.questions` not just `questions`!

**Test:**

After updating, call `GET /me/questions` and verify response includes:
```json
{
  "questions": [
    {
      "id": 199,
      "title": "Test Question",
      "question_tier": "deep_dive",        // ✅ Should be present
      "pricing_status": "offer_pending",   // ✅ Should be present
      "proposed_price_cents": 15000        // ✅ Should be present
    }
  ]
}
```

---

### 5. POST /offers/{id}/accept

**Location:** Authentication API group
**Status:** ✅ Should be configured

**Verify:**

Function stack should:
1. Get authenticated user
2. Get expert profile
3. Get question and validate it's an offer_pending
4. Update question:
   - `pricing_status = "offer_accepted"`
   - `status = "paid"`
   - `final_price_cents = proposed_price_cents`
   - `sla_start_time = Date.now()`
5. Return success

**Test in Xano Run & Debug**

---

### 6. POST /offers/{id}/decline

**Location:** Authentication API group
**Status:** ✅ Configured (with conditional payment check)

**Verify:**

Function stack should:
1. Get authenticated user
2. Get expert profile
3. Get question and validate it's offer_pending
4. Update question:
   - `pricing_status = "offer_declined"`
   - `expert_reviewed_at = Date.now()`
   - `decline_reason = decline_reason` (input)
5. **Conditional:** Get payment record (if exists)
6. **Inside conditional:** Update payment to refunded (only if payment exists)
7. Return success

**Critical:** Payment update must be inside a conditional check to avoid "Unable to locate var: payment.id" error.

**Test in Xano Run & Debug**

---

### 7. GET /expert/pending-offers

**Location:** Authentication API group
**Status:** ✅ Should be configured

**Verify:**

Query should filter:
- `expert_profile_id = [current expert]`
- `question_tier = "deep_dive"`
- `pricing_status = "offer_pending"`
- `offer_expires_at > Date.now()`

**Test:** Should return only pending offers, not declined ones.

---

### 8. PUT /me/profile (Optional but Recommended)

**Location:** Authentication API group
**Status:** ⚠️ Missing tier fields

**Purpose:** Allow experts to update their tier pricing in Settings Modal

**Add Input Parameters:**
```
tier1_enabled          (boolean)
tier1_price_cents      (integer)
tier1_sla_hours        (integer)
tier1_description      (text, nullable)

tier2_enabled          (boolean)
tier2_pricing_mode     (text, nullable)
tier2_min_price_cents  (integer, nullable)
tier2_max_price_cents  (integer, nullable)
tier2_sla_hours        (integer, nullable)
tier2_auto_decline_below_cents (integer, nullable)
tier2_description      (text, nullable)
```

**Update Edit Record step** to save these fields to `expert_profile` table.

**See:** XANO-PROFILE-ENDPOINT-UPDATE.md for details

---

## 🧪 TESTING CHECKLIST

### After All Updates, Test End-to-End:

#### Quick Consult Flow:
1. [ ] Visit expert's public profile
2. [ ] Click "Ask Question" on Quick Consult tier
3. [ ] Record/upload question
4. [ ] Submit question
5. [ ] Check expert dashboard - ⚡ Quick badge appears
6. [ ] Check database - `question_tier = "quick_consult"`
7. [ ] Expert receives email notification
8. [ ] Asker receives confirmation email

#### Deep Dive Flow:
1. [ ] Visit expert's public profile
2. [ ] Click "Make Offer" on Deep Dive tier
3. [ ] Enter proposed price (e.g., $150)
4. [ ] Record/upload question
5. [ ] Submit offer
6. [ ] Check expert dashboard - 🎯 Deep badge appears
7. [ ] Check purple highlighting on the row
8. [ ] Check PendingOffersSection appears
9. [ ] Database check: `question_tier = "deep_dive"`, `pricing_status = "offer_pending"`
10. [ ] Expert receives offer notification email
11. [ ] Asker receives submission confirmation

#### Accept Offer Flow:
1. [ ] Expert clicks "Accept" in PendingOffersSection
2. [ ] Question moves to main queue
3. [ ] Question shows "Pending" status (not "Pending Offer")
4. [ ] Database: `pricing_status = "offer_accepted"`, `status = "paid"`
5. [ ] PendingOffersSection count decreases

#### Decline Offer Flow:
1. [ ] Expert clicks "Decline" in PendingOffersSection
2. [ ] Enter decline reason
3. [ ] Offer disappears from pending list
4. [ ] Database: `pricing_status = "offer_declined"`
5. [ ] PendingOffersSection hides if no more offers
6. [ ] Asker receives refund email (future)

---

## 📊 VERIFICATION QUERIES

### Check Question Tier Distribution:
```sql
SELECT
  question_tier,
  COUNT(*) as count
FROM question
GROUP BY question_tier;
```

Expected:
- `quick_consult`: X questions
- `deep_dive`: Y questions
- `null`: Z legacy questions

### Check Deep Dive Pricing Status:
```sql
SELECT
  pricing_status,
  COUNT(*) as count
FROM question
WHERE question_tier = 'deep_dive'
GROUP BY pricing_status;
```

Expected:
- `offer_pending`: Waiting for expert review
- `offer_accepted`: Moved to queue
- `offer_declined`: Rejected by expert

### Check Expert Tier Configuration:
```sql
SELECT
  id,
  name,
  tier1_enabled,
  tier1_price_cents,
  tier2_enabled,
  tier2_min_price_cents,
  tier2_max_price_cents
FROM expert_profile
WHERE tier1_enabled = true OR tier2_enabled = true;
```

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: Tier badges not appearing
**Symptom:** Questions show no ⚡ or 🎯 badges
**Cause:** GET /me/questions not returning `question_tier` field
**Fix:** Update GET endpoint response (see #4 above)

### Issue 2: Deep Dive questions not highlighted
**Symptom:** No purple background/border on Deep Dive rows
**Cause:** Same as Issue 1
**Fix:** Same as Issue 1

### Issue 3: PendingOffersSection always empty
**Symptom:** No offers appear even after submitting
**Cause:** Questions created without `pricing_status = "offer_pending"`
**Fix:** Update POST /question/deep-dive endpoint (see #3 above)

### Issue 4: Declined offers still visible
**Symptom:** Offer reappears after declining
**Cause:** Xano endpoint not updating `pricing_status` or GET endpoint not filtering correctly
**Fix:** Verify POST /offers/{id}/decline sets `pricing_status = "offer_declined"` AND GET /expert/pending-offers filters by `pricing_status = "offer_pending"`

### Issue 5: "Unable to locate var: payment.id"
**Symptom:** Error when declining offer
**Cause:** Payment update not inside conditional check
**Fix:** Add conditional: `if payment != null` before updating payment record

---

## 📁 RELATED DOCUMENTATION

- `XANO-MIGRATION-CHECKLIST.md` - Database schema updates
- `XANO-API-IMPLEMENTATION-GUIDE.md` - Complete API specifications
- `FRONTEND-IMPLEMENTATION-COMPLETE.md` - Frontend implementation details
- `EMAIL-NOTIFICATIONS-FIX.md` - Email integration
- `IMPLEMENTATION-STATUS.md` - Overall project status

---

## 🎯 SUCCESS CRITERIA

System is fully deployed when:

- [x] Frontend shows tier selector on public profiles
- [x] Quick Consult questions show ⚡ Quick badge
- [x] Deep Dive questions show 🎯 Deep badge with purple highlighting
- [x] PendingOffersSection appears when offers exist
- [x] Accept/Decline buttons work correctly
- [x] Emails sent for all question types
- [ ] All Xano endpoints return correct tier fields
- [ ] Database queries show proper tier distribution
- [ ] No console errors or undefined fields

---

**Deployment Priority:** HIGH
**Estimated Time:** 1-2 hours for all Xano updates
**Risk Level:** LOW (frontend already tested and working)
