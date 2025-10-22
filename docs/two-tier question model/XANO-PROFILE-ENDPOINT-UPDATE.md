# Xano Profile Endpoint Update - Tier Fields

**Date:** October 22, 2025
**Status:** ⚠️ REQUIRED - Frontend changes deployed, Xano update needed

---

## Issue

The frontend Settings Modal sends tier pricing fields to Xano's `PUT /me/profile` endpoint, but Xano is not configured to accept and save these fields. This causes tier pricing changes to only persist in the UI temporarily (until page refresh).

**Current Behavior:**
1. User changes tier pricing in Settings Modal ✅
2. Frontend saves to Xano via `PUT /me/profile` ✅
3. Xano ignores tier fields (not configured as inputs) ❌
4. Frontend shows updated values (from local state) ✅
5. User refreshes page → tier pricing reverts to old values ❌

**Expected Behavior:**
Tier fields should be saved to the `expert_profile` table in Xano.

---

## Solution: Update Xano Endpoint

**Endpoint:** `PUT /me/profile` (Authentication API group)

### Step 1: Add Input Parameters

Add these input parameters to the endpoint (all optional, type: varies):

**Tier 1 (Quick Consult) Inputs:**
```
tier1_enabled          (boolean)
tier1_price_cents      (integer)
tier1_sla_hours        (integer)
tier1_description      (text, nullable)
```

**Tier 2 (Deep Dive) Inputs:**
```
tier2_enabled                  (boolean)
tier2_pricing_mode             (text, nullable)
tier2_min_price_cents          (integer, nullable)
tier2_max_price_cents          (integer, nullable)
tier2_sla_hours                (integer, nullable)
tier2_auto_decline_below_cents (integer, nullable)
tier2_description              (text, nullable)
```

### Step 2: Update Function Stack

Find the "Edit Record" step in the function stack that updates the `expert_profile` table.

**Add these field mappings:**

```javascript
// Tier 1 (Quick Consult)
tier1_enabled = tier1_enabled
tier1_price_cents = tier1_price_cents
tier1_sla_hours = tier1_sla_hours
tier1_description = tier1_description

// Tier 2 (Deep Dive)
tier2_enabled = tier2_enabled
tier2_pricing_mode = tier2_pricing_mode
tier2_min_price_cents = tier2_min_price_cents
tier2_max_price_cents = tier2_max_price_cents
tier2_sla_hours = tier2_sla_hours
tier2_auto_decline_below_cents = tier2_auto_decline_below_cents
tier2_description = tier2_description
```

### Step 3: Test

After updating:

1. Open Settings Modal in expert dashboard
2. Change Quick Consult price from $50 to $75
3. Click Save
4. Refresh the page
5. Open Settings Modal again
6. ✅ Verify price shows $75 (not $50)

---

## Alternative Solution: Separate Tier Endpoint (More Complex)

If you prefer to keep tier management separate:

### Option A: Use existing `/expert/pricing-tiers` endpoint

Update the frontend to call both endpoints:
1. `PUT /me/profile` - Save bio, handle, etc.
2. `PUT /expert/pricing-tiers` - Save tier configuration

**Pros:**
- Cleaner separation of concerns
- Follows the documented API architecture

**Cons:**
- Two API calls on every save
- More complex error handling
- User confusion if one succeeds and one fails

### Option B: Update `/me/profile` (Recommended)

Add tier fields to the existing endpoint.

**Pros:**
- Single API call
- Simpler frontend code
- Better user experience

**Cons:**
- Endpoint becomes slightly larger
- Mixes profile and pricing concerns

**Recommendation:** Use Option B (update `/me/profile`) for simplicity.

---

## Frontend Changes (Already Deployed)

The frontend has been updated to:

1. ✅ Send tier fields in `PUT /me/profile` payload
2. ✅ Include tier fields in `updatedProfile` response
3. ✅ Convert cents ↔ USD in `handleSaveSettings`
4. ✅ Preserve tier state in UI after save

**Commits:**
- `899795c` - Fix tier pricing not saving: Update profile state handling
- `eaa5de1` - Fix ReferenceError: Change fetchQuestions to refreshQuestions

---

## Testing Checklist

After updating Xano:

- [ ] Quick Consult price saves correctly
- [ ] Quick Consult SLA hours saves correctly
- [ ] Quick Consult description saves correctly
- [ ] Quick Consult enable/disable toggle saves correctly
- [ ] Deep Dive min/max prices save correctly
- [ ] Deep Dive SLA hours saves correctly
- [ ] Deep Dive auto-decline threshold saves correctly
- [ ] Deep Dive description saves correctly
- [ ] Deep Dive enable/disable toggle saves correctly
- [ ] Changes persist after page refresh
- [ ] Changes visible on public profile (`/u/handle`)
- [ ] Legacy `price_cents` and `sla_hours` still work

---

## Payload Example

Here's what the frontend sends to `PUT /me/profile`:

```json
{
  "price_cents": 5000,
  "sla_hours": 24,
  "bio": "Expert in software engineering",
  "public": true,
  "handle": "johndoe",

  "tier1_enabled": true,
  "tier1_price_cents": 5000,
  "tier1_sla_hours": 24,
  "tier1_description": "Quick consultation for immediate questions",

  "tier2_enabled": true,
  "tier2_pricing_mode": "range",
  "tier2_min_price_cents": 10000,
  "tier2_max_price_cents": 50000,
  "tier2_sla_hours": 48,
  "tier2_auto_decline_below_cents": 7500,
  "tier2_description": "In-depth analysis with comprehensive report",

  "currency": "USD",
  "professional_title": "Senior Software Engineer",
  "tagline": "10+ years building scalable systems",
  "expertise": ["JavaScript", "React", "Node.js"],
  "socials": {
    "twitter": "johndoe",
    "linkedin": "johndoe"
  },
  "charity_percentage": 10,
  "selected_charity": 5,
  "accepting_questions": true,
  "daily_digest_enabled": true
}
```

---

## Related Documentation

- `XANO-MIGRATION-CHECKLIST.md` - Migration 001 added tier fields to `expert_profile` table
- `XANO-API-IMPLEMENTATION-GUIDE.md` - Separate `/expert/pricing-tiers` endpoint (not currently used)
- `FRONTEND-IMPLEMENTATION-COMPLETE.md` - Frontend tier implementation details

---

**Last Updated:** October 22, 2025
**Priority:** High - Blocking full two-tier pricing functionality
**Estimated Fix Time:** 10-15 minutes in Xano dashboard
