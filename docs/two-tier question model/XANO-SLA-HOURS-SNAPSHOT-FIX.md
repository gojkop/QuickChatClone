# Fix: sla_hours_snapshot Not Being Saved

**Date:** October 23, 2025
**Issue:** Time left column empty for all new questions (both Quick Consult and Deep Dive)
**Root Cause:** `sla_hours_snapshot` not being passed from Vercel to Xano endpoints

---

## Problem Summary

The "time left" column in the expert dashboard shows empty for new questions because:

1. ✅ **Frontend** correctly sends `sla_hours_snapshot` (AskQuestionPage.jsx:144)
2. ✅ **Vercel endpoints** now pass it to Xano (FIXED in this session)
3. ❌ **Xano endpoints** don't accept it as input parameter (NEEDS FIX)

---

## Backend Changes (Completed)

### 1. api/questions/quick-consult.js

**Added `sla_hours_snapshot` to Xano payload (line 60):**

```javascript
body: JSON.stringify({
  expert_profile_id: expertProfile.id,
  payer_email: payerEmail,
  title,
  text: text || null,
  attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
  media_asset_id: recordingSegments.length > 0 ? recordingSegments[0].mediaAssetId : null,
  sla_hours_snapshot,  // ← ADDED
  stripe_payment_intent_id
})
```

### 2. api/questions/deep-dive.js

**Added `sla_hours_snapshot` to Xano payload (line 70):**

```javascript
body: JSON.stringify({
  expert_profile_id: expertProfile.id,
  payer_email: payerEmail,
  proposed_price_cents,
  asker_message: asker_message || null,
  title,
  text: text || null,
  attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
  media_asset_id: recordingSegments.length > 0 ? recordingSegments[0].mediaAssetId : null,
  sla_hours_snapshot,  // ← ADDED
  stripe_payment_intent_id
})
```

---

## Xano Changes Required

### Endpoint 1: POST /question/quick-consult

**Location:** Public API group in Xano
**Path:** `/question/quick-consult`

#### Step 1: Add Input Parameter

**Current inputs:**
1. expert_profile_id (Integer)
2. payer_email (Text)
3. title (Text)
4. text (Text, optional)
5. attachments (Text, optional)
6. media_asset_id (Integer, optional)
7. stripe_payment_intent_id (Text)

**Add new input:**
8. `sla_hours_snapshot` (Integer, optional)

#### Step 2: Update "Add Record" Step

**Find:** Step that adds record to `question` table

**Current logic (line 425 in docs):**
```javascript
sla_hours_snapshot = tier1_config.sla_hours  // Calculated from profile
```

**Change to:**
```javascript
sla_hours_snapshot = sla_hours_snapshot (input) || tier1_config.sla_hours  // Use input if provided, fallback to profile
```

**Why:** This preserves the SLA hours that were displayed to the customer at purchase time, even if the expert changes their tier settings later.

---

### Endpoint 2: POST /question/deep-dive

**Location:** Public API group in Xano
**Path:** `/question/deep-dive`

#### Step 1: Add Input Parameter

**Current inputs:**
1. expert_profile_id (Integer)
2. payer_email (Text)
3. proposed_price_cents (Integer)
4. asker_message (Text, optional)
5. title (Text)
6. text (Text, optional)
7. attachments (Text, optional)
8. media_asset_id (Integer, optional)
9. stripe_payment_intent_id (Text)

**Add new input:**
10. `sla_hours_snapshot` (Integer, optional)

#### Step 2: Update "Add Record" Step

**Find:** Step 6 that adds record to `question` table (lines 559-582 in docs)

**Current:** `sla_hours_snapshot` field is NOT set at all

**Add field:**
```javascript
sla_hours_snapshot = sla_hours_snapshot (input) || expert_profile.tier2_sla_hours
```

**Note:** For Deep Dive, the SLA timer doesn't start until the offer is accepted, but we still need to record what SLA was promised so it can be used when the offer is accepted.

---

## Step-by-Step Xano Fix

### For POST /question/quick-consult:

1. **Go to Xano → Public API → Functions**
2. **Find:** `submit_quick_consult_question` (or similar name)
3. **Click "Get & Post" tab**
4. **Add Input:**
   - Name: `sla_hours_snapshot`
   - Type: Integer
   - Required: No
5. **Go to "Function Stack" tab**
6. **Find:** Step that adds record to `question` table
7. **Edit the `sla_hours_snapshot` field mapping:**
   - Change from: `tier1_config.sla_hours`
   - Change to: `sla_hours_snapshot || tier1_config.sla_hours`
   - This uses the input if provided, otherwise falls back to tier config
8. **Save and Test**

### For POST /question/deep-dive:

1. **Go to Xano → Public API → Functions**
2. **Find:** `submit_deep_dive_offer` (or similar name)
3. **Click "Get & Post" tab**
4. **Add Input:**
   - Name: `sla_hours_snapshot`
   - Type: Integer
   - Required: No
5. **Go to "Function Stack" tab**
6. **Find:** Step that adds record to `question` table
7. **Add the `sla_hours_snapshot` field if not present:**
   - Field: `sla_hours_snapshot`
   - Value: `sla_hours_snapshot || expert_profile.tier2_sla_hours`
8. **Save and Test**

---

## Testing

### Test Quick Consult:

1. Submit a new Quick Consult question
2. Check the `question` table in Xano
3. Verify `sla_hours_snapshot` is populated (should be 24 or whatever the tier1_sla_hours is)
4. Check expert dashboard
5. Verify "Time Left" column shows a value (e.g., "23h 59m")

### Test Deep Dive:

1. Submit a new Deep Dive offer
2. Check the `question` table in Xano
3. Verify `sla_hours_snapshot` is populated (should be 48 or whatever the tier2_sla_hours is)
4. Accept the offer in expert dashboard
5. Verify "Time Left" column shows a value after acceptance

---

## Why This Matters

**Problem:** If we calculate `sla_hours_snapshot` from the expert's current tier settings:
- Expert changes SLA from 24h to 48h after a question is submitted
- Old questions now show incorrect SLA deadline
- Customer sees different SLA than what they paid for

**Solution:** Accept `sla_hours_snapshot` as input from frontend:
- Frontend gets SLA from expert's profile at purchase time
- Passes it to backend as a snapshot
- Xano stores this snapshot in the question record
- Even if expert changes settings later, historical questions show correct SLA

---

## Flow Diagram

```
User selects tier
    ↓
Frontend gets tier config with sla_hours
    ↓
User submits question
    ↓
Frontend sends sla_hours_snapshot = tierConfig.sla_hours
    ↓
Vercel endpoint receives sla_hours_snapshot
    ↓
Vercel passes sla_hours_snapshot to Xano
    ↓
Xano stores sla_hours_snapshot in question table ← FIX NEEDED HERE
    ↓
Expert dashboard calculates "Time Left" using sla_hours_snapshot
```

---

## Related Files

**Backend (Vercel):**
- `api/questions/quick-consult.js` - ✅ Fixed (added sla_hours_snapshot to payload)
- `api/questions/deep-dive.js` - ✅ Fixed (added sla_hours_snapshot to payload)

**Frontend:**
- `src/pages/AskQuestionPage.jsx:144` - ✅ Already sends sla_hours_snapshot

**Xano:**
- `POST /question/quick-consult` - ❌ Needs input parameter + field mapping update
- `POST /question/deep-dive` - ❌ Needs input parameter + field mapping update

**Documentation:**
- `docs/two-tier question model/XANO-API-IMPLEMENTATION-GUIDE.md` - Needs update to reflect sla_hours_snapshot as input

---

**Status:** Backend fixes complete, Xano updates required
**Next Step:** Update Xano endpoints to accept and use sla_hours_snapshot input

**Last Updated:** October 23, 2025
