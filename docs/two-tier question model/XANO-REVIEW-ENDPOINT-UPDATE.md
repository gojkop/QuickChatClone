# Xano GET /review/{token} Endpoint Update

**Date:** October 23, 2025
**Issue:** AnswerReviewPage needs `pricing_status` and `decline_reason` fields
**Priority:** High (500 error on production)

---

## Problem

The frontend AnswerReviewPage now checks for `pricing_status` and `decline_reason` to display declined offer messages, but the Xano endpoint doesn't return these fields.

**Error:** 500 Internal Server Error when loading `/r/{token}`

---

## Solution

Update the Xano GET `/review/{token}` endpoint to include these fields in the response.

---

## Xano Endpoint Details

**Endpoint:** GET `/review/{token}`
**Location:** Public API group in Xano
**Authentication:** None (public endpoint, uses token)

---

## Fields to Add

The endpoint needs to return these additional fields from the `question` table:

| Field | Type | Description |
|-------|------|-------------|
| `pricing_status` | text | "offer_pending", "offer_accepted", "offer_declined", or null |
| `decline_reason` | text | Reason for decline (e.g., "Offer below minimum threshold ($50)") |

---

## Current Response Structure

```json
{
  "id": 214,
  "title": "Question title",
  "text": "Question text",
  "created_at": 1729700000000,
  "price_cents": 5000,
  "currency": "USD",
  "status": "paid",
  "sla_hours_snapshot": 24,
  "attachments": "[...]",
  "media_asset": [...],
  "answer": {...},
  "media_asset_answer": [...],
  "expert_profile": {...},
  "user": "Expert Name"
}
```

---

## Updated Response Structure

Add these fields:

```json
{
  "id": 214,
  "title": "Question title",
  "text": "Question text",
  "created_at": 1729700000000,
  "price_cents": 5000,
  "currency": "USD",
  "status": "paid",
  "pricing_status": "offer_declined",  // ← ADD THIS
  "decline_reason": "Offer below minimum threshold ($50)",  // ← ADD THIS
  "sla_hours_snapshot": 24,
  "attachments": "[...]",
  "media_asset": [...],
  "answer": {...},
  "media_asset_answer": [...],
  "expert_profile": {...},
  "user": "Expert Name"
}
```

---

## How to Update in Xano

### Step 1: Find the Endpoint

1. Go to Xano → Public API
2. Find GET `/review/{token}` endpoint
3. Click to open

### Step 2: Check Current Response

The endpoint likely has a response step that returns the question data. It might look like:

```
Response:
{
  id: question.id,
  title: question.title,
  text: question.text,
  created_at: question.created_at,
  price_cents: question.price_cents,
  currency: question.currency,
  status: question.status,
  // ... other fields
}
```

### Step 3: Add the Fields

Update the response to include:

```
Response:
{
  id: question.id,
  title: question.title,
  text: question.text,
  created_at: question.created_at,
  price_cents: question.price_cents,
  currency: question.currency,
  status: question.status,
  pricing_status: question.pricing_status,  // ← ADD
  decline_reason: question.decline_reason,  // ← ADD
  sla_hours_snapshot: question.sla_hours_snapshot,
  // ... other fields
}
```

### Step 4: Test

Test the endpoint in Xano:
1. Use "Test Request" with a valid token
2. Verify response includes `pricing_status` and `decline_reason`
3. Fields should be `null` for non-Deep Dive questions
4. Fields should have values for declined Deep Dive questions

---

## Testing

### Test Case 1: Normal Question (Quick Consult)
**Expected:**
```json
{
  "pricing_status": null,
  "decline_reason": null
}
```

### Test Case 2: Pending Deep Dive Offer
**Expected:**
```json
{
  "pricing_status": "offer_pending",
  "decline_reason": null
}
```

### Test Case 3: Declined Deep Dive Offer
**Expected:**
```json
{
  "pricing_status": "offer_declined",
  "decline_reason": "Offer below minimum threshold ($50)"
}
```

### Test Case 4: Accepted Deep Dive Offer
**Expected:**
```json
{
  "pricing_status": "offer_accepted",
  "decline_reason": null
}
```

---

## Frontend Handling

The frontend is already updated to handle these fields:

```jsx
// AnswerReviewPage.jsx (lines 53-54)
pricing_status: rawData.pricing_status || null,
decline_reason: rawData.decline_reason || null,

// UI check (line 538)
{data.pricing_status === 'offer_declined' && (
  // Show declined banner
)}
```

**Graceful degradation:** If fields are missing, they default to `null` and the declined banner doesn't show (no error).

---

## Alternative: Quick Fix (If Xano Can't Be Updated Immediately)

If the Xano endpoint is complex and hard to update immediately, we can make the frontend even more defensive:

```jsx
// Check if rawData has the fields before accessing
pricing_status: rawData?.pricing_status ?? null,
decline_reason: rawData?.decline_reason ?? null,
```

**This is already done**, so the frontend should not crash even if Xano doesn't return the fields.

---

## Related Files

**Frontend:**
- `src/pages/AnswerReviewPage.jsx` - Uses pricing_status and decline_reason
- `src/components/dashboard/QuestionDetailModal.jsx` - Also uses pricing_status

**Xano:**
- GET `/review/{token}` - Needs update

**Documentation:**
- `DECLINED-STATUS-UI.md` - UI implementation guide
- `AUTO-DECLINE-XANO-IMPLEMENTATION.md` - Auto-decline logic

---

## Summary

1. ✅ Frontend updated to handle missing fields gracefully (no crash)
2. ⚠️ Xano GET `/review/{token}` needs to return `pricing_status` and `decline_reason`
3. 🎯 Without Xano update, declined banner won't show (but page won't crash)

**Status:** Frontend fixed, Xano update recommended
**Priority:** Medium (feature won't work fully without Xano update, but no errors)

---

**Last Updated:** October 23, 2025
