# URGENT: Xano Endpoints Not Setting question_tier Field

**Date:** October 22, 2025
**Status:** 🚨 CRITICAL - Questions created without tier information
**Priority:** HIGH - Breaks Deep Dive visual highlighting

---

## Issue

Questions created through the new tier endpoints (`/question/quick-consult` and `/question/deep-dive`) are not getting the `question_tier` field set in the database.

**Debug Output:**
```javascript
{
  id: 187,
  title: "Deep Dive Architecture Review",
  question_tier: undefined,        // ❌ Should be "deep_dive"
  pricing_status: undefined,       // ❌ Should be "offer_pending"
  proposed_price_cents: undefined  // ❌ Should have the offer amount
}
```

**Impact:**
- ✅ Questions are created successfully
- ✅ Emails are sent
- ❌ **No tier badges displayed** (⚡ Quick / 🎯 Deep Dive)
- ❌ **No purple highlighting** for Deep Dive questions
- ❌ Cannot distinguish tier types in question list
- ❌ Pricing information lost

---

## Root Cause

The Xano endpoints `POST /question/quick-consult` and `POST /question/deep-dive` are not setting the `question_tier` field when creating question records.

**What the frontend sends:**
- ✅ All required data (title, text, proposed_price_cents, etc.)
- ✅ Correct endpoint called

**What Xano needs to do:**
- ❌ Set `question_tier = "quick_consult"` or `"deep_dive"`
- ❌ Set `pricing_status` appropriately
- ❌ Store `proposed_price_cents` for Deep Dive

---

## Solution: Update Xano Endpoints

### Endpoint 1: POST /question/quick-consult

**Location:** Public API group in Xano
**Path:** `/question/quick-consult`

#### Current Issue:
Creates question but doesn't set `question_tier` field.

#### Fix Required:

In the "Add Record" step for the `question` table, add these fields:

| Field | Value | Type |
|-------|-------|------|
| `question_tier` | `"quick_consult"` | Literal string |
| `pricing_status` | `"paid"` | Literal string |
| `status` | `"paid"` | Literal string |

**Complete field mapping for Add Record:**
```
expert_profile_id = expert_profile_id (input)
payer_email = payer_email (input)
title = title (input)
text = text (input)
attachments = attachments (input)
media_asset_id = media_asset_id (input)
stripe_payment_intent_id = stripe_payment_intent_id (input)
question_tier = "quick_consult" (literal)
pricing_status = "paid" (literal)
status = "paid" (literal)
final_price_cents = [tier1_price_cents from expert profile]
currency = [currency from expert profile]
sla_hours_snapshot = [tier1_sla_hours from expert profile]
created_at = Date.now()
```

---

### Endpoint 2: POST /question/deep-dive

**Location:** Public API group in Xano
**Path:** `/question/deep-dive`

#### Current Issue:
Creates question but doesn't set tier and pricing fields.

#### Fix Required:

In the "Add Record" step for the `question` table, add these fields:

| Field | Value | Type |
|-------|-------|------|
| `question_tier` | `"deep_dive"` | Literal string |
| `pricing_status` | `"offer_pending"` | Literal string |
| `status` | `"pending"` | Literal string |
| `proposed_price_cents` | `proposed_price_cents` | Input variable |
| `asker_message` | `asker_message` | Input variable |
| `offer_expires_at` | `Date.now() + (72 * 60 * 60 * 1000)` | Expression (72 hours) |

**Complete field mapping for Add Record:**
```
expert_profile_id = expert_profile_id (input)
payer_email = payer_email (input)
title = title (input)
text = text (input)
attachments = attachments (input)
media_asset_id = media_asset_id (input)
stripe_payment_intent_id = stripe_payment_intent_id (input)
question_tier = "deep_dive" (literal)
pricing_status = "offer_pending" (literal)
status = "pending" (literal)
proposed_price_cents = proposed_price_cents (input)
asker_message = asker_message (input)
offer_expires_at = Date.now() + (72 * 60 * 60 * 1000)
currency = [currency from expert profile]
sla_hours_snapshot = [tier2_sla_hours from expert profile]
created_at = Date.now()
```

---

## Database Schema Reference

The `question` table should have these fields:

### Tier-Related Fields:
- `question_tier` (text) - Values: "quick_consult", "deep_dive", or null (legacy)
- `pricing_status` (text) - Values: "paid", "offer_pending", "offer_accepted", "offer_declined"
- `proposed_price_cents` (integer) - For Deep Dive offers
- `asker_message` (text) - Message from asker with Deep Dive offer
- `offer_expires_at` (bigint/timestamp) - When Deep Dive offer expires

### Legacy Fields (still used):
- `status` (text) - "pending", "paid", "answered"
- `final_price_cents` (integer) - Actual price charged
- `price_cents` (integer) - Original price (legacy)

---

## Testing Checklist

After updating both Xano endpoints:

### Test Quick Consult:
1. [ ] Submit a Quick Consult question from frontend
2. [ ] Check database - verify `question_tier = "quick_consult"`
3. [ ] Check database - verify `pricing_status = "paid"`
4. [ ] Check database - verify `status = "paid"`
5. [ ] Refresh dashboard - verify ⚡ Quick badge appears
6. [ ] Verify question shows in pending questions list

### Test Deep Dive:
1. [ ] Submit a Deep Dive offer from frontend
2. [ ] Check database - verify `question_tier = "deep_dive"`
3. [ ] Check database - verify `pricing_status = "offer_pending"`
4. [ ] Check database - verify `proposed_price_cents` has the offer amount
5. [ ] Check database - verify `offer_expires_at` is set (72 hours from now)
6. [ ] Refresh dashboard - verify 🎯 Deep Dive badge appears
7. [ ] Verify question has **purple background and left border**
8. [ ] Verify question shows in PendingOffersSection

### Browser Console Check:
After submitting a question, check console logs:
```javascript
🔍 Question tier debug: {
  id: 188,
  title: "Test Question",
  question_tier: "deep_dive",           // ✅ Should be set
  pricing_status: "offer_pending",      // ✅ Should be set
  proposed_price_cents: 15000           // ✅ Should be set
}
```

---

## Quick Fix: Manual Database Update (Temporary)

If you need to test the UI before updating Xano endpoints, you can manually update existing questions:

**For Deep Dive questions:**
```sql
UPDATE question
SET
  question_tier = 'deep_dive',
  pricing_status = 'offer_pending',
  proposed_price_cents = 10000  -- Use actual offer amount
WHERE id = 187;  -- Use actual question ID
```

**For Quick Consult questions:**
```sql
UPDATE question
SET
  question_tier = 'quick_consult',
  pricing_status = 'paid',
  final_price_cents = 5000  -- Use tier1 price
WHERE id = 186;  -- Use actual question ID
```

After updating, refresh the dashboard to see the purple highlighting.

---

## Related Documentation

- `XANO-API-IMPLEMENTATION-GUIDE.md` - Complete endpoint specifications
- `XANO-MIGRATION-CHECKLIST.md` - Database migrations for tier fields
- `FRONTEND-IMPLEMENTATION-COMPLETE.md` - Frontend tier implementation

---

**Last Updated:** October 22, 2025
**Priority:** 🚨 CRITICAL
**Estimated Fix Time:** 15-20 minutes in Xano
**User Impact:** Visual distinction between question types not working
