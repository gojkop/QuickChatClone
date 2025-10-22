# Fix: Rejected Offers Still Appearing in Pending Offers

**Date:** October 22, 2025
**Status:** ⚠️ URGENT - Blocking Deep Dive workflow
**Issue:** Declined Deep Dive offers still appear in PendingOffersSection after rejection

---

## Problem

When an expert declines a Deep Dive offer:
1. Frontend calls `POST /offers/{id}/decline` ✅
2. Frontend removes offer from UI state ✅
3. Xano endpoint processes the decline... ❓
4. Page refreshes (auto-refresh every 30 seconds) ❌
5. Declined offer reappears in the list ❌

**Root Cause:** The Xano endpoint `POST /offers/{id}/decline` is either:
- Not implemented yet, OR
- Implemented but not updating `pricing_status` to `"offer_declined"`

This causes the GET `/expert/pending-offers` endpoint to continue returning declined offers.

---

## Solution: Update Xano Endpoint

### Endpoint: POST /offers/{id}/decline

**Location:** Authentication API group in Xano

#### Step 1: Verify Endpoint Exists

Check if the endpoint `/offers/{id}/decline` exists in Xano.

**If it doesn't exist:** Create it using the specification below.
**If it exists:** Verify Step 5 updates `pricing_status` correctly.

#### Step 2: Add Input Parameters

```
id               (integer, path parameter) - Question ID
decline_reason   (text, optional) - Expert's reason for declining
```

#### Step 3: Function Stack

```
Step 1: Get Authenticated User
  - Type: Get Authenticated User
  - return as: auth_user

Step 2: Get Expert Profile
  - Type: Database Request → Get Record
  - Table: expert_profile
  - Filter: WHERE user_id = auth_user.id
  - return as: expert_profile

Step 3: Get Question
  - Type: Database Request → Get Record
  - Table: question
  - Filter: WHERE id = id (input parameter)
  - return as: question

Step 4: Validate Offer (Lambda)
  - Type: Lambda
  - Code:
    var q = $var.question;
    var expertProfileId = $var.expert_profile.id;

    // Verify question belongs to this expert
    if (q.expert_profile_id !== expertProfileId) {
      throw new Error("This offer does not belong to you");
    }

    // Verify status is offer_pending
    if (q.pricing_status !== "offer_pending") {
      throw new Error("This offer cannot be declined (status: " + q.pricing_status + ")");
    }

    return true;
  - return as: validation_passed

Step 5: Update Question Record ⚠️ CRITICAL STEP
  - Type: Database Request → Edit Record
  - Table: question
  - Record: question (from Step 3)
  - Fields to update:
    • pricing_status = "offer_declined" (literal string)
    • expert_reviewed_at = Date.now() (current timestamp)
    • decline_reason = decline_reason (input, may be null)
  - return as: updated_question

Step 6: Get Payment Record
  - Type: Database Request → Get Record
  - Table: payment
  - Filter: WHERE question_id = question.id
  - return as: payment

Step 7: Update Payment Status
  - Type: Database Request → Edit Record
  - Table: payment
  - Record: payment (from Step 6)
  - Fields to update:
    • payment_status = "refunded"
    • refunded_at = Date.now()
  - return as: updated_payment

Step 8: Response
  - Type: Response
  - Set Response:
    {
      "success": true,
      "message": "Offer declined and payment refunded",
      "question_id": updated_question.id,
      "pricing_status": updated_question.pricing_status
    }
```

---

## How GET /expert/pending-offers Works

The pending offers endpoint filters questions by:

```javascript
Filter:
  • expert_profile_id = expert_profile.id
  • question_tier = "deep_dive"
  • pricing_status = "offer_pending"  // ← This is the key filter
  • offer_expires_at > now
```

**After declining:**
- `pricing_status` changes from `"offer_pending"` → `"offer_declined"`
- Question no longer matches filter criteria
- Question excluded from pending offers list ✅

---

## Testing Checklist

After updating the Xano endpoint:

1. [ ] Create two Deep Dive offers from frontend
2. [ ] Decline one offer as expert
3. [ ] Verify decline API call succeeds (check Network tab)
4. [ ] Wait for auto-refresh (30 seconds) or manually refresh page
5. [ ] ✅ Declined offer should disappear from PendingOffersSection
6. [ ] ✅ Accepted/pending offer should still appear
7. [ ] Check Xano database directly:
   - [ ] Declined question has `pricing_status = "offer_declined"`
   - [ ] Payment record has `payment_status = "refunded"`

---

## Database Verification Queries

**Check pricing_status values in Xano:**

1. Go to Xano → Database → `question` table
2. Filter by `question_tier = "deep_dive"`
3. Look at `pricing_status` column values:
   - `"offer_pending"` → Should appear in pending offers list
   - `"offer_declined"` → Should NOT appear in pending offers list
   - `"offer_accepted"` → Moved to expert's queue

**Expected states:**
- Pending offers: `pricing_status = "offer_pending"`
- Declined offers: `pricing_status = "offer_declined"`
- Accepted offers: `pricing_status = "offer_accepted"`, `status = "pending"`

---

## Related Documentation

- `XANO-API-IMPLEMENTATION-GUIDE.md` - Complete endpoint specifications
  - GET /expert/pending-offers - Lines 650-748
  - POST /offers/{id}/decline - Lines 892-1000
- `FRONTEND-IMPLEMENTATION-COMPLETE.md` - Frontend implementation
  - PendingOffersSection.jsx - handleDecline function

---

## Frontend Code (Already Correct)

The frontend correctly handles the decline:

```javascript
// PendingOffersSection.jsx - Line 99
const handleDecline = async (offerId) => {
  // ... prompt for reason ...

  await apiClient.post(`/offers/${offerId}/decline`, {
    decline_reason: reason || 'Expert declined'
  });

  // Remove from local state
  setOffers(prev => prev.filter(offer => offer.question_id !== offerId));

  // Trigger parent refresh
  if (onOfferUpdate) {
    onOfferUpdate();
  }
}
```

The issue is that when the component refreshes (every 30 seconds via useEffect), it fetches pending offers again from Xano. If Xano didn't update `pricing_status`, the declined offer comes back.

---

**Last Updated:** October 22, 2025
**Priority:** Urgent - Blocking Deep Dive acceptance workflow
**Estimated Fix Time:** 10-15 minutes in Xano dashboard
**User Impact:** Experts cannot properly manage Deep Dive offers
