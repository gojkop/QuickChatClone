# URGENT: Xano Decline Endpoint Issue

**Date:** October 22, 2025
**Status:** 🚨 CRITICAL - Endpoint returning 500 error
**URL:** `POST /offers/{id}/decline`

---

## Issue

When trying to decline a Deep Dive offer, the request fails with:

```
Failed to load https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ/offers/187/decline
resource: the server responded with a status of 500 ()
```

This indicates the Xano endpoint either:
1. **Doesn't exist** in the Authentication API group
2. **Has a runtime error** in its implementation

---

## Quick Check in Xano

1. Go to Xano → API Groups → **Authentication API** (the one with base URL ending in `:3B14WLbJ`)
2. Look for endpoint: `POST /offers/{id}/decline`

**If it doesn't exist:** Create it using the instructions below
**If it exists:** Check Xano function logs for the error

---

## Create the Endpoint

### Step 1: Create New Endpoint

1. Go to: **Authentication API** group
2. Click: **Add API Endpoint**
3. Set:
   - **Name:** `decline_deep_dive_offer`
   - **Method:** `POST`
   - **Path:** `/offers/{id}/decline`
   - **Authentication:** `Requires Authentication`

### Step 2: Add Inputs

| Input Name | Type | Source | Required |
|------------|------|--------|----------|
| `id` | integer | Path | Yes |
| `decline_reason` | text | Body | No |

### Step 3: Build Function Stack

Click "Edit Function Stack" and add these steps:

#### Step 1: Get Authenticated User
- **Type:** Get Authenticated User
- **Return as:** `auth_user`

#### Step 2: Get Expert Profile
- **Type:** Database Request → Get Record
- **Table:** `expert_profile`
- **Filter:** `user_id = auth_user.id`
- **Return as:** `expert_profile`

#### Step 3: Get Question
- **Type:** Database Request → Get Record
- **Table:** `question`
- **Filter:** `id = id` (the input parameter)
- **Return as:** `question`

#### Step 4: Validate Offer (Lambda)
- **Type:** Run Function Stack → Lambda
- **Code:**
```javascript
var q = $var.question;
var expertProfileId = $var.expert_profile.id;

// Verify question exists
if (!q) {
  throw new Error("Offer not found");
}

// Verify question belongs to this expert
if (q.expert_profile_id !== expertProfileId) {
  throw new Error("This offer does not belong to you");
}

// Verify status is offer_pending
if (q.pricing_status !== "offer_pending") {
  throw new Error("This offer cannot be declined (current status: " + q.pricing_status + ")");
}

return true;
```
- **Return as:** `validation_passed`

#### Step 5: Update Question Record
- **Type:** Database Request → Edit Record
- **Table:** `question`
- **Record:** `question` (from Step 3)
- **Fields to update:**

| Field | Value | Type |
|-------|-------|------|
| `pricing_status` | `"offer_declined"` | Literal string |
| `expert_reviewed_at` | `Date.now()` | Expression |
| `decline_reason` | `decline_reason` | Input variable |

- **Return as:** `updated_question`

#### Step 6: Get Payment Record (Optional - if payments table exists)
- **Type:** Database Request → Get Record
- **Table:** `payment`
- **Filter:** `question_id = question.id`
- **Return as:** `payment`
- **Note:** Skip this if you don't have a payments table yet

#### Step 7: Update Payment Status (Optional)
- **Type:** Database Request → Edit Record
- **Table:** `payment`
- **Record:** `payment` (from Step 6)
- **Fields:**
  - `payment_status` = `"refunded"`
  - `refunded_at` = `Date.now()`
- **Return as:** `updated_payment`
- **Note:** Skip this if you don't have a payments table yet

#### Step 8: Response
- **Type:** Response
- **Response Body:**
```json
{
  "success": true,
  "message": "Offer declined successfully",
  "question_id": {{updated_question.id}},
  "pricing_status": {{updated_question.pricing_status}}
}
```

---

## Test the Endpoint

### Using Xano's Built-in Tester:

1. Click "Run & Debug" in the endpoint editor
2. Set inputs:
   - `id`: Use a real question ID from your database (e.g., 187)
   - `decline_reason`: "Testing decline endpoint"
3. Click "Run"
4. Should return:
```json
{
  "success": true,
  "message": "Offer declined successfully",
  "question_id": 187,
  "pricing_status": "offer_declined"
}
```

### Verify in Database:

1. Go to: Database → `question` table
2. Find the question with ID 187
3. Check fields:
   - ✅ `pricing_status` should be `"offer_declined"`
   - ✅ `expert_reviewed_at` should have a timestamp
   - ✅ `decline_reason` should have your test message

---

## Common Errors

### Error: "Offer not found"
- The question ID doesn't exist in the database
- Check that you're using a real question ID

### Error: "This offer does not belong to you"
- The question's `expert_profile_id` doesn't match the authenticated user
- Make sure you're testing with the correct expert account

### Error: "This offer cannot be declined"
- The question's `pricing_status` is not `"offer_pending"`
- Check the current status in the database
- Valid status must be `"offer_pending"` to decline

### Error: "Cannot read property 'expert_profile_id' of undefined"
- Lambda function cannot access variables
- Make sure you're using `$var.question` and `$var.expert_profile`

---

## After Fixing

1. Try declining an offer from the frontend again
2. Check browser console for new logs
3. Check Vercel function logs for detailed Xano error (if still failing)
4. The declined offer should disappear after 30 seconds (auto-refresh)

---

## Related Files

**Frontend:**
- `src/components/dashboard/PendingOffersSection.jsx` - Line 100

**Backend:**
- `api/offers/[id]/decline.js` - Vercel proxy endpoint

**Documentation:**
- `XANO-API-IMPLEMENTATION-GUIDE.md` - Lines 892-1000
- `XANO-DECLINE-OFFER-FIX.md` - Complete specifications

---

**Last Updated:** October 22, 2025
**Priority:** 🚨 CRITICAL - Blocking Deep Dive offer management
**Estimated Fix Time:** 15-20 minutes in Xano dashboard
