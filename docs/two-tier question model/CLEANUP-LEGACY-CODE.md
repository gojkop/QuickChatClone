# Legacy Code & Database Cleanup Guide

**Date:** October 22, 2025
**Status:** 🔍 Review Needed
**Purpose:** Identify legacy fields and code that can be removed after two-tier system deployment

---

## 📊 Summary

Now that the two-tier pricing system is fully deployed, we have:
- **New Tier 1 (Quick Consult):** `tier1_price_cents`, `tier1_sla_hours`
- **New Tier 2 (Deep Dive):** `tier2_min_price_cents`, `tier2_max_price_cents`, `tier2_sla_hours`

We need to evaluate what legacy single-tier fields and code should be:
- ✅ **Kept** (for backwards compatibility)
- ⚠️ **Deprecated** (kept but marked as legacy)
- 🗑️ **Removed** (safe to delete)

---

## 🔍 Database Fields Analysis

### expert_profile table

| Field | Status | Recommendation | Reason |
|-------|--------|----------------|--------|
| `price_cents` | ⚠️ Keep (Legacy) | Keep as fallback | Used for legacy questions, tier1 initialization, fallback in UI |
| `sla_hours` | ⚠️ Keep (Legacy) | Keep as fallback | Used for legacy questions, tier1 initialization, fallback in UI |
| `tier1_price_cents` | ✅ Active | Keep | Current Quick Consult price |
| `tier1_sla_hours` | ✅ Active | Keep | Current Quick Consult SLA |
| `tier1_enabled` | ✅ Active | Keep | Controls Quick Consult availability |
| `tier1_description` | ✅ Active | Keep | Quick Consult description |
| `tier2_min_price_cents` | ✅ Active | Keep | Deep Dive min price |
| `tier2_max_price_cents` | ✅ Active | Keep | Deep Dive max price |
| `tier2_sla_hours` | ✅ Active | Keep | Deep Dive SLA |
| `tier2_enabled` | ✅ Active | Keep | Controls Deep Dive availability |
| `tier2_pricing_mode` | ✅ Active | Keep | Deep Dive pricing mode |
| `tier2_auto_decline_below_cents` | ✅ Active | Keep | Auto-decline threshold (future) |
| `tier2_description` | ✅ Active | Keep | Deep Dive description |

**Why Keep `price_cents` and `sla_hours`?**
1. **Legacy questions:** Questions created before two-tier system still reference these fields
2. **Fallback values:** Frontend uses `tierConfig?.price_cents || expert.price_cents` pattern
3. **Tier initialization:** When enabling tier1 for first time, copy from these fields
4. **Graceful degradation:** If tier configs aren't set, system falls back to single-tier behavior

### question table

| Field | Status | Recommendation | Reason |
|-------|--------|----------------|--------|
| `price_cents` | ✅ Active | Keep | Actual price paid (from tier1 or tier2) |
| `question_tier` | ✅ Active | Keep | Tier identification ('quick_consult', 'deep_dive', null=legacy) |
| `pricing_status` | ✅ Active | Keep | Deep Dive workflow state |
| `proposed_price_cents` | ✅ Active | Keep | Deep Dive offer amount |
| `final_price_cents` | ✅ Active | Keep | Accepted Deep Dive price |
| `asker_message` | ✅ Active | Keep | Deep Dive offer message |
| `offer_expires_at` | ✅ Active | Keep | Deep Dive offer expiration |
| `decline_reason` | ✅ Active | Keep | Why offer was declined |
| `sla_hours_snapshot` | ✅ Active | Keep | SLA at creation time |

**Note:** All tier fields should be kept. `price_cents` is still used for legacy questions (where `question_tier = null`).

---

## 📂 API Endpoints Analysis

### Backend Endpoints (Vercel)

| Endpoint | Status | Recommendation | Reason |
|----------|--------|----------------|--------|
| `POST /api/questions/create` | 🗑️ Can Remove | Delete after verification | Replaced by quick-consult & deep-dive endpoints |
| `POST /api/questions/quick-consult` | ✅ Active | Keep | Creates Quick Consult questions |
| `POST /api/questions/deep-dive` | ✅ Active | Keep | Creates Deep Dive offers |
| `POST /api/questions/submit` | ⚠️ Legacy | Evaluate | Check if still used for payment submission |
| `POST /api/offers/[id]/accept` | ✅ Active | Keep | Accept Deep Dive offer |
| `POST /api/offers/[id]/decline` | ✅ Active | Keep | Decline Deep Dive offer |

**Action Required:**
1. ✅ Verify `/api/questions/create` is NOT used in frontend (already checked - not used)
2. ⚠️ Check if any external integrations use `/api/questions/create`
3. 🗑️ If safe, delete `/api/questions/create.js`

### Xano Endpoints

| Endpoint | Status | Recommendation | Reason |
|----------|--------|----------------|--------|
| `POST /question` (single-tier) | ⚠️ Legacy | Keep but deprecate | May be used by legacy flows |
| `POST /question/quick-consult` | ✅ Active | Keep | Creates Quick Consult |
| `POST /question/deep-dive` | ✅ Active | Keep | Creates Deep Dive |
| `GET /me/questions` | ✅ Active | Keep | Returns questions with tier fields |
| `GET /expert/pending-offers` | ✅ Active | Keep | Returns pending Deep Dive offers |
| `POST /offers/{id}/accept` | ✅ Active | Keep | Accept offer |
| `POST /offers/{id}/decline` | ✅ Active | Keep | Decline offer |

**Note:** Keep all Xano endpoints for now. Legacy endpoints provide backwards compatibility.

---

## 🎨 Frontend Code Analysis

### Components to Keep

| Component/File | Status | Contains Legacy Code? | Action |
|----------------|--------|----------------------|--------|
| `TierSelector.jsx` | ✅ Active | No | Keep |
| `AskQuestionPage.jsx` | ✅ Active | Yes (fallback) | Keep, document fallback usage |
| `AskReviewModal.jsx` | ✅ Active | Yes (fallback) | Keep, document fallback usage |
| `QuestionTable.jsx` | ✅ Active | No | Keep |
| `PendingOffersSection.jsx` | ✅ Active | No | Keep |

### Fallback Pattern Usage

These files use the legacy fields as fallbacks:

**AskQuestionPage.jsx:**
```jsx
tierConfig?.sla_hours || expert.sla_hours  // Line 316
tierConfig?.price_cents || expert.price_cents  // Line 335-338
```

**AskReviewModal.jsx:**
```jsx
expert.price_cents  // Fallback when no tier config
```

**Recommendation:** ✅ Keep these fallbacks for backwards compatibility and graceful degradation.

---

## 🗑️ Safe to Remove

### 1. Legacy API Endpoint

**File:** `/api/questions/create.js`

**Status:** 🗑️ Safe to delete

**Verification:**
- ✅ Not used in frontend (grep search returned no results)
- ⚠️ Check for external integrations before deleting

**Action:**
```bash
# After verifying no external dependencies:
rm /api/questions/create.js
```

### 2. Old Documentation (Optional)

**Files in `/docs/two-tier question model/`:**
- Migration SQL files (keep as reference)
- Session summaries (keep for history)
- Fix documentation (keep for troubleshooting reference)

**Recommendation:** ✅ Keep all docs for historical reference and debugging

---

## ⚠️ DO NOT REMOVE

### 1. Legacy Database Fields

**DO NOT remove these fields:**
- `expert_profile.price_cents` - Required for legacy questions and fallback
- `expert_profile.sla_hours` - Required for legacy questions and fallback
- `question.price_cents` - Still used for actual charged price

**Reason:** Removing these would break:
- Display of legacy questions (created before two-tier system)
- Fallback behavior when tier configs aren't set
- Historical data integrity

### 2. Fallback Code Patterns

**DO NOT remove fallback patterns like:**
```jsx
tierConfig?.price_cents || expert.price_cents
tierConfig?.sla_hours || expert.sla_hours
```

**Reason:** These ensure graceful degradation and support legacy questions.

---

## 📝 Migration Strategy for Legacy Questions

### Option 1: Keep as Legacy (Recommended)

**Approach:**
- Keep legacy questions with `question_tier = null`
- Display them without tier badges
- Use `price_cents` and `sla_hours` from question record
- No migration needed

**Pros:**
- No data migration required
- Historical data preserved
- Zero risk

**Cons:**
- Legacy questions don't show tier information

### Option 2: Backfill Tier Data

**Approach:**
- Run one-time migration to set `question_tier = 'quick_consult'` for all legacy questions
- Set `final_price_cents` from `price_cents`
- Set `sla_hours_snapshot` from question creation time

**Pros:**
- All questions have tier information
- Cleaner data model

**Cons:**
- Requires data migration
- May not accurately represent original question intent

**Recommendation:** ✅ Option 1 (Keep as Legacy) - simpler and safer

---

## 🎯 Cleanup Checklist

### Phase 1: Verification (Do This First)

- [x] Verify `/api/questions/create` not used in frontend
- [ ] Check for external integrations using `/api/questions/create`
- [ ] Check analytics/logs for recent usage of legacy endpoint
- [ ] Verify all legacy questions still display correctly

### Phase 2: Optional Cleanup (Low Priority)

- [ ] Add deprecation notice to `/api/questions/create` endpoint
- [ ] Monitor for 30 days, then delete if no usage
- [ ] Add JSDoc comments marking `price_cents` and `sla_hours` as legacy fallbacks
- [ ] Update API documentation to mark legacy endpoints

### Phase 3: Code Organization (Optional)

- [ ] Move `/api/questions/create.js` to `/api/questions/legacy/create.js`
- [ ] Add README in `/api/questions/legacy/` explaining deprecation
- [ ] Archive migration SQL files to `/docs/two-tier question model/archive/`

---

## 🚨 Important Warnings

### DO NOT DELETE:

1. **`expert_profile.price_cents`** - Used by thousands of legacy questions
2. **`expert_profile.sla_hours`** - Used by thousands of legacy questions
3. **`question.price_cents`** - Current actual price field
4. **Fallback code patterns** - Ensures graceful degradation
5. **`question_tier = null` handling** - Required for legacy question display

### SAFE TO DELETE (After Verification):

1. **`/api/questions/create.js`** - Only if no external usage
2. **Test files** - `/api/questions/test.js` (if exists)

---

## 📊 Data Statistics

To help decide on cleanup, run these queries in Xano:

### Count Legacy Questions
```sql
SELECT COUNT(*) as legacy_questions
FROM question
WHERE question_tier IS NULL;
```

### Count Questions by Tier
```sql
SELECT
  question_tier,
  COUNT(*) as count
FROM question
GROUP BY question_tier;
```

### Check Recent Usage of Legacy Fields
```sql
SELECT COUNT(*) as recent_legacy
FROM question
WHERE question_tier IS NULL
  AND created_at > (Date.now() - 7*24*60*60*1000);  -- Last 7 days
```

**If `recent_legacy > 0`:** Keep legacy support indefinitely
**If `recent_legacy = 0`:** Legacy system no longer in use, but keep fields for historical data

---

## 🎯 Final Recommendation

### Immediately:
- ✅ **Delete:** `/api/questions/create.js` (after verifying no external usage)

### Keep Indefinitely:
- ✅ All database fields (including legacy `price_cents`, `sla_hours`)
- ✅ All Xano endpoints (including legacy single-tier endpoint)
- ✅ All fallback code patterns
- ✅ All documentation

### Monitor & Evaluate Later:
- ⚠️ Legacy Xano endpoint usage (check after 3-6 months)
- ⚠️ Consider backfilling `question_tier` for legacy questions (optional, low priority)

---

## 📖 Related Documentation

- `IMPLEMENTATION-STATUS.md` - Current system status
- `SESSION-SUMMARY-OCT-22-EVENING.md` - Latest changes
- `XANO-MIGRATION-CHECKLIST.md` - Database migration guide

---

**Last Updated:** October 22, 2025
**Status:** Ready for Review
**Action Required:** Verify external integrations before deleting `/api/questions/create.js`
