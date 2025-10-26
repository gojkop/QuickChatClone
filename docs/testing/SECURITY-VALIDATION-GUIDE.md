# Security Validation Test Suite

Complete documentation for QuickChat's automated security validation tests.

---

## Overview

The security validation suite tests 16 critical security scenarios to ensure:
- Only authenticated users can modify resources
- Experts can only access their own questions/answers
- Payment intents cannot be reused
- Invalid tokens are rejected
- Input validation prevents bad data

**Status:** ✅ Production Ready (October 26, 2025)

**Total Tests:** 12
- Authentication: 3 tests
- Ownership: 2 tests
- Payment validation: 3 tests
- Input validation: 2 tests
- Token security: 2 tests

---

## Test Suite Details

### Suite 1: PATCH /question/{id} - Authentication

**Endpoint:** `PATCH /question/{id}` (Xano Authentication API)

**Tests:**

#### Test 1.1: Authentication Required
- **Purpose:** Verify unauthenticated requests are rejected
- **Method:** PATCH without Authorization header
- **Expected:** HTTP 401 Unauthorized
- **Xano Response:** May return 401 or error in payload

#### Test 1.2: Expert Can Update Own Question
- **Purpose:** Verify authenticated expert can update their own question
- **Method:** PATCH with valid token + own question ID
- **Expected:** HTTP 200 with updated question data
- **Verifies:** `$auth.id` correctly identifies expert

#### Test 1.3: Response Hides playback_token_hash
- **Purpose:** Verify sensitive review token is never exposed to experts
- **Method:** Check response from Test 1.2
- **Expected:** `playback_token_hash` field is null or undefined
- **Security:** Prevents experts from accessing asker's review page

**Implementation Details:**

```javascript
// Xano endpoint: PATCH /question/{id}
auth = "user"

stack {
  db.get expert_profile {
    field_name = "user_id"
    field_value = $auth.id  // Must use $auth.id, not $auth.user.id
  } as $expert_profile

  conditional {
    if ($expert_profile == null) {
      debug.stop { value = '404 error "Expert profile not found"' }
    }
  }

  db.get question {
    field_name = "id"
    field_value = $input.id
  } as $existing_question

  conditional {
    if ($existing_question == null) {
      debug.stop { value = '404 error "Question not found"' }
    }
  }

  conditional {
    if ($existing_question.expert_profile_id != $expert_profile.id) {
      debug.stop { value = '403 error "Forbidden: Not your question to update"' }
    }
  }

  // Continue with update...
}
```

**Common Issues:**
- Using `$auth.user.id` instead of `$auth.id` → "Unable to locate auth: user"
- Missing ownership check → Experts can update other experts' questions
- Returning `playback_token_hash` in response → Exposes sensitive tokens

---

### Suite 2: PATCH /question/{id} - Ownership

**Endpoint:** `PATCH /question/{id}` (Xano Authentication API)

**Tests:**

#### Test 2.1: Cross-Expert Update Blocked
- **Purpose:** Verify Expert B cannot update Expert A's question
- **Method:** PATCH with Expert B token + Expert A question ID
- **Expected:** HTTP 403 or Xano error "Forbidden: Not your question to update"
- **Security:** Prevents unauthorized modifications

**Test Flow:**
1. Get Expert B's auth token from `.env`
2. Get Expert A's question ID from `.env`
3. Attempt PATCH request with mismatched credentials
4. Verify rejection with 403 error

**Implementation:**
```javascript
conditional {
  if ($existing_question.expert_profile_id != $expert_profile.id) {
    debug.stop {
      value = '403 error "Forbidden: Not your question to update"'
    }
  }
}
```

**Test Code:**
```javascript
const res = await request(`${CONFIG.XANO_AUTH_API}/question/${CONFIG.EXPERT_A_QUESTION_ID}`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${CONFIG.EXPERT_B_TOKEN}` },
  body: JSON.stringify({ status: 'paid' }),
});

if (res.status === 403 || isXanoError(res, '403')) {
  logTest('Cross-expert update blocked', 'PASS', 'Ownership violation prevented');
} else if (res.ok) {
  logTest('Cross-expert update blocked', 'FAIL', '⚠️  OWNERSHIP CHECK FAILED!');
}
```

---

### Suite 3: POST /answer - Security

**Endpoint:** `POST /answer` (Xano Authentication API)

**Tests:**

#### Test 3.1: Cross-Expert Answer Blocked
- **Purpose:** Verify Expert B cannot answer Expert A's question
- **Method:** Create fresh question for Expert A, attempt answer with Expert B token
- **Expected:** HTTP 403 or Xano error "Forbidden: Not your question to answer"
- **Security:** Prevents experts from answering other experts' questions

**Test Flow:**
1. Create new question assigned to Expert A via POST /question/quick-consult
2. Extract `question_id` from response
3. Attempt POST /answer with Expert B token + new question_id
4. Verify rejection with 403 error

**Why Dynamic Creation:**
- Prevents "Question already answered" false failures
- Ensures fresh test data every run
- Tests complete flow including question creation

**Implementation:**
```javascript
// In Xano: POST /answer
stack {
  db.get question {
    field_name = "id"
    field_value = $input.question_id
  } as $question

  db.get expert_profile {
    field_name = "user_id"
    field_value = $input.user_id
  } as $expert_profile

  conditional {
    if ($question.expert_profile_id != $expert_profile.id) {
      debug.stop {
        value = '403 error "Forbidden: Not your question to answer"'
      }
    }
  }

  // Continue with answer creation...
}
```

**Test Code:**
```javascript
// Step 1: Create fresh question
const createRes = await request(`${CONFIG.XANO_PUBLIC_API}/question/quick-consult`, {
  method: 'POST',
  body: JSON.stringify({
    expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
    payer_email: 'test@example.com',
    title: 'Test Question for Answer Security',
    text: 'This question is for testing cross-expert answer blocking',
    stripe_payment_intent_id: `pi_test_answer_security_${Date.now()}`,
    sla_hours_snapshot: 24,
  }),
});

const testQuestionId = createRes.data.question_id;

// Step 2: Expert B tries to answer Expert A's question
const res = await request(`${CONFIG.XANO_AUTH_API}/answer`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${CONFIG.EXPERT_B_TOKEN}` },
  body: JSON.stringify({
    question_id: testQuestionId,
    user_id: 138, // Expert B's user_id
    text_response: 'Attempting to answer another expert\'s question',
  }),
});

if (res.status === 403 || isXanoError(res, '403')) {
  logTest('Cross-expert answer blocked', 'PASS', 'Ownership violation prevented');
}
```

---

### Suite 4: Payment Intent Validation - Quick Consult

**Endpoint:** `POST /question/quick-consult` (Xano Public API)

**Tests:**

#### Test 4.1: Payment Reuse Prevention
- **Purpose:** Verify same payment intent cannot create two questions
- **Method:** Submit two questions with identical `stripe_payment_intent_id`
- **Expected:** First succeeds, second returns 400 "Payment already used"
- **Security:** Prevents payment fraud and duplicate charges

**Test Flow:**
1. Generate unique payment intent ID: `pi_test_qc_${timestamp}`
2. Submit first question → Should succeed
3. Submit second question with same payment ID → Should fail
4. Verify 400 error with "Payment already used" message

**Implementation:**
```javascript
// In Xano: POST /question/quick-consult
stack {
  // VERY FIRST STEP - Check payment before creating question
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

  // Continue with question creation...
}
```

**Test Code:**
```javascript
const paymentIntentId = `pi_test_qc_${Date.now()}`;

// First submission
const res1 = await request(`${CONFIG.XANO_PUBLIC_API}/question/quick-consult`, {
  method: 'POST',
  body: JSON.stringify({
    expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
    payer_email: 'test@example.com',
    title: 'First Question',
    text: 'First question with payment',
    stripe_payment_intent_id: paymentIntentId,
    sla_hours_snapshot: 24,
  }),
});

// Second submission (should fail)
const res2 = await request(`${CONFIG.XANO_PUBLIC_API}/question/quick-consult`, {
  method: 'POST',
  body: JSON.stringify({
    expert_profile_id: CONFIG.EXPERT_A_PROFILE_ID,
    payer_email: 'test@example.com',
    title: 'Second Question',
    text: 'Second question with same payment',
    stripe_payment_intent_id: paymentIntentId,  // SAME payment ID
    sla_hours_snapshot: 24,
  }),
});

if (res2.status === 400 || isXanoError(res2, '400')) {
  logTest('Payment reuse prevention', 'PASS', 'Duplicate payment blocked');
}
```

#### Test 4.2: New Payment Intent Accepted
- **Purpose:** Verify fresh payment intent creates question successfully
- **Method:** Submit question with unique payment ID
- **Expected:** HTTP 200 with question_id in response
- **Verifies:** Normal flow works correctly

#### Test 4.3: Question Creation Returns Token to Asker
- **Purpose:** Verify asker receives review token for accessing their question
- **Method:** Check response from Test 4.2
- **Expected:** `playback_token` field exists in response (NOT playback_token_hash)
- **Security:** Asker gets token, but experts never see it

**Common Issues:**
- Payment check happens AFTER question creation → Too late, question already created
- Wrong table name → `payment_table_structure` not `payments`
- Missing payment check entirely → No protection

---

### Suite 5: Payment Intent Validation - Deep Dive

**Endpoint:** `POST /question/deep-dive` (Xano Public API)

**Tests:**

#### Test 5.1: Payment Reuse Prevention (Deep Dive)
- **Purpose:** Verify same payment intent cannot create two Deep Dive offers
- **Method:** Submit two offers with identical `stripe_payment_intent_id`
- **Expected:** First succeeds, second returns 400 "Payment already used"
- **Security:** Prevents payment fraud for custom pricing tier

**Test Flow:**
Same as Quick Consult but uses `/question/deep-dive` endpoint

**Implementation:**
```javascript
// In Xano: POST /question/deep-dive
stack {
  // VERY FIRST STEP - Check payment before creating offer
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

  // Continue with offer creation...
}
```

---

### Suite 6: Feedback Validation

**Endpoint:** `POST /review/{token}/feedback` (Xano Public API)

**Tests:**

#### Test 6.1: Invalid Review Token Rejected
- **Purpose:** Verify random/invalid tokens cannot submit feedback
- **Method:** POST feedback with non-existent token
- **Expected:** HTTP 404 or Xano error "Invalid review token"
- **Security:** Prevents unauthorized feedback submissions

**Implementation:**
```javascript
// In Xano: POST /review/{token}/feedback
stack {
  db.get question {
    field_name = "playback_token_hash"
    field_value = $input.token
  } as $question

  conditional {
    if ($question == null) {
      debug.stop {
        value = '404 error "Invalid review token"'
      }
    }
  }

  // Continue with feedback submission...
}
```

**Test Code:**
```javascript
const res = await request(`${CONFIG.XANO_PUBLIC_API}/review/invalid_token_xyz123/feedback`, {
  method: 'POST',
  body: JSON.stringify({
    token: 'invalid_token_xyz123',
    rating: 5,
    feedback_text: 'Test feedback',
  }),
});

if (res.status === 404 || isXanoError(res, '404')) {
  logTest('Invalid review token rejected', 'PASS', 'Invalid token blocked');
}
```

#### Test 6.2: Rating Range Validation
- **Purpose:** Verify only ratings 1-5 are accepted
- **Method:** POST feedback with rating=10
- **Expected:** HTTP 400 or Xano error "Rating must be between 1 and 5"
- **Security:** Prevents data corruption and invalid feedback

**Implementation:**
```javascript
conditional {
  if ($input.rating < 1 || $input.rating > 5) {
    debug.stop {
      value = '400 error "Rating must be between 1 and 5"'
    }
  }
}
```

**Test Code:**
```javascript
const res = await request(`${CONFIG.XANO_PUBLIC_API}/review/${CONFIG.VALID_REVIEW_TOKEN}/feedback`, {
  method: 'POST',
  body: JSON.stringify({
    token: CONFIG.VALID_REVIEW_TOKEN,
    rating: 10,  // Invalid rating
    feedback_text: 'Testing invalid rating',
  }),
});

if (res.status === 400 || isXanoError(res, '400')) {
  logTest('Rating range validation', 'PASS', 'Invalid rating rejected');
}
```

---

### Suite 7: Review Token Access

**Endpoint:** `GET /review/{token}` (Xano Public API)

**Tests:**

#### Test 7.1: Review Page Returns Token to Asker
- **Purpose:** Verify asker can access their question via review token
- **Method:** GET /review/{valid_token}
- **Expected:** HTTP 200 with question data including playback_token
- **Security:** Token-based access for unauthenticated askers

**Implementation:**
```javascript
// In Xano: GET /review/{token}
stack {
  db.get question {
    field_name = "playback_token_hash"
    field_value = $input.token
  } as $question

  conditional {
    if ($question == null) {
      debug.stop {
        value = '404 error "Invalid review token"'
      }
    }
  }

  // Return question with playback_token (not hash)
  api.lambda {
    code = """
      var safe_question = {
        id: $var.question.id,
        title: $var.question.title,
        text: $var.question.text,
        playback_token: $var.question.playback_token_hash,  // Return to asker
        // ... other fields
      };
      return safe_question;
    """
  } as $safe_response
}
```

**Test Code:**
```javascript
const res = await request(`${CONFIG.XANO_PUBLIC_API}/review/${CONFIG.VALID_REVIEW_TOKEN}`, {
  method: 'GET',
});

if (res.ok && res.data?.playback_token) {
  logTest('Review page returns token to asker', 'PASS', 'Asker can access review page');
}
```

---

## Xano Error Handling

### debug.stop Behavior

Xano's `debug.stop` returns HTTP 200 with error in JSON payload:

```json
{
  "payload": "403 error \"Forbidden: Not your question to update\"",
  "statement": "Stop & Debug"
}
```

**NOT** standard HTTP error codes (401, 403, 404, 400).

### isXanoError() Helper

The test suite includes a helper function to detect Xano errors:

```javascript
function isXanoError(res, errorCode) {
  const payload = res.data?.payload || res.data?.message || '';
  const hasError = payload.includes('error');

  if (errorCode) {
    // Check for specific error code (e.g., "403", "404", "400")
    return hasError && payload.includes(errorCode);
  }

  return hasError;
}
```

### Test Assertions

All tests check BOTH HTTP status codes AND Xano error format:

```javascript
if (res.status === 403 || isXanoError(res, '403')) {
  logTest('Test name', 'PASS', 'Success message');
} else if (res.ok && !isXanoError(res)) {
  logTest('Test name', 'FAIL', '⚠️  Security check failed!');
}
```

---

## Configuration

### Required Environment Variables

```bash
# Xano API endpoints
XANO_AUTH_API=https://xlho-4syv-navp.n7e.xano.io/api:XEsV5Zbo
XANO_PUBLIC_API=https://xlho-4syv-navp.n7e.xano.io/api:BQW1GS7L

# Expert A (required)
EXPERT_A_TOKEN=eyJhbGc...
EXPERT_A_PROFILE_ID=139
EXPERT_A_QUESTION_ID=264

# Expert B (optional - enables cross-expert tests)
EXPERT_B_TOKEN=eyJhbGc...
EXPERT_B_PROFILE_ID=138
EXPERT_B_QUESTION_ID=279

# Review token (for feedback tests)
VALID_REVIEW_TOKEN=71890360-1fc6-4f26-9b5d-7338003b625c
```

### Getting Test Tokens

**Auth Tokens:**
1. Sign in to QuickChat in browser
2. Open DevTools → Console
3. Run: `localStorage.getItem('qc_token')`
4. Copy entire token (starts with `eyJ`)

**Review Token:**
1. Create a test question via QuickChat
2. Check email for review link or query database
3. Extract token from URL: `/r/{token}`

**Profile IDs:**
1. Sign in as expert
2. Go to `/expert` dashboard
3. Open Network tab → Find `/me/questions` call
4. Check response for `expert_profile_id`

---

## Running Tests

### Full Test Suite

```bash
./tests/run-security-tests.sh
```

### Individual Test Suites

Not currently supported - run full suite only.

### Skipped Tests

If `EXPERT_B_TOKEN` is not configured, cross-expert tests are skipped:
- Test 2.1: Cross-expert update blocked
- Test 3.1: Cross-expert answer blocked

**Output:**
```
[SKIP] Cross-expert update blocked
  → EXPERT_B not configured - test skipped
```

---

## Troubleshooting

### All Tests Failing with 401

**Problem:** Invalid or expired auth tokens

**Solution:**
1. Get fresh tokens from browser localStorage
2. Update `/tests/.env` file
3. Ensure token includes full JWT (starts with `eyJ`)

### Cross-Expert Tests Failing

**Problem:** Expert B can update Expert A's questions

**Solution:**
1. Check Xano endpoint includes ownership check
2. Verify conditional compares `expert_profile_id` correctly
3. Test manually in Xano Run & Debug (see XANO-MANUAL-TESTING.md)

### Payment Tests Failing

**Problem:** First submission fails with "Payment already used"

**Solution:**
1. Check if payment_intent_id already exists in database
2. Use dynamic timestamps: `pi_test_${Date.now()}`
3. Verify payment check happens BEFORE question creation

### Rating Validation Failing

**Problem:** Invalid rating (10) is accepted

**Solution:**
1. Check conditional uses correct syntax: `$input.rating < 1 || $input.rating > 5`
2. Verify conditional is BEFORE answer update
3. Test with split conditionals if `||` doesn't work:
```javascript
conditional {
  if ($input.rating < 1) {
    debug.stop { value = '400 error "Rating too low"' }
  }
}
conditional {
  if ($input.rating > 5) {
    debug.stop { value = '400 error "Rating too high"' }
  }
}
```

### Tests Pass but Security Broken

**Problem:** Tests show PASS but manual testing reveals issues

**Solution:**
1. Test manually in Xano Run & Debug
2. Check test is using correct question IDs
3. Verify test assertions are correct (not checking wrong condition)
4. Add logging to see actual response values

---

## Test Maintenance

### When to Update Tests

- New security-sensitive endpoints added
- Authentication logic changes
- Ownership checks modified
- Payment flow changes
- Input validation rules change

### Adding New Tests

1. Create test function in `security-validation.cjs`
2. Add to `runAllTests()` function
3. Update this documentation
4. Update test count in README.md

### Deprecating Tests

1. Mark test as skipped with reason
2. Update documentation
3. Remove after grace period (1 month)

---

## Success Criteria

All 12 tests must pass for production deployment:

```
✓ Passed:  12
✗ Failed:  0
⊘ Skipped: 0 (or up to 2 if EXPERT_B not configured)
Total: 12

ALL SECURITY TESTS PASSED!
Your endpoints are secure and ready for production.
```

Any failures require investigation and fixes before deployment.

---

## Related Documentation

- [XANO-MANUAL-TESTING.md](./XANO-MANUAL-TESTING.md) - Manual testing procedures
- [BEST-PRACTICES.md](./BEST-PRACTICES.md) - Testing best practices
- [README.md](./README.md) - Main testing documentation

---

**Last Updated:** October 26, 2025
**Test Suite Version:** 1.0.0
**Total Tests:** 12
**Status:** ✅ Production Ready
