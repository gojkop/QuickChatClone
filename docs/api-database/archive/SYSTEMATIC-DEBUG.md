# Systematic Debug Plan

**Current Status:** All 6 tests still failing after updates
**This means:** Either the changes weren't saved in Xano, or there's a different issue

---

## Step 1: Verify PATCH /question/{id} is Updated

### In Xano:
1. Open **Authentication API** → `PATCH /question/{id}`
2. Find the ownership check lambda (should be step 4 or 5)
3. **Check if it contains:** `parseInt($var.existing_question.expert_profile_id)`
4. If NO → The update wasn't saved
5. If YES → There's a different problem

### Add Debug Lambda BEFORE Ownership Check:

```javascript
api.lambda {
  code = """
    console.log("=== DEBUG START ===");
    console.log("auth.user.id: " + $auth.user.id);
    console.log("expert_profile: " + JSON.stringify($var.expert_profile));
    console.log("existing_question: " + JSON.stringify($var.existing_question));
    console.log("=== DEBUG END ===");
    return true;
  """
}
```

### Test Manually:

**With curl:**
```bash
curl -X PATCH https://xlho-4syv-navp.n7e.xano.io/api:3B14WLbJ/question/279 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

**Expected:**
- Should see console.log output in Xano logs
- Should return either 200 (success) or 403 (ownership failed)
- Should NOT return 500

**Go to Xano → Logs and check for:**
- The debug output
- Any error messages

---

## Step 2: Check if Updates Are Really Saved

Common Xano issues:
1. **Forgot to click "Save"** - Changes aren't saved until you click Save button
2. **Wrong API group** - Updated Public API instead of Auth API
3. **Wrong endpoint** - Updated GET instead of PATCH
4. **Lambda disabled** - Lambda step exists but is disabled/commented

### Verify each endpoint:

**PATCH /question/{id}** (Authentication API)
- [ ] Lambda contains `parseInt()`
- [ ] Lambda is enabled (not greyed out)
- [ ] Save button was clicked
- [ ] Correct API group (api:3B14WLbJ)

**POST /answer** (Authentication API)
- [ ] Lambda contains `parseInt()`
- [ ] Lambda is enabled
- [ ] Save button was clicked
- [ ] Correct API group (api:3B14WLbJ)

**POST /review/{token}/feedback** (Public API)
- [ ] Lambda contains `parseInt()` for rating
- [ ] Lambda is enabled
- [ ] Save button was clicked
- [ ] Correct API group (api:BQW1GS7L)

**POST /question/quick-consult** (Public API)
- [ ] Has payment check as FIRST step
- [ ] Checks `payment_table_structure` table
- [ ] Conditional checks `$existing_payment != null`
- [ ] Save button was clicked

**POST /question/deep-dive** (Public API)
- [ ] Has payment check as FIRST step
- [ ] Checks `payment_table_structure` table
- [ ] Conditional checks `$existing_payment != null`
- [ ] Save button was clicked

---

## Step 3: Check Variable Names Match Database

The 500 error could be from trying to access fields that don't exist.

### In your Xano database, verify these tables have these columns:

**question table:**
- `id` (integer)
- `expert_profile_id` (integer) ← Check spelling!
- `playback_token_hash` (text)
- `payment_intent_id` (text)
- `status` (text)

**expert_profile table:**
- `id` (integer)
- `user_id` (integer)

**answer table:**
- `id` (integer)
- `question_id` (integer)
- `rating` (integer)
- `feedback_at` (timestamp)

**payment_table_structure table:**
- `stripe_payment_intent_id` (text)
- `question_id` (integer)

### If any of these don't exist or have different names:
That's your problem! Update the endpoint code to use the actual field names.

---

## Step 4: Test Payment Reuse Manually

The test creates a new question (285) successfully, but payment reuse isn't being blocked.

### Manual Test:

1. Note the `stripe_payment_intent_id` from the successful question (285)
2. Try to create another question with THE SAME payment intent ID
3. Expected: Should get 400 error "Payment already used"
4. Actual: If it succeeds, the validation isn't running

### Check in Xano:

1. Open **Public API** → `POST /question/quick-consult`
2. **Is the payment check the FIRST step?** (before any db.add)
3. Look at the db.get step:
   ```
   db.get payment_table_structure {
     field_name = "stripe_payment_intent_id"
     field_value = $input.stripe_payment_intent_id
   }
   ```
4. Does the `payment_table_structure` table exist?
5. After the db.get, is there a conditional that stops if found?

### Quick Fix Test:

**Temporarily add this at the very beginning:**
```javascript
api.lambda {
  code = """
    console.log("Payment intent to check: " + $input.stripe_payment_intent_id);
    throw new Error('400 error "TEST - Payment validation running"');
  """
}
```

If you get "TEST - Payment validation running" error, the endpoint is running.
If you DON'T get that error, you're hitting a different endpoint.

---

## Step 5: Test Feedback Manually

### Manual Test:

**Invalid Token:**
```bash
curl -X POST https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/review/invalid_token_12345/feedback \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid_token_12345", "rating": 5, "feedback_text": "test"}'
```

**Expected:** 404 error "Invalid review token"
**If it succeeds:** Token validation isn't running

**Invalid Rating:**
```bash
curl -X POST https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L/review/YOUR_VALID_TOKEN/feedback \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_VALID_TOKEN", "rating": 10, "feedback_text": "test"}'
```

**Expected:** 400 error "Rating must be between 1 and 5"
**If it succeeds:** Rating validation isn't running

---

## Step 6: Nuclear Option - Rebuild PATCH Endpoint

If PATCH still returns 500 after all this:

1. **Create a new endpoint:** `PATCH /question/{id}/test`
2. Copy ALL the steps from `id.md` one by one
3. Test the new endpoint
4. If it works, delete the old one and rename the new one

This ensures no hidden issues from previous versions.

---

## What to Share

If you're still stuck, share:
1. **Screenshot** of the PATCH /question/{id} function stack in Xano
2. **Xano logs** after running a test (the console.log output)
3. **Database schema** - List of tables and their columns
4. Result of the manual curl test for PATCH

This will help me pinpoint exactly what's wrong.
