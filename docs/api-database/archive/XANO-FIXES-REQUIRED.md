# Xano Fixes Required - Action Plan

**Date:** October 26, 2025
**Test Results:** 4 PASSED, 6 FAILED, 1 SKIPPED

---

## Critical Issue: Authentication Scope Problem

### Problem: PATCH /question/{id} in Wrong API Group

**Current Setup:**
- Endpoint location: **Public API** (api:BQW1GS7L)
- Endpoint has: `auth = "user"` (requires authentication)
- Expert tokens created in: **Authentication API** (api:3B14WLbJ)

**Why This Fails:**
In Xano, authentication tokens are scoped to the API group where the user logged in. Your expert tokens work only in the Authentication API, not in Public API.

**Solution:**
```
Move PATCH /question/{id} from Public API → Authentication API
```

**How to Fix in Xano:**
1. Open Public API group (api:BQW1GS7L)
2. Find `PATCH /question/{id}` endpoint
3. Copy the entire function stack
4. Open Authentication API group (api:3B14WLbJ)
5. Create new endpoint `PATCH /question/{id}` with `auth = "user"`
6. Paste the function stack
7. Delete the endpoint from Public API
8. Test with your auth token

---

## Issue #2: POST /answer - Ownership Check Bypass ⚠️

**Test Result:** Expert B successfully answered Expert A's question

**Current Location:** Authentication API ✓ (correct)

**Diagnosis Needed:**
Your `answer.md` file shows the ownership check is implemented correctly:

```javascript
api.lambda {
  code = """
    // Ensure expert owns this question
    if ($var.question.expert_profile_id !== $var.expert_profile.id) {
      throw new Error('403 error "Forbidden: Not your question to answer"');
    }
  """
}
```

**Possible Causes:**
1. The lambda code wasn't actually added to Xano (doc vs reality mismatch)
2. The lambda is commented out or disabled
3. The variable references are wrong (should use `$var.` prefix)
4. The expert_profile lookup is failing silently

**How to Verify in Xano:**
1. Open Authentication API → `POST /answer` endpoint
2. Check if the ownership check lambda exists
3. Check if it's BEFORE the `db.add answer` step
4. Verify variable names use `$var.` prefix
5. Add console.log to see if it's executing:
   ```javascript
   console.log("Checking ownership: question.expert_profile_id=" +
               $var.question.expert_profile_id +
               ", expert_profile.id=" +
               $var.expert_profile.id);
   ```

---

## Issue #3 & #4: Payment Reuse Prevention Failing ⚠️

**Test Results:**
- Quick Consult: ⚠️ PAYMENT REUSE ALLOWED
- Deep Dive: ⚠️ PAYMENT REUSE ALLOWED

**Current Location:** Both in Public API ✓ (correct)

**Your Implementation (from quick-consult.md and deep-dive.md):**
```javascript
db.get payment_table_structure {
  field_name = "stripe_payment_intent_id"
  field_value = $input.stripe_payment_intent_id
} as $existing_payment

conditional {
  if ($existing_payment != null) {
    debug.stop {
      value = '400 error "Payment already used for another question"'
    }
  }
}
```

**This looks correct!** But the test is failing, which means:

**Possible Causes:**
1. The check wasn't actually added to Xano
2. The check is after `db.add question` instead of before
3. The `payment_table_structure` table doesn't exist
4. The query is failing silently

**How to Verify in Xano:**
1. Open Public API → `POST /question/quick-consult`
2. Verify the payment check is **STEP 1** (before creating question)
3. Check if `payment_table_structure` table exists in database
4. Add console.log to see if check is running:
   ```javascript
   console.log("Checking payment: " + $input.stripe_payment_intent_id +
               ", found existing: " + ($existing_payment != null));
   ```
5. Test by manually creating two questions with same payment intent ID

**Alternative Solution (if payment_table_structure doesn't exist):**
Query the `question` table instead:
```javascript
db.get question {
  field_name = "payment_intent_id"
  field_value = $input.stripe_payment_intent_id
} as $existing_question

conditional {
  if ($existing_question != null) {
    debug.stop {
      value = '400 error "Payment already used for another question"'
    }
  }
}
```

---

## Issue #5 & #6: Feedback Validation Failing ⚠️

**Test Results:**
- Invalid token accepted ⚠️
- Invalid rating (10) accepted ⚠️

**Current Location:** Public API ✓ (correct)

**Your Implementation (from review_feedback.md):**
```javascript
// Token validation
conditional {
  if ($question == null) {
    debug.stop {
      value = '404 error "Invalid review token"'
    }
  }
}

// Rating validation
conditional {
  if ($input.rating < 1 || $input.rating > 5) {
    debug.stop {
      value = '400 error "Rating must be between 1 and 5"'
    }
  }
}
```

**This also looks correct!** But tests are failing.

**Possible Causes:**
1. The validation wasn't added to Xano
2. The conditionals are in wrong order or not being executed
3. Xano is not parsing the `if` conditions correctly

**How to Verify in Xano:**
1. Open Public API → `POST /review/{token}/feedback`
2. Verify token validation exists BEFORE `db.edit answer`
3. Verify rating validation exists BEFORE `db.edit answer`
4. Add console.log statements:
   ```javascript
   console.log("Token: " + $input.token + ", Question found: " + ($question != null));
   console.log("Rating: " + $input.rating + ", Valid: " + ($input.rating >= 1 && $input.rating <= 5));
   ```
5. Test manually with invalid token: `POST /review/invalid_token_12345/feedback`
6. Test manually with invalid rating: `{"rating": 10, "feedback_text": "test"}`

---

## Summary: What to Do Now

### Step 1: Fix Authentication Issue (Critical)
- [ ] Move `PATCH /question/{id}` from Public API → Authentication API
- [ ] Run tests again: `./tests/run-security-tests.sh`
- [ ] Expect: PATCH tests should now pass

### Step 2: Debug Ownership Check
- [ ] Open `POST /answer` in Xano Authentication API
- [ ] Add console.log to ownership check lambda
- [ ] Manually test: Try to answer another expert's question
- [ ] Check Xano logs for console output

### Step 3: Debug Payment Validation
- [ ] Open `POST /question/quick-consult` in Xano Public API
- [ ] Verify payment check is STEP 1 (first thing)
- [ ] Add console.log to see if check executes
- [ ] Manually test: Try to submit same payment intent twice

### Step 4: Debug Feedback Validation
- [ ] Open `POST /review/{token}/feedback` in Xano Public API
- [ ] Add console.log statements to validations
- [ ] Manually test with invalid token and rating
- [ ] Check Xano logs for console output

---

## Testing After Fixes

After each fix, run the test suite:
```bash
./tests/run-security-tests.sh
```

Check the latest log file:
```bash
cat tests/logs/security-test-*.log | tail -100
```

---

## Expected Final Result

When all fixes are complete:
```
✓ Passed:  11
✗ Failed:  0
⊘ Skipped: 0
Total: 11

ALL SECURITY TESTS PASSED!
Your endpoints are secure and ready for production.
```

---

## Questions?

If you need help with any of these fixes:
1. Share a screenshot of the Xano endpoint function stack
2. Share the Xano logs after adding console.log statements
3. I can provide more specific debugging steps

The key is to verify that what's in your documentation files (`*.md`) actually matches what's in your live Xano workspace.
