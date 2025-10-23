# Xano Token Generation Fix - Critical Issue

**Date:** October 23, 2025
**Priority:** 🔴 **CRITICAL** - Blocks askers from accessing their questions
**Status:** ⚠️ Needs immediate fix

---

## Problem

When implementing the two-tier system, the new Xano endpoints (`POST /question/quick-consult` and `POST /question/deep-dive`) are **not generating review tokens** (`playback_token_hash`).

**Impact:**
- ❌ Askers cannot access `/r/{token}` links
- ❌ Email links to askers are broken
- ❌ No way for askers to view their questions or answers
- ❌ 404 errors when trying to access review pages

**Example:**
- Question created with ID 214
- No `playback_token_hash` saved
- Email contains broken link: `https://mindpick.me/r/undefined`
- Asker gets 404 when clicking link

---

## Root Cause

### Legacy Endpoint (Working ✅)

**Endpoint:** POST `/question`

**How it works:**
1. Xano generates `playback_token_hash` automatically (UUID or random hash)
2. Saves it to question record
3. Returns it in response:
   ```json
   {
     "question": { "id": 123, ... },
     "playback_token_hash": "abc123xyz789"
   }
   ```
4. Backend uses token in emails

**Reference:** `api/questions/create.js` line 109-111

---

### New Endpoints (Broken ❌)

**Endpoints:**
- POST `/question/quick-consult`
- POST `/question/deep-dive`

**What's wrong:**
1. ❌ Don't generate `playback_token_hash`
2. ❌ Don't save token to question record
3. ❌ Don't return token in response
4. ❌ Backend expects token but receives `undefined`

**Evidence:**
```javascript
// Backend expects this (lines 74, 84)
const reviewToken = result.playback_token_hash || result.review_token;

// Backend uses it in emails (lines 114, 124)
reviewToken: reviewToken,  // undefined!

// Email link becomes: https://mindpick.me/r/undefined
```

---

## Solution

Both Xano endpoints need to generate and return the `playback_token_hash`.

---

## Fix for POST /question/quick-consult

### Current Function Stack (Without Token):

```
Step 1: Get Expert Profile
Step 2: Validate Tier1 Enabled
Step 3: Get Tier1 Configuration
Step 4: Calculate SLA Deadline
Step 5: Calculate SLA Snapshot
Step 6: Add Question Record ← NO TOKEN GENERATED
Step 7: Add Payment Record
Step 8: Response
```

### Updated Function Stack (With Token):

```
Step 1: Get Expert Profile
Step 2: Validate Tier1 Enabled
Step 3: Get Tier1 Configuration
Step 4: Calculate SLA Deadline
Step 5: Calculate SLA Snapshot
Step 5.5: Generate Playback Token (NEW) ← ADD THIS
Step 6: Add Question Record (include token)
Step 7: Add Payment Record
Step 8: Response (include token)
```

---

### Step 5.5: Generate Playback Token (Lambda)

**Add new Lambda step** after "Calculate SLA Snapshot" and before "Add Question Record":

```javascript
// Generate unique token for review link
var uuid = require('uuid');
return uuid.v4();
```

**Return as:** `playback_token_hash`

**Alternative (if uuid not available):**
```javascript
// Generate random hash
var timestamp = Date.now();
var random = Math.random().toString(36).substring(2, 15);
return timestamp + '_' + random;
```

---

### Step 6: Update Add Question Record

**Add field to question record:**

| Field | Value |
|-------|-------|
| `playback_token_hash` | `playback_token_hash` (variable from Step 5.5) |

**All other fields remain the same.**

---

### Step 8: Update Response

**Current response:**
```javascript
{
  question_id: question.id,
  status: "paid",
  sla_deadline: sla_deadline,
  final_price_cents: tier1_config.price_cents
}
```

**Updated response:**
```javascript
{
  question_id: question.id,
  playback_token_hash: playback_token_hash,  // ← ADD THIS
  status: "paid",
  sla_deadline: sla_deadline,
  final_price_cents: tier1_config.price_cents
}
```

---

## Fix for POST /question/deep-dive

### Current Function Stack (Without Token):

```
Step 1: Get Expert Profile
Step 2: Validate Tier2 Enabled
Step 3: Check Auto-Decline Threshold
Step 4A: Calculate pricing_status
Step 4B: Calculate status
Step 4C: Calculate declined_at
Step 5: Calculate Offer Expiry
Step 6: Calculate SLA Snapshot
Step 7: Add Question Record ← NO TOKEN GENERATED
Step 8: Add Payment Record
Step 9: Response
```

### Updated Function Stack (With Token):

```
Step 1: Get Expert Profile
Step 2: Validate Tier2 Enabled
Step 3: Check Auto-Decline Threshold
Step 4A: Calculate pricing_status
Step 4B: Calculate status
Step 4C: Calculate declined_at
Step 5: Calculate Offer Expiry
Step 6: Calculate SLA Snapshot
Step 6.5: Generate Playback Token (NEW) ← ADD THIS
Step 7: Add Question Record (include token)
Step 8: Add Payment Record
Step 9: Response (include token)
```

---

### Step 6.5: Generate Playback Token (Lambda)

**Same as quick-consult** - Add Lambda step:

```javascript
// Generate unique token for review link
var uuid = require('uuid');
return uuid.v4();
```

**Return as:** `playback_token_hash`

---

### Step 7: Update Add Question Record

**Add field to question record:**

| Field | Value |
|-------|-------|
| `playback_token_hash` | `playback_token_hash` (variable from Step 6.5) |

---

### Step 9: Update Response

**Current response:**
```javascript
{
  question_id: question.id,
  status: pricing_status_value,
  proposed_price_cents: proposed_price_cents,
  offer_expires_at: offer_expires_at
}
```

**Updated response:**
```javascript
{
  question_id: question.id,
  playback_token_hash: playback_token_hash,  // ← ADD THIS
  status: pricing_status_value,
  proposed_price_cents: proposed_price_cents,
  offer_expires_at: offer_expires_at
}
```

---

## Testing

### Test Quick Consult:

**Payload:**
```json
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "title": "Test question",
  "sla_hours_snapshot": 24,
  "stripe_payment_intent_id": "pi_test_123"
}
```

**Expected Response:**
```json
{
  "question_id": 215,
  "playback_token_hash": "abc123-def456-ghi789",  // ← MUST BE PRESENT
  "status": "paid",
  "sla_deadline": 1729800000000,
  "final_price_cents": 5000
}
```

**Database Check:**
```sql
SELECT id, playback_token_hash FROM question WHERE id = 215;
```
**Expected:** `playback_token_hash` should have a value (not null)

**Review Link Test:**
1. Get token from response: `abc123-def456-ghi789`
2. Access: `https://mindpick.me/r/abc123-def456-ghi789`
3. Should load question successfully

---

### Test Deep Dive:

**Payload:**
```json
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "proposed_price_cents": 7000,
  "title": "Test Deep Dive",
  "sla_hours_snapshot": 48,
  "stripe_payment_intent_id": "pi_test_456"
}
```

**Expected Response:**
```json
{
  "question_id": 216,
  "playback_token_hash": "xyz789-abc123-def456",  // ← MUST BE PRESENT
  "status": "offer_pending",
  "proposed_price_cents": 7000,
  "offer_expires_at": 1729900000000
}
```

**Database Check:**
```sql
SELECT id, playback_token_hash FROM question WHERE id = 216;
```
**Expected:** `playback_token_hash` should have a value

**Review Link Test:**
Same as above - should load successfully

---

## Verification Checklist

### Backend (Already Correct ✅):
- [x] `api/questions/quick-consult.js` expects `result.playback_token_hash`
- [x] `api/questions/deep-dive.js` expects `result.playback_token_hash`
- [x] Both use token in email notifications
- [x] Frontend displays question at `/r/{token}`

### Xano (Needs Fix ⚠️):
- [ ] POST `/question/quick-consult` generates token
- [ ] POST `/question/quick-consult` saves token to database
- [ ] POST `/question/quick-consult` returns token in response
- [ ] POST `/question/deep-dive` generates token
- [ ] POST `/question/deep-dive` saves token to database
- [ ] POST `/question/deep-dive` returns token in response

### Testing:
- [ ] Quick Consult returns token in response
- [ ] Deep Dive returns token in response
- [ ] Tokens saved in database (not null)
- [ ] Review links work: `/r/{token}` loads question
- [ ] Email links work for askers

---

## Alternative: Use Xano Built-in Token Generation

If Xano has a built-in function for generating tokens, use that instead:

**Check for:**
- `uuid()` function
- `hash()` function
- `random_string()` function

**Example:**
```javascript
// If Xano has uuid() function
return uuid();

// If Xano has hash function
return hash(Date.now() + '_' + Math.random());
```

---

## Impact of Not Fixing

If this is not fixed immediately:

- ❌ **All new questions created via two-tier system are inaccessible**
- ❌ **Askers cannot view their questions or answers**
- ❌ **Email links are broken**
- ❌ **Feedback system doesn't work** (requires access to `/r/{token}`)
- ❌ **Paid customers cannot see what they paid for**

**This blocks the entire two-tier feature from working in production.**

---

## Quick Fix: Backfill Tokens for Existing Questions

If questions were already created without tokens:

```sql
-- Generate tokens for existing questions without them
UPDATE question
SET playback_token_hash = CONCAT(id, '_', MD5(CONCAT(id, created_at)))
WHERE playback_token_hash IS NULL
  OR playback_token_hash = '';
```

**Note:** This gives existing questions tokens so they're accessible via `/r/{token}`.

---

## Related Files

**Backend:**
- `api/questions/quick-consult.js` (line 74) - Expects token
- `api/questions/deep-dive.js` (line 84) - Expects token
- `api/questions/create.js` (line 109-111) - Legacy example

**Frontend:**
- `src/pages/AnswerReviewPage.jsx` - Loads question via token

**Xano:**
- POST `/question/quick-consult` - Needs token generation
- POST `/question/deep-dive` - Needs token generation
- GET `/review/{token}` - Uses token to fetch question

---

**Status:** 🔴 Critical issue - needs immediate fix
**Blocks:** All new two-tier questions from being accessible
**Priority:** Must fix before any production deployment

**Last Updated:** October 23, 2025
