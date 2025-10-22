# URGENT: GET /me/questions Not Returning Tier Fields

**Date:** October 22, 2025
**Status:** 🚨 CRITICAL - Tier fields exist in DB but not returned in API
**Priority:** HIGH - Blocking visual distinction of question types

---

## Issue

The `GET /me/questions` endpoint is **not returning** the tier-related fields in the response, even though they exist in the database.

**Database (Correct):**
```sql
question_tier = "deep_dive"
pricing_status = "offer_pending"
proposed_price_cents = 15000
```

**API Response (Missing fields):**
```javascript
{
  id: 199,
  title: "Test Deep Dive Architecture Re",
  question_tier: undefined,        // ❌ Not returned by API
  pricing_status: undefined,       // ❌ Not returned by API
  proposed_price_cents: undefined  // ❌ Not returned by API
}
```

**Impact:**
- ❌ Tier badges don't appear (⚡ Quick / 🎯 Deep Dive)
- ❌ Deep Dive questions don't get purple highlighting
- ❌ Cannot distinguish between question types
- ❌ PendingOffersSection doesn't work (needs pricing_status)

---

## Root Cause

The Xano endpoint `GET /me/questions` is not configured to return the new tier-related fields in its response structure.

---

## Solution: Update Xano GET Endpoint

### Endpoint: GET /me/questions

**Location:** Authentication API group in Xano
**Path:** `/me/questions`
**Authentication:** Required (Bearer token)

### Current Response Structure:

The endpoint currently returns something like:
```json
{
  "questions": [
    {
      "id": 199,
      "title": "Question title",
      "status": "paid",
      "created_at": 1729500000000,
      "payer_email": "test@example.com",
      // ... other fields ...
    }
  ]
}
```

### Required Fix:

In the **Response** step or **Lambda** function that builds the response, you need to include these additional fields for each question:

**Add these fields to the response:**
```javascript
question_tier: question.question_tier,
pricing_status: question.pricing_status,
proposed_price_cents: question.proposed_price_cents,
asker_message: question.asker_message,
offer_expires_at: question.offer_expires_at,
final_price_cents: question.final_price_cents
```

### Updated Response Structure:

After the fix, the response should look like:
```json
{
  "questions": [
    {
      "id": 199,
      "title": "Question title",
      "status": "paid",
      "created_at": 1729500000000,
      "payer_email": "test@example.com",

      // ✅ Add these fields:
      "question_tier": "deep_dive",
      "pricing_status": "offer_pending",
      "proposed_price_cents": 15000,
      "asker_message": "This is urgent...",
      "offer_expires_at": 1729586400000,
      "final_price_cents": null
    }
  ]
}
```

---

## How to Fix in Xano

### Option A: If using Lambda to build response

If your endpoint has a Lambda function that builds the response object, update it to include the tier fields:

```javascript
var questions = $var.questions || [];
var result = [];

for (var i = 0; i < questions.length; i++) {
  var q = questions[i];

  result.push({
    id: q.id,
    title: q.title,
    text: q.text,
    status: q.status,
    created_at: q.created_at,
    payer_email: q.payer_email,
    // ... other existing fields ...

    // ✅ Add these tier fields:
    question_tier: q.question_tier,
    pricing_status: q.pricing_status,
    proposed_price_cents: q.proposed_price_cents,
    asker_message: q.asker_message,
    offer_expires_at: q.offer_expires_at,
    final_price_cents: q.final_price_cents
  });
}

return result;
```

**Important:** Make sure to use `$var.questions` not just `questions` to access the variable from previous steps!

### Option B: If using direct database query

If your endpoint returns the query results directly, make sure the query includes these fields in the SELECT:

1. Go to the "Query All Records" or "Get Record" step
2. Make sure it's selecting from the full `question` table (not a filtered view)
3. The response will automatically include all fields from the table

Then in the Response step, make sure you're returning the full question objects, not filtering out fields.

---

## Testing Checklist

After updating the endpoint:

1. **Test in Xano Run & Debug:**
   - Click "Run & Debug" on the GET /me/questions endpoint
   - Check the response - should include `question_tier`, `pricing_status`, etc.

2. **Test in Browser:**
   - Refresh your dashboard
   - Open console and check the debug logs:
   ```javascript
   🔍 Question tier debug: {
     id: 199,
     question_tier: "deep_dive",        // ✅ Should now be set
     pricing_status: "offer_pending",   // ✅ Should now be set
     proposed_price_cents: 15000        // ✅ Should now be set
   }
   ```

3. **Visual Verification:**
   - [ ] Quick Consult questions show ⚡ Quick badge
   - [ ] Deep Dive questions show 🎯 Deep Dive badge (purple gradient, bold)
   - [ ] Deep Dive questions have purple background tint
   - [ ] Deep Dive questions have 4px purple left border
   - [ ] Pending Deep Dive offers appear in PendingOffersSection

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Lambda not using $var prefix
```javascript
// ❌ WRONG - will fail
var q = questions[i];
```

```javascript
// ✅ CORRECT - must use $var
var q = $var.questions[i];
```

### ❌ Mistake 2: Response filtering out fields

Make sure the Response step doesn't filter the output. If you have:
```javascript
return {
  questions: [limited fields]
}
```

Change to include all fields:
```javascript
return {
  questions: result  // where result includes all tier fields
}
```

### ❌ Mistake 3: Wrong table/view selected

Make sure the query is pulling from the main `question` table, not a view or filtered subset that might not include the new columns.

---

## Quick Verification Query

To verify the fields exist in your database, run this in Xano:

**Check a specific question:**
```sql
SELECT
  id,
  title,
  question_tier,
  pricing_status,
  proposed_price_cents,
  offer_expires_at
FROM question
WHERE id = 199
```

Should return:
```
id: 199
title: "Test Deep Dive Architecture Review"
question_tier: "deep_dive"
pricing_status: "offer_pending" (or "offer_accepted" if you accepted it)
proposed_price_cents: 15000
offer_expires_at: [timestamp]
```

---

## Related Documentation

- `XANO-API-IMPLEMENTATION-GUIDE.md` - Complete endpoint specifications
- `XANO-QUESTION-TIER-FIELD-MISSING.md` - POST endpoint fix (already done)
- `XANO-LAMBDA-TROUBLESHOOTING.md` - Lambda variable scoping issues

---

**Last Updated:** October 22, 2025
**Priority:** 🚨 CRITICAL
**Estimated Fix Time:** 10-15 minutes
**Blocking:** Visual distinction of question types, PendingOffersSection
