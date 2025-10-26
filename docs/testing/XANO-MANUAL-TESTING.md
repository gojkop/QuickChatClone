# Xano Manual Testing Guide

Manual test payloads for debugging security endpoints in Xano's Run & Debug interface.

---

## Overview

When automated tests fail or you need to debug Xano endpoints, use these test payloads in Xano's "Run & Debug" feature to:
- Verify endpoint logic step-by-step
- Inspect variable values during execution
- Test security checks in isolation
- Debug conditional statements

**Location:** Xano Workspace → API Groups → Select Endpoint → Run & Debug

---

## Test 1: PATCH /question/{id} - Cross-Expert Ownership

**Endpoint:** Authentication API → `PATCH /question/{id}`

**Purpose:** Verify Expert A cannot update Expert B's question

### Setup

**URL Parameters:**
```json
{
  "id": 264
}
```

**Headers:**
```
Authorization: Bearer <EXPERT_A_TOKEN>
```
(Use Expert A's token from `/tests/.env`)

**Body:**
```json
{
  "status": "paid"
}
```

### Expected Result

❌ **Should FAIL** with 403 error:
```json
{
  "payload": "403 error \"Forbidden: Not your question to update\"",
  "statement": "Stop & Debug"
}
```

### What to Check

1. Click **Run** button in Xano
2. Check **Response** tab - What status code? (200 with error payload)
3. Check **Logs** tab - Does conditional fire?
4. If succeeds (200 without error), ownership check is broken

### Debugging Steps

Add this lambda **BEFORE** the ownership conditional:

```javascript
api.lambda {
  code = """
    console.log("Question expert_profile_id: " + $var.existing_question.expert_profile_id);
    console.log("Current expert_profile.id: " + $var.expert_profile.id);
    console.log("Are they equal? " + ($var.existing_question.expert_profile_id == $var.expert_profile.id));
  """
}
```

**Expected Debug Output:**
```
Question expert_profile_id: 138
Current expert_profile.id: 139
Are they equal? false
```

### Common Issues

- **Using $auth.user.id:** Error "Unable to locate auth: user" → Use `$auth.id`
- **No conditional:** Experts can update any question → Add ownership check
- **Lambda instead of conditional:** `throw new Error()` doesn't work → Use `debug.stop`
- **Wrong comparison:** Comparing wrong fields → Check FK relationships

---

## Test 2: POST /answer - Cross-Expert Answer

**Endpoint:** Authentication API → `POST /answer`

**Purpose:** Verify Expert B cannot answer Expert A's question

### Setup

**Headers:**
```
Authorization: Bearer <EXPERT_B_TOKEN>
```
(Use Expert B's token from `/tests/.env`)

**Body:**
```json
{
  "question_id": 279,
  "user_id": 138,
  "text_response": "Attempting to answer another expert's question"
}
```

### Expected Result

❌ **Should FAIL** with 403 error:
```json
{
  "payload": "403 error \"Forbidden: Not your question to answer\"",
  "statement": "Stop & Debug"
}
```

### What to Check

1. Response status (200 with error payload = correct)
2. Logs tab shows conditional evaluation
3. If succeeds, check which expert owns question 279

### Debugging Steps

Add this lambda **BEFORE** the ownership conditional:

```javascript
api.lambda {
  code = """
    console.log("Question expert_profile_id: " + $var.question.expert_profile_id);
    console.log("Current expert_profile.id: " + $var.expert_profile.id);
    console.log("User ID from input: " + $input.user_id);
    console.log("Match: " + ($var.question.expert_profile_id == $var.expert_profile.id));
  """
}
```

**Expected Debug Output:**
```
Question expert_profile_id: 139
Current expert_profile.id: 138
User ID from input: 138
Match: false
```

### Common Issues

- **Missing ownership check:** Any expert can answer → Add conditional
- **Wrong variable names:** Using `$question` instead of `$var.question` → Add `$var` prefix
- **Question already answered:** Error "Question already answered" → Use unanswered question

---

## Test 3: POST /question/quick-consult - Payment Reuse

**Endpoint:** Public API → `POST /question/quick-consult`

**Purpose:** Verify payment intent cannot be reused for two questions

### Step 1: Create First Question

**Body:**
```json
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "title": "Test Payment Reuse",
  "text": "First question",
  "stripe_payment_intent_id": "pi_test_reuse_check_123",
  "sla_hours_snapshot": 24
}
```

**Expected:** ✅ Success (200) - Question created

### Step 2: Reuse Same Payment

**Body:** (SAME payment intent ID)
```json
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "title": "Second Question",
  "text": "Second question with same payment",
  "stripe_payment_intent_id": "pi_test_reuse_check_123",
  "sla_hours_snapshot": 24
}
```

**Expected:** ❌ Fail (400) - Payment blocked

```json
{
  "payload": "400 error \"Payment already used for another question\"",
  "statement": "Stop & Debug"
}
```

### What to Check

1. **Step 1 succeeds:** Question created (200 OK)
2. **Step 2 fails:** Payment blocked (200 with error payload)
3. If Step 2 succeeds, payment check is missing or broken

### Debugging Steps

**Debug 1 - At beginning of endpoint (before any db.get):**

```javascript
api.lambda {
  code = """
    console.log("Checking payment: " + $input.stripe_payment_intent_id);
  """
}
```

**Debug 2 - After payment lookup:**

```javascript
api.lambda {
  code = """
    console.log("Payment found in DB: " + ($var.existing_payment != null));
    if ($var.existing_payment) {
      console.log("Payment record: " + JSON.stringify($var.existing_payment));
    } else {
      console.log("Payment is new - OK to proceed");
    }
  """
}
```

**Expected Output (Step 2):**
```
Checking payment: pi_test_reuse_check_123
Payment found in DB: true
Payment record: {"id":123,"stripe_payment_intent_id":"pi_test_reuse_check_123",...}
```

### Common Issues

- **Payment check is too late:** Happens AFTER `db.add question` → Move to beginning
- **Wrong table name:** Looking for `payments` instead of `payment_table_structure` → Check table name
- **No conditional after lookup:** Payment found but no error thrown → Add conditional with `debug.stop`
- **Wrong field name:** Using `payment_intent_id` instead of `stripe_payment_intent_id` → Match field names

### Critical Requirements

1. Payment check must be **FIRST STEP** (before db.add question)
2. Must use table name `payment_table_structure`
3. Must use field name `stripe_payment_intent_id`
4. Must have conditional: `if ($var.existing_payment != null) { debug.stop }`

---

## Test 4: POST /review/{token}/feedback - Invalid Token

**Endpoint:** Public API → `POST /review/{token}/feedback`

**Purpose:** Verify random/invalid tokens are rejected

### Setup

**URL Parameters:**
```json
{
  "token": "invalid_token_xyz123"
}
```

**Body:**
```json
{
  "token": "invalid_token_xyz123",
  "rating": 5,
  "feedback_text": "Test feedback"
}
```

### Expected Result

❌ **Should FAIL** with 404 error:
```json
{
  "payload": "404 error \"Invalid review token\"",
  "statement": "Stop & Debug"
}
```

### What to Check

1. Returns 200 with error payload (correct)
2. If returns 200 without error, validation is broken

### Debugging Steps

Add this lambda **AFTER** the `db.get question`:

```javascript
api.lambda {
  code = """
    console.log("Token from input: " + $input.token);
    console.log("Question found: " + ($var.question != null));
    if ($var.question) {
      console.log("Question ID: " + $var.question.id);
    } else {
      console.log("No question found with this token");
    }
  """
}
```

**Expected Output:**
```
Token from input: invalid_token_xyz123
Question found: false
No question found with this token
```

### Common Issues

- **No validation:** Missing conditional after db.get → Add `if ($var.question == null) { debug.stop }`
- **Wrong field lookup:** Using `token` instead of `playback_token_hash` → Check field name
- **Validation too late:** Happens after feedback saved → Move before db.edit

---

## Test 5: POST /review/{token}/feedback - Invalid Rating

**Endpoint:** Public API → `POST /review/{token}/feedback`

**Purpose:** Verify only ratings 1-5 are accepted

### Setup

**URL Parameters:**
```json
{
  "token": "71890360-1fc6-4f26-9b5d-7338003b625c"
}
```
(Use actual valid token from `/tests/.env`)

**Body:**
```json
{
  "token": "71890360-1fc6-4f26-9b5d-7338003b625c",
  "rating": 10,
  "feedback_text": "Testing invalid rating"
}
```

### Expected Result

❌ **Should FAIL** with 400 error:
```json
{
  "payload": "400 error \"Rating must be between 1 and 5\"",
  "statement": "Stop & Debug"
}
```

### What to Check

1. Returns 200 with error payload (correct)
2. If returns 200 without error, rating validation is broken

### Debugging Steps

Add this lambda **BEFORE** the rating conditional:

```javascript
api.lambda {
  code = """
    console.log("Rating from input: " + $input.rating);
    console.log("Rating type: " + typeof($input.rating));
    console.log("Is valid (1-5)? " + ($input.rating >= 1 && $input.rating <= 5));
    console.log("Too low? " + ($input.rating < 1));
    console.log("Too high? " + ($input.rating > 5));
  """
}
```

**Expected Output:**
```
Rating from input: 10
Rating type: number
Is valid (1-5)? false
Too low? false
Too high? true
```

### Common Issues

**Issue 1: OR operator (||) not working:**

If this conditional doesn't work:
```javascript
conditional {
  if ($input.rating < 1 || $input.rating > 5) {
    debug.stop { value = '400 error "Rating must be between 1 and 5"' }
  }
}
```

Split into two conditionals:
```javascript
conditional {
  if ($input.rating < 1) {
    debug.stop { value = '400 error "Rating must be between 1 and 5"' }
  }
}

conditional {
  if ($input.rating > 5) {
    debug.stop { value = '400 error "Rating must be between 1 and 5"' }
  }
}
```

**Issue 2: No rating validation:**
- Missing conditional → Add rating range check

**Issue 3: Validation too late:**
- Happens after db.edit → Move before database update

---

## Test 6: POST /question/deep-dive - Payment Reuse

**Endpoint:** Public API → `POST /question/deep-dive`

**Purpose:** Verify payment intent cannot be reused for Deep Dive offers

### Setup

Same as Test 3, but use `/question/deep-dive` endpoint.

**Step 1: Create first offer**
```json
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "title": "Test Deep Dive Payment Reuse",
  "text": "First Deep Dive question",
  "stripe_payment_intent_id": "pi_test_dd_reuse_456",
  "proposed_price_cents": 50000,
  "asker_message": "First offer",
  "sla_hours_snapshot": 48
}
```

**Step 2: Reuse same payment**
```json
{
  "expert_profile_id": 139,
  "payer_email": "test@example.com",
  "title": "Second Deep Dive Question",
  "text": "Second Deep Dive question",
  "stripe_payment_intent_id": "pi_test_dd_reuse_456",
  "proposed_price_cents": 75000,
  "asker_message": "Second offer",
  "sla_hours_snapshot": 48
}
```

**Expected:**
- Step 1: ✅ Success (offer created)
- Step 2: ❌ Fail (payment blocked)

---

## General Debugging Tips

### Enable Console Logging

1. Add `api.lambda` blocks with `console.log()`
2. Run endpoint in Run & Debug
3. Check **Logs** tab for output
4. Remove debug code after fixing

### Check Variable Names

- Use `$var.variableName` for variables from previous steps
- Use `$input.fieldName` for request inputs
- Use `$auth.id` for authenticated user ID
- Never use bare variable names (won't work)

### Test Conditionals

Add logging before conditionals:
```javascript
api.lambda {
  code = """
    console.log("About to check conditional");
    console.log("Value: " + $var.some_value);
  """
}

conditional {
  if ($var.some_value == null) {
    console.log("Conditional FIRED - stopping");
    debug.stop { value = '404 error "Not found"' }
  }
}

api.lambda {
  code = """
    console.log("Conditional PASSED - continuing");
  """
}
```

### Verify Database Queries

After `db.get`:
```javascript
api.lambda {
  code = """
    console.log("Record found: " + ($var.record != null));
    if ($var.record) {
      console.log("Record ID: " + $var.record.id);
    }
  """
}
```

### Test Authentication

At the beginning of authenticated endpoints:
```javascript
api.lambda {
  code = """
    console.log("Auth ID: " + $auth.id);
    console.log("Auth email: " + $auth.email);
  """
}
```

---

## Reporting Back

When reporting test results, include:

1. **Test name** (which test from above)
2. **Result:** ✅ Passed or ❌ Failed
3. **Response status code**
4. **Response payload**
5. **Console logs** from Logs tab
6. **Expected vs Actual** behavior

**Example:**

```
Test 3: Payment Reuse Prevention
Result: ❌ Failed - Second question was created successfully
Response: 200 OK
Payload: {"question_id": 295, "success": true}
Console logs:
  - Checking payment: pi_test_reuse_check_123
  - Payment found in DB: false
Expected: Should block duplicate payment
Actual: Payment not found in database (lookup failing)
```

---

## Related Documentation

- [SECURITY-VALIDATION-GUIDE.md](./SECURITY-VALIDATION-GUIDE.md) - Automated test suite documentation
- [README.md](./README.md) - Main testing documentation
- [BEST-PRACTICES.md](./BEST-PRACTICES.md) - Testing best practices

---

**Last Updated:** October 26, 2025
**Test Coverage:** 6 security scenarios
**Status:** ✅ Production Ready
